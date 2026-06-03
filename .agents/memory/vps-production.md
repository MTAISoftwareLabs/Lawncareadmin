---
name: VPS production deployment (thelawncareworkshop.com)
description: Where/how the live app actually runs and how to restart it correctly
---

# VPS production deployment

Production is a self-hosted VPS (root@145.223.120.23), domain
https://thelawncareworkshop.com, behind nginx → Node on port 3000.

**Non-obvious facts (don't trust the repo's deploy files):**
- The live app is PM2 process **`thelawncareworkshop`** running **`npm start`**
  (= `NODE_ENV=production tsx server/index.ts`) from **`/var/www/webportals`**.
- This does NOT match the repo's `ecosystem.config.cjs` (which says name `lawncare`,
  cwd `/var/www/lawncare`). Those files are not what's actually deployed.
- The app does **not** use dotenv. `.env` (`/var/www/webportals/.env`) is sourced
  into the shell (`set -a; source .env; set +a`) before `pm2 start`, so env vars are
  baked into PM2's saved process env.
- **Therefore editing `.env` alone does NOT change the running process.** To apply
  env changes: edit `.env`, then in a fresh shell re-source it and recreate the
  process (`pm2 delete thelawncareworkshop` → `pm2 start npm --name thelawncareworkshop
  --cwd /var/www/webportals -- start` → `pm2 save`). `pm2 restart --update-env` is
  unreliable for *removing* a var.
- The VPS `.env` even contains `REPL_ID`/`REPLIT_DOMAINS` (copied from Replit), so any
  "am I on Replit" detection by those vars would be wrong here — use explicit
  `STORAGE_MODE` instead.
- Deploy pipeline (`deploy/update.sh`) pulls from GitHub `MTAISoftwareLabs/Lawncareadmin`
  main, but Replit cannot push to that repo (no stored GitHub token). The VPS's own git
  remote is only `gitsafe-backup` (Replit-internal, unreachable from the VPS), so a `git pull`
  on the VPS does not fetch your changes either.

**Working manual deploy from Replit (since git push isn't available):**
- `rsync` is NOT installed on the Replit box. Copy files with `tar czf - <paths> | sshpass -e ssh root@HOST 'cd /var/www/webportals && tar xzf -'` (preserves paths, creates dirs).
- Server is run by `tsx` directly → **no server build**; copying `.ts` files is enough.
- Client IS built: `npm run build` (vite, `root: ./client`) outputs to **`client/dist`**, which the prod Node app serves via `express.static` when `isProduction`. After changing any client file you MUST rebuild on the VPS or the UI won't update.
- New npm deps: copy `package.json`+`package-lock.json`, then `npm install` on the VPS.
- Apply with `pm2 restart thelawncareworkshop` (plain restart keeps existing sourced env — fine when you didn't change env). `runSchemaMigrations()` runs on startup and creates missing tables idempotently (CREATE TABLE/INDEX IF NOT EXISTS).
- nginx proxies everything (`location /`) to `127.0.0.1:3000`; there is no separate static root.
- `pm2 env 0` shows `NODE_ENV: development`, but `npm start` prepends `NODE_ENV=production`, so the actual process runs in production mode — trust the start script, not `pm2 env`.

**Logs:** `/root/.pm2/logs/thelawncareworkshop-{out,error}.log`.
Startup prints `📁 Local object storage enabled at <dir>` when in local storage mode.

**Prod code can silently drift from the repo.** It is zip/scp-deployed, not git-synced,
so individual files on the VPS may differ from local even when line counts and most
content match. Before assuming "prod == repo", run a *full* `diff` of the file (a
grep-pattern diff can miss a single trailing change like a `.strict()`). When a bug
reproduces only in prod with identical-looking code, suspect a one-line drift.
**Why:** A live "Invalid settings" 400 on the RevenueCat admin save was caused solely by
prod's settings schema ending in `}).strict()` while the repo had plain `});` — zod
`.strict()` rejects unknown keys, and that admin page POSTs the whole fetched row back
(including read-only `id`/`updatedAt`). Fix was redeploying the repo file + PM2 restart.
**How to apply:** Settings-style PUT/PATCH schemas that receive a full fetched object
back must NOT use `.strict()` (or the client must strip server-managed fields first).
