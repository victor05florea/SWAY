#!/usr/bin/env bash
# Build + deploy SWAY (frontend + optional backend) pe sway.ovh via rsync.
# Variabile:
#   SSH_HOST=user@sway.ovh         (obligatoriu)
#   REMOTE_FRONTEND=/var/www/sway  (obligatoriu)
#   REMOTE_BACKEND_JAR=/path/to/sway-backend.jar  (optional, deploy backend)
#   SSH_PORT=22                    (default 22)
#   SKIP_BACKEND=1                 (sa nu rebuild jar)
#   SKIP_FRONTEND=1                (sa nu rebuild dist)
set -euo pipefail

SSH_HOST="${SSH_HOST:?seteaza SSH_HOST=user@host}"
REMOTE_FRONTEND="${REMOTE_FRONTEND:?seteaza REMOTE_FRONTEND=/var/www/sway}"
SSH_PORT="${SSH_PORT:-22}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FRONT="$ROOT/frontend"
BACK="$ROOT/backend"

if [[ -z "${SKIP_FRONTEND:-}" ]]; then
  echo "[frontend 1/3] build"
  ( cd "$FRONT" && npm ci --silent && npm run build )

  echo "[frontend 2/3] pre-gzip assets (pt gzip_static nginx)"
  find "$FRONT/dist/assets" -type f \( -name '*.js' -o -name '*.css' -o -name '*.svg' \) -print0 \
    | xargs -0 -n1 -I{} sh -c 'gzip -9 -k -f "$1"' _ {}

  echo "[frontend 3/3] rsync -> $SSH_HOST:$REMOTE_FRONTEND  (exclude /images preservand webp existent)"
  rsync -avz --delete --exclude '/images/' --exclude '.DS_Store' \
    -e "ssh -p $SSH_PORT" \
    "$FRONT/dist/" "$SSH_HOST:$REMOTE_FRONTEND/"
fi

if [[ -z "${SKIP_BACKEND:-}" && -n "${REMOTE_BACKEND_JAR:-}" ]]; then
  echo "[backend 1/2] mvn package"
  ( cd "$BACK" && mvn -q -DskipTests package )
  JAR="$(ls -1t "$BACK"/target/*.jar | head -n1)"
  echo "[backend 2/2] rsync -> $SSH_HOST:$REMOTE_BACKEND_JAR"
  rsync -avz -e "ssh -p $SSH_PORT" "$JAR" "$SSH_HOST:$REMOTE_BACKEND_JAR"
  echo ">>> Restart backend service manual pe server (pterodactyl) — daca nu auto."
fi

echo "[nginx] reload"
ssh -p "$SSH_PORT" "$SSH_HOST" "sudo nginx -t && sudo systemctl reload nginx" || \
  echo ">>> Reload nginx esuat — verifica permisiuni sudo. Ruleaza manual brother."

echo "Deploy gata."
