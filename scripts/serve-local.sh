#!/usr/bin/env bash
# Serve le projet sur http://localhost:8000 et ouvre la page horaires.html (macOS)
set -e
cd "$(dirname "$0")/.."
PORT=${1:-8000}
# Démarre un serveur Python en arrière-plan
python3 -m http.server "$PORT" --directory . &
PID=$!
# Ouvre la page dans le navigateur (macOS)
open "http://localhost:${PORT}/horaires.html"
echo "Server started at http://localhost:${PORT} (PID=$PID)"
echo "Kill server with: kill $PID"
