# Cloudflare Workers & D1 Deployment Guide

This guide covers the end-to-end setup and deployment of the Website Guessr backend architecture on Cloudflare.

## Architecture Overview

The system consists of two Workers and one D1 Database:
1.  **D1 Database (`gsrsites`)**: Stores website URLs and CSS anonymization rules.
2.  **Filter Worker (`backend/filter`)**: A utility worker that fetches HTML and injects CSS.
3.  **Randomizer Worker (`backend/randomizer`)**: The main game API that orchestrates data from D1 and the Filter worker.

---

## 1. Database Setup (Cloudflare D1)

### Create the Database
Run this command to create the database in your Cloudflare account:
```bash
wrangler d1 create gsrsites
```

### Configure `wrangler.toml`
The output will provide a `database_id`. Paste it into `backend/randomizer/wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "gsrsites"
database_id = "PASTE_YOUR_ID_HERE"
```

### Initialize Schema & Data
Apply the schema and seed data to the production database:
```bash
cd backend/randomizer
wrangler d1 execute gsrsites --remote --file=schema.sql
```

---

## 2. Deploying the Filter Worker

The Filter worker must be deployed first so you can get its production URL.

1.  Navigate to the directory:
    ```bash
    cd backend/filter
    ```
2.  Deploy to Cloudflare:
    ```bash
    wrangler deploy
    ```
3.  **Note the URL**: After deployment, Wrangler will provide a URL (e.g., `https://filter.your-subdomain.workers.dev`).

---

## 3. Deploying the Randomizer Worker

1.  Navigate to the directory:
    ```bash
    cd backend/randomizer
    ```
2.  **Update Environment Variables**:
    Open `wrangler.toml` and update the `FILTER_URL` in the `[vars]` section with the URL from Step 2:
    ```toml
    [vars]
    FILTER_URL = "https://filter.your-subdomain.workers.dev"
    ```
3.  Deploy to Cloudflare:
    ```bash
    wrangler deploy
    ```

---

## 4. Local Development Workflow

To test the entire system locally:

1.  **Start Filter Worker**:
    ```bash
    cd backend/filter
    pnpm run dev --port 8787
    ```

2.  **Initialize Local D1**:
    ```bash
    cd backend/randomizer
    wrangler d1 execute gsrsites --local --file=schema.sql
    ```

3.  **Start Randomizer Worker**:
    ```bash
    cd backend/randomizer
    # Ensure wrangler.toml [vars] FILTER_URL = "http://localhost:8787"
    pnpm run dev
    ```

4.  **Test the API**:
    ```bash
    curl http://localhost:8788/random
    ```

---

## Troubleshooting

### "Filter worker failed"
Ensure the `FILTER_URL` in the Randomizer's `wrangler.toml` is correct and accessible. If running locally, ensure the Filter worker is running on the expected port.

### D1 Query Errors
Ensure you have run the `wrangler d1 execute` command with the `--local` flag for local development and `--remote` for production.
