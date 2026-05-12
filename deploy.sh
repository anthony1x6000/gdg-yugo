#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Deploying Website Guessr Services..."

# 1. Deploy Filter Service (Cloud Run)
# echo "========================================"
# echo "Deploying Filter Service to Cloud Run"
# echo "========================================"
# Note: Ensure gcloud is authenticated and project is set.
# Using --timeout=600 as suggested for Puppeteer cold starts.
# (cd backend/filter && gcloud run deploy filter-service --source . --platform managed --timeout=600 --allow-unauthenticated)

# 2. Deploy Cloudflare Workers (Pusher & Randomizer)
echo "========================================"
echo "Deploying Cloudflare Workers"
echo "========================================"

for worker_dir in backend/*/; do
  worker_name=$(basename "$worker_dir")
  if [ -d "$worker_dir" ] && [ "$worker_name" != "filter" ]; then
    echo "----------------------------------------"
    echo "Deploying worker: $worker_name"
    echo "----------------------------------------"
    # Turnstile SECRET_KEY_TURNSTILE should be in backend/.env
    (cd "$worker_dir" && npx wrangler deploy --env-file=../.env)
  fi
done

echo "========================================"
echo "All services deployed successfully!"
echo "========================================"
echo "Reminder: Ensure SECRET_KEY_TURNSTILE is set in backend/.env"
echo "or added as a secret: wrangler secret put SECRET_KEY_TURNSTILE"
