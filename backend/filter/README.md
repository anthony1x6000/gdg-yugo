# Website Guessr - Filter Service

Puppeteer-based screenshot service that fetches a website and injects custom CSS to anonymize it.

## Development

### Running with Docker (Recommended)
This handles all Puppeteer/Chromium dependencies automatically.
```bash
# From the project root
./start-dev.sh
```
The filter service will be available at `http://localhost:8789`.

### Running Locally (Node.js)
Ensure you have Chromium installed.
```bash
pnpm run dev
```
By default, it will listen on port `8080`. Use `PORT=8789 pnpm run dev` to use the legacy port.

## Deployment

This service is designed to run on **Google Cloud Run** or any Docker-compatible hosting.

### Cloud Run
Cloud Run injects a `PORT` environment variable (usually `8080`). The server is configured to listen on this port.

```bash
gcloud run deploy filter-service --source . --env-vars PORT=8080
```

## API Endpoints

See [API.md](./API.md) for full documentation.
