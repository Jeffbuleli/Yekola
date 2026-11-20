#!/usr/bin/env bash
# Deploy Yekola Next.js — prod (:3015) + Pi Test (:3016) on the same VPS.
# Laptop: bash ops/vps/deploy-app.sh
set -euo pipefail

HOST="${YEKOOLA_VPS_HOST:-root@153.75.235.176}"
REMOTE_DIR="${YEKOOLA_REMOTE_DIR:-/opt/yekola}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

if [[ "${1:-}" == "--on-server" ]]; then
  echo "==> On-server: build + restart yekola + yekola-pi-test"
  cd "$REMOTE_DIR/web"
  if [[ -f "$REMOTE_DIR/web/.env.pi-test" ]]; then
    set -a
    # shellcheck disable=SC1091
    source "$REMOTE_DIR/web/.env.pi-test"
    set +a
  fi
  npm install --include=dev
  npm run build

  mkdir -p "$REMOTE_DIR/web/data" "$REMOTE_DIR/web/data-pi-test"
  mkdir -p "$REMOTE_DIR/web/.next/standalone/data"
  if [[ -f "$REMOTE_DIR/web/data/store.json" ]]; then
    cp -a "$REMOTE_DIR/web/data/store.json" "$REMOTE_DIR/web/.next/standalone/data/store.json" || true
  fi
  cp -a "$REMOTE_DIR/web/public/." "$REMOTE_DIR/web/.next/standalone/public/" || true
  cp -a "$REMOTE_DIR/web/.next/static" "$REMOTE_DIR/web/.next/standalone/.next/" || true

  cat > /etc/systemd/system/yekola.service <<'UNIT'
[Unit]
Description=Yekola Next.js (production / Mainnet Pi)
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/yekola/web/.next/standalone
EnvironmentFile=-/opt/yekola/web/.env.production
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

  cat > /etc/systemd/system/yekola-pi-test.service <<'UNIT'
[Unit]
Description=Yekola Pi Testnet (hackathon / Staging)
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/yekola/web/.next/standalone
EnvironmentFile=-/opt/yekola/web/.env.pi-test
Environment=NODE_ENV=production
Environment=PORT=3016
Environment=HOSTNAME=127.0.0.1
Environment=YEKOOLA_DATA_DIR=/opt/yekola/web/data-pi-test
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
UNIT

  cp "$REMOTE_DIR/ops/vps/nginx-yekola-app.conf" /etc/nginx/sites-available/yekola
  ln -sfn /etc/nginx/sites-available/yekola /etc/nginx/sites-enabled/yekola
  cp "$REMOTE_DIR/ops/vps/nginx-yekola-pi-test.conf" /etc/nginx/sites-available/yekola-pi-test
  ln -sfn /etc/nginx/sites-available/yekola-pi-test /etc/nginx/sites-enabled/yekola-pi-test

  if nginx -t 2>/dev/null; then
    systemctl reload nginx
  else
    echo "WARN: nginx -t failed (certificat pi-test manquant ?). Services Next redémarrés quand même."
  fi

  systemctl daemon-reload
  systemctl enable yekola yekola-pi-test
  systemctl restart yekola yekola-pi-test

  echo "OK prod:  https://yekola.mcbuleli.com ( :3015, .env.production )"
  echo "OK test:  https://pi-test.mcbuleli.com ( :3016, .env.pi-test )"
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
  --exclude 'web/data-pi-test' \
  --exclude 'web/data-pi-test/**' \
  --exclude 'web/.env' \
  --exclude 'web/.env.production' \
  --exclude 'web/.env.pi-test' \
  "$ROOT/" "$HOST:$REMOTE_DIR/"

ssh -o BatchMode=yes "$HOST" "bash $REMOTE_DIR/ops/vps/deploy-app.sh --on-server"
echo "Done."