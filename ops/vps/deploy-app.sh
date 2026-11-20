#!/usr/bin/env bash
# Deploy Yekola Next.js app to VPS principal (port 3015).
# Laptop: bash ops/vps/deploy-app.sh
set -euo pipefail

HOST="${YEKOOLA_VPS_HOST:-root@162.35.181.98}"
REMOTE_DIR="${YEKOOLA_REMOTE_DIR:-/opt/yekola}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WEB="$ROOT/web"

if [[ "${1:-}" == "--on-server" ]]; then
  echo "==> On-server: build + restart yekola"
  cd "$REMOTE_DIR/web"
  if [[ -f "$REMOTE_DIR/web/.env" ]]; then
    set -a
    # shellcheck disable=SC1091
    source "$REMOTE_DIR/web/.env"
    set +a
  fi
  npm install --include=dev
  npm run build
  # Preserve user data / sessions across deploys (do not wipe store.json)
  mkdir -p "$REMOTE_DIR/web/data" "$REMOTE_DIR/web/.next/standalone/data"
  if [[ -f "$REMOTE_DIR/web/data/store.json" ]]; then
    cp -a "$REMOTE_DIR/web/data/store.json" "$REMOTE_DIR/web/.next/standalone/data/store.json" || true
  fi
  cp -a "$REMOTE_DIR/web/public/." "$REMOTE_DIR/web/.next/standalone/public/" || true
  cp -a "$REMOTE_DIR/web/.next/static" "$REMOTE_DIR/web/.next/standalone/.next/" || true

  cat > /etc/systemd/system/yekola.service <<'UNIT'
[Unit]
Description=Yekola Next.js
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/yekola/web/.next/standalone
EnvironmentFile=-/opt/yekola/web/.env
Environment=NODE_ENV=production
Environment=PORT=3015
Environment=HOSTNAME=127.0.0.1
Environment=YEKOOLA_DATA_DIR=/opt/yekola/web/data
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
UNIT

  # Switch nginx to reverse proxy
  cp "$REMOTE_DIR/ops/vps/nginx-yekola-app.conf" /etc/nginx/sites-available/yekola
  ln -sfn /etc/nginx/sites-available/yekola /etc/nginx/sites-enabled/yekola
  nginx -t
  systemctl daemon-reload
  systemctl enable yekola
  systemctl restart yekola
  systemctl reload nginx
  echo "OK: https://yekola.mcbuleli.com (Next :3015)"
  exit 0
fi

echo "==> rsync -> $HOST:$REMOTE_DIR"
rsync -az --delete \
  --exclude .git \
  --exclude node_modules \
  --exclude .next \
  --exclude .DS_Store \
  --exclude 'web/node_modules' \
  --exclude 'web/.next' \
  --exclude 'web/data' \
  --exclude 'web/data/**' \
  "$ROOT/" "$HOST:$REMOTE_DIR/"

ssh -o BatchMode=yes "$HOST" "bash $REMOTE_DIR/ops/vps/deploy-app.sh --on-server"
echo "Done."
