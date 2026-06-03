# Deploying Lawncare Workshop to a VPS

Target: a fresh **Ubuntu 22.04** VPS at `145.223.120.23`, serving `https://thelawncareworkshop.com`
with local PostgreSQL, PM2, Nginx, and Let's Encrypt SSL.

> ⚠️ **Rotate any credentials you've ever pasted into a chat.** Disable root password login
> and use SSH keys (`PasswordAuthentication no`, `PermitRootLogin prohibit-password` in
> `/etc/ssh/sshd_config`, then `systemctl reload sshd`).

---

## Project layout (already in place)

```
.
├── package.json          # single root package
├── client/               # React + Vite frontend  → builds to client/dist
├── server/               # Express + TS backend   → runs via tsx
├── shared/               # drizzle schema shared by both
├── ecosystem.config.cjs  # PM2 process definition
├── deploy/
│   ├── deploy.sh         # one-shot bootstrap for a fresh VPS
│   ├── update.sh         # pull + rebuild + reload (used by CI)
│   └── nginx.conf        # nginx site for thelawncareworkshop.com
└── .github/workflows/deploy.yml   # CI/CD: auto-deploy on push to main
```

Scripts (`package.json`):

| Script | Purpose |
|---|---|
| `npm run dev` | local dev (Vite + tsx watch) |
| `npm run build` | builds `client/dist` |
| `npm start` | runs server in production mode |
| `npm run db:push` | apply schema (Drizzle) |
| `npm run db:seed` | seed initial data (admin, plans, etc.) |

---

## 1 — Point the domain at the VPS

In your DNS provider, create:

| Type | Host | Value |
|---|---|---|
| A | `@` | `145.223.120.23` |
| A | `www` | `145.223.120.23` |

