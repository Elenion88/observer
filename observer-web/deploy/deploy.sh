#!/usr/bin/env bash
# Deploy Observer to reef. Run from your laptop:
#   bash deploy/deploy.sh
# Override the remote user with the first arg (default: kokomo).

set -euo pipefail

REMOTE_USER="${1:-kokomo}"
REMOTE_HOST="${REMOTE_HOST:-reef}"
REMOTE="$REMOTE_USER@$REMOTE_HOST"

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PY_SRC="$REPO_ROOT/clause"
WEB_SRC="$REPO_ROOT/observer-web"

PY_DST="/home/${REMOTE_USER}/observer/clause"
WEB_DST="/home/${REMOTE_USER}/observer/observer-web"

echo "==> rsync python pipeline"
rsync -az --delete \
  --exclude '.venv' --exclude '__pycache__' --exclude '*.pyc' \
  "$PY_SRC/" "$REMOTE:$PY_DST/"

echo "==> rsync web app"
rsync -az --delete \
  --exclude 'node_modules' --exclude '.next' --exclude 'uploads' \
  "$WEB_SRC/" "$REMOTE:$WEB_DST/"

echo "==> remote install + build"
ssh "$REMOTE" "
  set -e
  cd $PY_DST && uv sync
  cd $WEB_DST
  test -f .env || cp ~/.env .env || true
  npm install
  npx prisma migrate deploy
  npm run build
  mkdir -p uploads/qms uploads/evidence uploads/docs
"

echo "==> install systemd unit"
scp "$WEB_SRC/deploy/observer.service" "$REMOTE:/tmp/observer.service"
ssh "$REMOTE" "
  sudo mv /tmp/observer.service /etc/systemd/system/observer.service
  sudo systemctl daemon-reload
  sudo systemctl enable --now observer.service
  sudo systemctl restart observer.service
  systemctl status observer.service --no-pager | head -15
"

echo "==> Caddy snippet (paste into your /etc/caddy/Caddyfile if not already there):"
cat "$WEB_SRC/deploy/Caddyfile.snippet"
echo ""
echo "==> done. visit https://observer.kokomo.quest"
