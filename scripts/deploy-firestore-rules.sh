#!/usr/bin/env bash
set -euo pipefail

# Déploie firestore.rules sur le projet Firebase indiqué.
# Usage: ./scripts/deploy-firestore-rules.sh [PROJECT_ID]
# Ex: ./scripts/deploy-firestore-rules.sh horaires-f3862

PROJECT_ID=${1:-}
if [ -z "$PROJECT_ID" ]; then
  echo "Usage: $0 <firebase-project-id>"
  exit 2
fi

if ! command -v firebase >/dev/null 2>&1; then
  echo "firebase CLI introuvable. Installe: npm install -g firebase-tools" >&2
  exit 3
fi

echo "Déploiement des règles Firestore vers le projet: $PROJECT_ID"

# Vérifier présence du fichier
if [ ! -f firestore.rules ]; then
  echo "firestore.rules introuvable dans le répertoire racine. Place-le et relance." >&2
  exit 4
fi

firebase deploy --only firestore:rules --project "$PROJECT_ID"

echo "Déploiement terminé. Vérifie la console Firebase pour confirmation." 
