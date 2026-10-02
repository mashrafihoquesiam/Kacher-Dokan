#!/bin/bash
cd "$(dirname "$0")"
echo "Kacher Dokan - MongoDB Atlas Setup"
echo "Copy a fresh full connection string from Atlas > Cluster > Connect > Drivers."
read -r -p "Paste MONGO_URI (with your current password already inserted): " URI
if [ -z "$URI" ]; then
  echo "No URI entered."
  read -r -p "Press Enter to close..."
  exit 1
fi
read -r -p "Database name [kaser_dokan]: " DBNAME
DBNAME=${DBNAME:-kaser_dokan}
AUTH=$(python3 - <<'PY' 2>/dev/null || true
import secrets
print(secrets.token_hex(32))
PY
)
AUTH=${AUTH:-kacher-dokan-local-auth-secret}
# Preserve cloud/image configuration when only the MongoDB connection is being changed.
OLD_CLOUDINARY_URL=""
OLD_PUBLIC_BASE_URL=""
if [ -f .env ]; then
  OLD_CLOUDINARY_URL=$(grep '^CLOUDINARY_URL=' .env | head -n1 | cut -d= -f2- || true)
  OLD_PUBLIC_BASE_URL=$(grep '^PUBLIC_BASE_URL=' .env | head -n1 | cut -d= -f2- || true)
fi
cat > .env <<ENV
PORT=3000
DB_NAME=$DBNAME
MONGO_URI=$URI
AUTH_SECRET=$AUTH
PAYMENT_MODE=demo
CLOUDINARY_URL=$OLD_CLOUDINARY_URL
PUBLIC_BASE_URL=$OLD_PUBLIC_BASE_URL
EDGE_TTS_BN_VOICE=bn-BD-NabanitaNeural
EDGE_TTS_EN_VOICE=en-US-JennyNeural
ENV
echo ".env saved locally."
read -r -p "Press Enter to close..."
