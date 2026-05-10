#!/bin/bash

# Kill all background processes on exit
cleanup() {
    echo "Stopping all services..."
    docker stop filter-container 2>/dev/null && docker rm filter-container 2>/dev/null
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

echo "Starting services in development mode..."

# Get absolute path to the shared wrangler directory
PERSIST_PATH="$(pwd)/.wrangler"
mkdir -p "$PERSIST_PATH"

# 0. Initialize Shared D1 Database
echo "Initializing shared local database..."
(cd backend/randomizer && npx wrangler d1 execute gsrsites --local --persist-to "$PERSIST_PATH" --file ./schema.sql --yes)

# 1. Start Filter Service (Port 8789) - Running in Docker to handle Puppeteer dependencies
echo "Starting Filter Service in Docker on http://127.0.0.1:8789"
(cd backend/filter && docker build -t filter-service . && docker rm -f filter-container 2>/dev/null || true && docker run -d -p 8789:8789 --name filter-container filter-service)
# Give it a moment to start
sleep 5

# 2. Start Randomizer Worker (Port 8787)
# Overriding FILTER_URL to point to local filter worker
echo "Starting Randomizer Worker on http://127.0.0.1:8787"
(cd backend/randomizer && npx wrangler dev --port 8787 --inspector-port 9229 --persist-to "$PERSIST_PATH" --var FILTER_URL:http://127.0.0.1:8789) &

# 3. Start Pusher Worker (Port 8788)
echo "Starting Pusher Worker on http://127.0.0.1:8788"
(cd backend/pusher && npx wrangler dev --port 8788 --inspector-port 9230 --persist-to "$PERSIST_PATH") &

# 4. Start Frontend
echo "Starting Frontend..."
(cd frontend && npm run dev) &

echo "All services are starting. Press Ctrl+C to stop."

# Wait for all background processes
wait
