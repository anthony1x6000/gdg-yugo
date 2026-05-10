#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Deploying all Cloudflare Workers in backend/..."

for worker_dir in backend/*/; do
  if [ -d "$worker_dir" ]; then
    if [ "$(basename "$worker_dir")" = "filter" ]; then
      echo "Skipping filter service..."
      continue
    fi

    echo "========================================"
    echo "Deploying worker in $worker_dir"
    echo "========================================"
    (cd "$worker_dir" && npx wrangler deploy --env-file=../.env)
  fi
done

echo "========================================"
echo "All workers deployed successfully!"