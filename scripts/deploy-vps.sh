#!/usr/bin/env bash
# Deploy from your Mac when Cursor/CI cannot reach the VPS.
# Usage: ./scripts/deploy-vps.sh [user@host]
set -euo pipefail

TARGET="${1:-root@145.223.120.23}"
APP_DIR="/var/www/webportals"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"
echo "==> Building locally"
npm run build

echo "==> Uploading to $TARGET:$APP_DIR"
tar czf - \
  server client shared package.json package-lock.json \
  vite.config.ts tsconfig.json tsconfig.node.json \
  drizzle.config.ts postcss.config.js tailwind.config.ts \
  attached_assets 2>/dev/null \
| ssh "$TARGET" "mkdir -p $APP_DIR && cd $APP_DIR && tar xzf - && npm ci && npm run build && (pm2 restart thelawncareworkshop || pm2 restart lawncare) && pm2 status"

echo "==> Done — check https://thelawncareworkshop.com/health"