Wait until `dig +short thelawncareworkshop.com` returns `145.223.120.23` before continuing
(Let's Encrypt will fail otherwise).

---

## 2 — Push this repo to GitHub

```bash
git init && git add . && git commit -m "initial"
git remote add origin git@github.com:<you>/<repo>.git
git push -u origin main
```

(If the repo is private, also add a deploy key to GitHub so the VPS can clone it — see step 6.)

---

## 3 — First-time VPS bootstrap (one command)

SSH in and run the bundled deploy script. It installs Node 20, Nginx, PostgreSQL, PM2,
Certbot, creates the DB, clones the repo, builds, seeds, and gets SSL:

```bash
ssh root@145.223.120.23

# install git so we can clone the repo
apt-get update && apt-get install -y git

# clone just enough to get deploy.sh
git clone https://github.com/<you>/<repo>.git /tmp/lawncare
cp /tmp/lawncare/deploy/deploy.sh .
chmod +x deploy.sh

GITHUB_REPO=git@github.com:<you>/<repo>.git \
DOMAIN=thelawncareworkshop.com \
ADMIN_EMAIL=you@example.com \
./deploy.sh
```

When it finishes you'll see a block of generated secrets printed once — copy them somewhere safe.
They're also written into `/var/www/lawncare/.env`.

Visit **https://thelawncareworkshop.com** — it should load.
Admin login: `admin@lawncareworkshop.com` / `admin123` (change immediately).

---

## 4 — Day-to-day update flow (data-safe)

From your laptop:

```bash
git push origin main
```

On the VPS (or automatically via the CI in step 6):

```bash
cd /var/www/lawncare && ./deploy/update.sh
```

`update.sh` is **non-destructive by design**. It does NOT touch:

| Preserved on update | Why |
|---|---|
| **PostgreSQL data** | `db:push` is additive — it adds new columns/tables, never drops rows |
| **`.env`** | Your secrets stay exactly as you set them |
| **`uploads-objects/`** | User-uploaded media is left alone |
| **SSL certs** | Certbot owns those; renewals run on a separate systemd timer |
| **Nginx config** | Only re-installed by `deploy.sh`, not `update.sh` |

Seeding is **not** re-run on update — the server itself calls `seedDatabaseIfEmpty()` at
boot, which is a no-op once data exists. Your manually-added users, posts, subscriptions,
etc. are safe.

> ⚠️ `deploy/deploy.sh` is the first-bootstrap script. It now refuses to run if
> `/var/www/lawncare/.env` already exists (you'd have to pass `FORCE_REBOOTSTRAP=1`),
> so you can't accidentally overwrite a live install.

---

## 5 — Useful operational commands

```bash
pm2 status                       # process state
pm2 logs lawncare                # live logs
pm2 restart lawncare             # hard restart
pm2 reload lawncare              # zero-downtime restart

systemctl status nginx
nginx -t && systemctl reload nginx

sudo -u postgres psql lawncare   # open the DB

certbot renew --dry-run          # test SSL renewal (auto-runs via systemd timer)
tail -f /var/log/nginx/error.log
```

---

## 6 — CI/CD: auto-deploy from GitHub

The workflow `.github/workflows/deploy.yml` SSHes into your VPS and runs `update.sh`
on every push to `main`.

### One-time setup

1. **On the VPS**, generate a deploy key dedicated to GitHub Actions:
   ```bash
   ssh-keygen -t ed25519 -f /root/.ssh/gha_deploy -N ""
   cat /root/.ssh/gha_deploy.pub >> /root/.ssh/authorized_keys
   cat /root/.ssh/gha_deploy           # ← copy this private key
   ```

2. **In GitHub** → repo → Settings → Secrets and variables → Actions → New repository secret:
   - `VPS_HOST` = `145.223.120.23`
   - `VPS_USER` = `root` (or a deploy user with sudo)
   - `VPS_SSH_KEY` = the **private** key from step 1 (paste the whole `-----BEGIN ... END-----` block)

3. **For the VPS to be able to `git pull` a private repo**, add the same `/root/.ssh/gha_deploy.pub`
   to your GitHub repo under Settings → Deploy keys (read-only is enough).

4. Push to `main` — Actions tab will show the deploy running.

---

## 7 — Environment variables

`/var/www/lawncare/.env` (created by `deploy.sh`):

| Variable | Required? | Notes |
|---|---|---|
| `DATABASE_URL` | yes | `postgresql://lawncare:<pass>@127.0.0.1:5432/lawncare` |
| `JWT_SECRET` | yes | auto-generated by `deploy.sh` |
| `REVENUECAT_WEBHOOK_AUTH` | yes for IAP | put `Bearer <this value>` in RevenueCat dashboard |
| `STRIPE_SECRET_KEY` | optional | only if you enable Stripe checkout on the web |
| `STRIPE_WEBHOOK_SECRET` | optional | for `/api/stripe/webhook` |
| `FIREBASE_*` | optional | only if you use Firebase push from the server |
| `STORAGE_MODE` | yes on VPS | Set to `local` to store uploaded media on the server's disk. This is the default; the app uses local disk unless `STORAGE_MODE=replit`. |
| `LOCAL_STORAGE_DIR` | yes on VPS | Where uploaded media is written (default `./uploads-objects`). Served back at `/objects/...`. Use an absolute path on a persistent volume, e.g. `/var/www/lawncare/uploads-objects`. |
| `PRIVATE_OBJECT_DIR` / `PUBLIC_OBJECT_SEARCH_PATHS` | leave blank on VPS | Replit Object Storage only. Used only when `STORAGE_MODE=replit`. |

After editing `.env`: `pm2 restart lawncare`.

---

## 8 — RevenueCat webhook (the bit you originally asked about)

Once SSL is live:

- URL: `https://thelawncareworkshop.com/api/webhooks/revenuecat`
- Authorization header: `Bearer <value of REVENUECAT_WEBHOOK_AUTH from .env>`
- Test from the RevenueCat dashboard — you should see a 200 and a `[RevenueCat] Event ...`
  line in `pm2 logs lawncare`.

---

## 9 — Backups (recommended)

Cron a nightly DB + uploads backup:

```bash
cat >/etc/cron.daily/lawncare-backup <<'EOF'
#!/bin/bash
set -e
BACKUP=/var/backups/lawncare
mkdir -p "$BACKUP"
sudo -u postgres pg_dump lawncare | gzip > "$BACKUP/db-$(date +\%F).sql.gz"
tar -C /var/www/lawncare -czf "$BACKUP/uploads-$(date +\%F).tar.gz" uploads-objects
find "$BACKUP" -type f -mtime +14 -delete
EOF
chmod +x /etc/cron.daily/lawncare-backup
```

## 10 — Media / file uploads on the VPS

The app stores uploaded files (images, videos, ebooks, etc.) under
`$LOCAL_STORAGE_DIR` (default `/var/www/lawncare/uploads-objects`) and serves them
back at `/objects/<path>`. The flow:

1. Client `POST /api/uploads/request-url` → gets a short-lived signed PUT URL
2. Client `PUT` the file body to that URL → server writes it to disk
3. Anyone can `GET /objects/<path>` to read it (1-year `Cache-Control` set)

Max upload size is **100 MB** (Nginx `client_max_body_size` + Express raw-body limit).
To raise it, bump both `deploy/nginx.conf` and the limit in `server/localObjectStorage.ts`.

If you ever outgrow the disk, swap `LOCAL_STORAGE_DIR` for an S3-compatible backend
without changing the rest of the app — only `server/localObjectStorage.ts` needs to be
re-pointed at S3.
