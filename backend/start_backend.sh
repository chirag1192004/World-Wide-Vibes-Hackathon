#!/usr/bin/env bash
# start_backend.sh — Start the CivicPulse FastAPI backend
# Usage: bash start_backend.sh [--reload]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Load PORT from .env if present (default: 8000)
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
fi
PORT="${PORT:-8000}"

# Create venv if it doesn't exist
if [ ! -d "venv" ]; then
  echo "[setup] Creating virtual environment..."
  python3 -m venv venv
fi

# Always activate venv
source venv/bin/activate

# Install / sync deps
echo "[setup] Installing dependencies..."
pip install -q -r requirements.txt

# Run scraper if businesses_scraped.json is missing
if [ ! -f "data/businesses_scraped.json" ]; then
  echo "[setup] Generating business data..."
  python3 scripts/scrape_businesses.py
fi

# Start server
echo "[server] Starting CivicPulse API on http://localhost:${PORT}"
exec python3 -m uvicorn main:app --host 0.0.0.0 --port "${PORT}" "$@"
