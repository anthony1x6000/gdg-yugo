# Cloudflare Workers & D1 Deployment Guide

This guide covers the end-to-end setup and deployment of the Website Guessr backend architecture.

## Architecture Overview

The system consists of three Workers and one D1 Database:
1.  **D1 Database (`gsrsites`)**: Stores website URLs and CSS anonymization rules.
2.  **Filter Worker (`backend/filter`)**: A utility worker that fetches HTML and injects CSS.
3.  **Randomizer Worker (`backend/randomizer`)**: The main game API that selects a random site.
4.  **Pusher Worker (`backend/pusher`)**: Allows users to contribute new sites/rules to the database.

---

## 1. Database Setup (Cloudflare D1)

### Create the Database
```bash
wrangler d1 create gsrsites
```

### Configure `wrangler.toml`
Paste the `database_id` into the `wrangler.toml` files of BOTH `randomizer` and `pusher`.

### Initialize Schema
```bash
cd backend/randomizer
wrangler d1 execute gsrsites --remote --file=schema.sql
```

---

## 2. Deploying Workers

### Filter Worker
```bash
cd backend/filter
wrangler deploy
```
*Note the URL provided after deployment.*

### Randomizer Worker
1. Update `FILTER_URL` in `backend/randomizer/wrangler.toml` with the Filter worker URL.
2. Deploy:
```bash
cd backend/randomizer
wrangler deploy
```

### Pusher Worker
```bash
cd backend/pusher
wrangler deploy
```

---

## Local Development

1.  **Start Filter**: `cd backend/filter && pnpm run dev --port 8787`
2.  **Initialize Local D1**: `cd backend/randomizer && wrangler d1 execute gsrsites --local --file=schema.sql`
3.  **Start Randomizer**: `cd backend/randomizer && pnpm run dev`
4.  **Start Pusher**: `cd backend/pusher && pnpm run dev --port 8789`
