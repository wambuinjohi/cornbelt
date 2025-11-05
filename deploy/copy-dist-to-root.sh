#!/usr/bin/env bash
set -euo pipefail

# Usage: sudo ./copy-dist-to-root.sh /path/to/project/dist /var/www/cornbelt
SRC=${1:-./dist}
DEST=${2:-/var/www/cornbelt}

if [ ! -d "$SRC" ]; then
  echo "Source dist directory not found: $SRC" >&2
  exit 2
fi

sudo mkdir -p "$DEST"
sudo rsync -a --delete "$SRC/" "$DEST/"
# Ensure api.php (legacy PHP) is present at webroot if you rely on it
if [ -f "./api.php" ]; then
  sudo cp ./api.php "$DEST/api.php"
fi
sudo chown -R www-data:www-data "$DEST"

echo "Copied $SRC -> $DEST"

# Reload systemd (if service was installed) and restart the Node service
if systemctl --version >/dev/null 2>&1; then
  echo "Reloading systemd and restarting cornbelt service (if present)"
  sudo systemctl daemon-reload || true
  sudo systemctl restart cornbelt.service || true
fi

# Suggest nginx reload
if nginx -v >/dev/null 2>&1; then
  echo "Reloading nginx"
  sudo nginx -s reload || true
fi

echo "Deployment step complete. Verify site at your domain."
