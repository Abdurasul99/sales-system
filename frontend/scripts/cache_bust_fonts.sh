#!/bin/bash
# Renames MaterialIcons font with a timestamp suffix and updates FontManifest.json
# so the browser is forced to download the fresh font on every deploy.
set -e

WEB_DIR="${1:-build/web}"
FONT_DIR="$WEB_DIR/assets/fonts"
MANIFEST="$WEB_DIR/assets/FontManifest.json"
ORIGINAL="MaterialIcons-Regular.otf"

if [ ! -f "$FONT_DIR/$ORIGINAL" ]; then
    echo "Skip: $FONT_DIR/$ORIGINAL not found"
    exit 0
fi

VERSION=$(date +%Y%m%d%H%M%S)
NEW_NAME="MaterialIcons-Regular-v${VERSION}.otf"

cp "$FONT_DIR/$ORIGINAL" "$FONT_DIR/$NEW_NAME"

# Replace inside FontManifest.json
if [ -f "$MANIFEST" ]; then
    sed -i.bak "s|fonts/$ORIGINAL|fonts/$NEW_NAME|g" "$MANIFEST"
    rm -f "$MANIFEST.bak"
fi

# Replace inside main.dart.js (Flutter web encodes the URL there as a string)
if [ -f "$WEB_DIR/main.dart.js" ]; then
    sed -i.bak "s|fonts/$ORIGINAL|fonts/$NEW_NAME|g" "$WEB_DIR/main.dart.js"
    rm -f "$WEB_DIR/main.dart.js.bak"
fi

# Replace inside the AssetManifest JSON variant
if [ -f "$WEB_DIR/assets/AssetManifest.bin.json" ]; then
    sed -i.bak "s|fonts/$ORIGINAL|fonts/$NEW_NAME|g" "$WEB_DIR/assets/AssetManifest.bin.json"
    rm -f "$WEB_DIR/assets/AssetManifest.bin.json.bak"
fi

# Remove old original to save bandwidth (no longer referenced)
rm -f "$FONT_DIR/$ORIGINAL"

echo "Cache-bust done: $ORIGINAL -> $NEW_NAME"
