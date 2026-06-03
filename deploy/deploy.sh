#!/usr/bin/env bash
# deploy.sh — one-shot bootstrap for a fresh Ubuntu 22.04 VPS.
# Run as root on the VPS:
#   curl -fsSL https://raw.githubusercontent.com/<you>/<repo>/main/deploy/deploy.sh -o deploy.sh
#   chmod +x deploy.sh
#   GITHUB_REPO=git@github.com:<you>/<repo>.git DOMAIN=thelawncareworkshop.com ADMIN_EMAIL=you@example.com ./deploy.sh
#
# After it finishes, edit /var/www/lawncare/.env with your real secrets and run:
#   cd /var/www/lawncare && npm run db:push && npm run db:seed
#   pm2 restart lawncare

set -euo pipefail

GITHUB_REPO="${GITHUB_REPO:?Set GITHUB_REPO=git@github.com:owner/repo.git}"
DOMAIN="${DOMAIN:-thelawncareworkshop.com}"
ADMIN_EMAIL="${ADMIN_EMAIL:?Set ADMIN_EMAIL=you@example.com (for Let's Encrypt)}"
APP_DIR="/var/www/lawncare"

# -----------------------------------------------------------------------------
# SAFETY GUARD: refuse to run on an already-deployed server.
# This script is only for the FIRST bootstrap of a fresh VPS.
# For subsequent updates, use:  cd /var/www/lawncare && ./deploy/update.sh
# -----------------------------------------------------------------------------
if [ -f "$APP_DIR/.env" ] && [ "${FORCE_REBOOTSTRAP:-0}" != "1" ]; then
  echo "============================================================"
  echo "  REFUSING TO RUN — $APP_DIR/.env already exists."
  echo ""
  echo "  This script is the FIRST-TIME bootstrap. It generates new"
  echo "  secrets and could overwrite your live config."
  echo ""
  echo "  To deploy an update (data-safe), run instead:"
  echo "    cd $APP_DIR && ./deploy/update.sh"
  echo ""
  echo "  Only set FORCE_REBOOTSTRAP=1 if you really mean to rebuild"
  echo "  from scratch (this will NOT drop your database, but will"
  echo "  overwrite .env with new secrets)."
  echo "============================================================"
  exit 1
fi
DB_NAME="lawncare"
DB_USER="lawncare"
DB_PASS="$(openssl rand -hex 24)"
JWT_SECRET="$(openssl rand -hex 64)"
RC_WEBHOOK="$(openssl rand -hex 32)"

echo "==> Updating apt and installing base packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl ca-certificates gnupg lsb-release ufw git nginx postgresql postgresql-contrib certbot python3-certbot-nginx ffmpeg

echo "==> Installing Node.js 20 (NodeSource)"
if ! command -v node >/dev/null || [[ "$(node -v)" != v20* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo "==> Installing PM2 globally"
npm install -g pm2

echo "==> Configuring firewall (SSH + HTTP + HTTPS only)"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> Setting up PostgreSQL database '$DB_NAME'"
sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

echo "==> Cloning repo into $APP_DIR"
mkdir -p "$APP_DIR"
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$GITHUB_REPO" "$APP_DIR"
else
  git -C "$APP_DIR" pull
fi

echo "==> Writing $APP_DIR/.env (REVIEW THIS FILE AFTER DEPLOY)"
cat > "$APP_DIR/.env" <<EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@127.0.0.1:5432/$DB_NAME
JWT_SECRET=$JWT_SECRET
REVENUECAT_WEBHOOK_AUTH=$RC_WEBHOOK

# --- Local object storage (uploaded images / videos / docs) ---
LOCAL_STORAGE_DIR=/var/www/lawncare/uploads-objects

# --- Optional: fill these in if/when you need them ---
# STRIPE_SECRET_KEY=
# STRIPE_WEBHOOK_SECRET=
# FIREBASE_PROJECT_ID=
# FIREBASE_CLIENT_EMAIL=
# FIREBASE_PRIVATE_KEY=
EOF
chmod 600 "$APP_DIR/.env"

echo "==> Creating uploads dir"
mkdir -p "$APP_DIR/uploads-objects"
chown -R root:root "$APP_DIR/uploads-objects"

echo "==> Installing npm dependencies"
cd "$APP_DIR"
npm ci || npm install

echo "==> Building client (vite build → client/dist)"
npm run build

echo "==> Pushing database schema and seeding"
set -a; source "$APP_DIR/.env"; set +a
npm run db:push
npm run db:seed || echo "(seed already ran or failed non-fatally)"

echo "==> Installing systemd-friendly PM2"
mkdir -p /var/log/pm2
pm2 start "$APP_DIR/ecosystem.config.cjs" || pm2 reload "$APP_DIR/ecosystem.config.cjs"
pm2 save
pm2 startup systemd -u root --hp /root | tail -n 1 | bash || true

echo "==> Installing Nginx site config"
mkdir -p /var/www/letsencrypt
install -m 644 "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/"$DOMAIN"
ln -sf /etc/nginx/sites-available/"$DOMAIN" /etc/nginx/sites-enabled/"$DOMAIN"
rm -f /etc/nginx/sites-enabled/default

# First boot: nginx config references SSL files that don't exist yet.
# Stage 1: write a temporary HTTP-only config so nginx can start and serve ACME challenges.
cat > /etc/nginx/sites-available/"$DOMAIN".bootstrap <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;
    location /.well-known/acme-challenge/ { root /var/www/letsencrypt; }
    location / { return 200 'bootstrapping'; add_header Content-Type text/plain; }
}
EOF
ln -sf /etc/nginx/sites-available/"$DOMAIN".bootstrap /etc/nginx/sites-enabled/"$DOMAIN"
nginx -t && systemctl reload nginx

echo "==> Obtaining Let's Encrypt certificate for $DOMAIN"
certbot certonly --webroot -w /var/www/letsencrypt \
  -d "$DOMAIN" -d "www.$DOMAIN" \
  --email "$ADMIN_EMAIL" --agree-tos --non-interactive

# Stage 2: swap to the real (HTTPS) config
ln -sf /etc/nginx/sites-available/"$DOMAIN" /etc/nginx/sites-enabled/"$DOMAIN"
nginx -t && systemctl reload nginx

# Auto-renewal is installed by the certbot package via systemd timer; verify:
systemctl list-timers | grep -i certbot || true

echo ""
echo "============================================================"
echo "  DEPLOY COMPLETE"
echo "  Site:    https://$DOMAIN"
echo "  Logs:    pm2 logs lawncare"
echo "  Status:  pm2 status"
echo ""
echo "  IMPORTANT — save these somewhere safe (also in $APP_DIR/.env):"
echo "    DB_PASS                   = $DB_PASS"
echo "    JWT_SECRET                = $JWT_SECRET"
echo "    REVENUECAT_WEBHOOK_AUTH   = $RC_WEBHOOK"
echo "============================================================"
