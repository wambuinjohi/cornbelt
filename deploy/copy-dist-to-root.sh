#!/usr/bin/env bash
set -euo pipefail

# Usage: ./copy-dist-to-root.sh /path/to/dist /var/www/cornbelt
SRC=${1:-./dist}
DEST=${2:-/var/www/cornbelt}

if [ ! -d "$SRC" ]; then
  echo "Source dist directory not found: $SRC" >&2
  exit 2
fi

mkdir -p "$DEST"
rsync -a --delete "$SRC/" "$DEST/"
# Copy api.php if present (legacy PHP backend)
if [ -f "./api.php" ]; then
  cp ./api.php "$DEST/api.php"
fi

# Ensure permissions (adjust user as needed)
chown -R www-data:www-data "$DEST" || true

# Hint: enable Apache site and reload
echo "Copied $SRC -> $DEST"
echo "Remember to enable the Apache site config (deploy/apache.cornbelt.conf) and reload Apache:"
echo "  sudo a2ensite apache.cornbelt.conf && sudo systemctl reload apache2"
