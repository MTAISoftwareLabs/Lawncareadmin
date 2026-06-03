#!/usr/bin/env bash
# update.sh — DATA-SAFE update. Pulls latest code, rebuilds the client,
# applies any new (additive) schema changes, and zero-downtime reloads PM2.
#
# What this does NOT touch:
#   • The .env file (your secrets stay put)
#   • The PostgreSQL database (db:push is additive; no rows are dropped)
#   • The uploads-objects/ directory (user-uploaded media)
#   • Nginx config or SSL certificates
#
# Run on the VPS:
#   cd /var/www/lawncare && ./deploy/update.sh
set -euo pipefail

APP_DIR="/var/www/lawncare"
cd "$APP_DIR"

if [ ! -f "$APP_DIR/.env" ]; then
  echo "ERROR: $APP_DIR/.env not found. Run deploy/deploy.sh first." >&2
  exit 1
fi

echo "==> git pull (fast-forward only)"
git pull --ff-only

echo "==> npm ci"
npm ci

echo "==> build client"
npm run build

echo "==> db:push  (additive schema sync — keeps existing rows)"
set -a; source "$APP_DIR/.env"; set +a
npm run db:push

# Deliberately NOT calling db:seed here — seeding already happens
# automatically on server start (seedDatabaseIfEmpty, idempotent).

echo "==> pm2 reload (zero-downtime restart)"
pm2 reload lawncare

echo "==> done"
pm2 status lawncare
