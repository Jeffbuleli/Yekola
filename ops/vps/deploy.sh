#!/usr/bin/env bash
# Deploy Yekola static site to VPS principal.
# Usage (laptop): bash ops/vps/deploy.sh
# Usage (on VPS after rsync): bash /opt/yekola/ops/vps/deploy.sh --on-server
set -euo pipefail

HOST="${YEKOOLA_VPS_HOST:-root@162.35.181.98}"
REMOTE_DIR="${YEKOOLA_REMOTE_DIR:-/opt/yekola}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

if [[ "${1:-}" == "--on-server" ]]; then
  echo "==> On-server: nginx + TLS for yekola.mcbuleli.com"
  mkdir -p "$REMOTE_DIR/public"
  if [[ ! -f /etc/letsencrypt/live/yekola.mcbuleli.com/fullchain.pem ]]; then
    cp "$REMOTE_DIR/ops/vps/nginx-yekola-bootstrap.conf" /etc/nginx/sites-available/yekola
    ln -sfn /etc/nginx/sites-available/yekola /etc/nginx/sites-enabled/yekola
    nginx -t && systemctl reload nginx
    certbot --nginx -d yekola.mcbuleli.com --non-interactive --agree-tos -m hi@mcbuleli.org --redirect || true
  fi
  if [[ -f /etc/letsencrypt/live/yekola.mcbuleli.com/fullchain.pem ]]; then
    cp "$REMOTE_DIR/ops/vps/nginx-yekola.conf" /etc/nginx/sites-available/yekola
    ln -sfn /etc/nginx/sites-available/yekola /etc/nginx/sites-enabled/yekola
  fi
  nginx -t && systemctl reload nginx
  echo "OK: https://yekola.mcbuleli.com (DNS A must point to this VPS)"
  exit 0
fi

echo "==> rsync $ROOT -> $HOST:$REMOTE_DIR"
rsync -az --delete \
  --exclude .git \
  --exclude node_modules \
  --exclude .DS_Store \
  "$ROOT/" "$HOST:$REMOTE_DIR/"

echo "==> remote deploy"
ssh -o BatchMode=yes "$HOST" "bash $REMOTE_DIR/ops/vps/deploy.sh --on-server"
echo "Done."
