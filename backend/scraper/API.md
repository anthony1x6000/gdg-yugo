# Cloudflare & Wrangler Setup Guide

This document provides a comprehensive guide on how to configure, develop, and deploy the `scraper` backend to Cloudflare Workers using the Wrangler CLI. It also covers the setup and migration of the Cloudflare D1 database.

## Prerequisites

Ensure you have Node.js and `npm` (or `pnpm`) installed. The project dependencies should already be installed via:

```bash
pnpm install
```

Wrangler is the official Cloudflare developer CLI. It is installed as a development dependency. To run it, prefix commands with `npx` or use your package manager (e.g., `npx wrangler` or `pnpm exec wrangler`).

## 1. Authenticate with Cloudflare

Before creating resources or deploying, you need to log in to your Cloudflare account.

```bash
npx wrangler login
```

This command will open a browser window and prompt you to authorize Wrangler to access your Cloudflare account.

## 2. Set Up Cloudflare D1 (Database)

The project uses Cloudflare D1 (a serverless SQLite database) and Drizzle ORM.

### Create the Remote Database

Run the following command to create a new D1 database named `site-rules-db` (as configured in `wrangler.toml`):

```bash
npx wrangler d1 create site-rules-db
```

The output will look something like this:

```text
✅ Successfully created DB 'site-rules-db' in region EEUR
Created your database using D1's new storage backend. The new storage backend is not yet recommended for production workloads, but backs up your data via point-in-time recovery.

[[d1_databases]]
binding = "DB"
database_name = "site-rules-db"
database_id = "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx"
```

### Update `wrangler.toml`

Copy the `database_id` from the output above and update your `backend/wrangler.toml` file to replace `YOUR_DATABASE_ID_HERE`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "site-rules-db"
database_id = "YOUR_NEW_DATABASE_ID"
```

## 3. Database Migrations (Drizzle ORM)

The project uses Drizzle ORM to manage the database schema. Drizzle generates SQL migration files located in the `drizzle/` directory.

### Apply Migrations Locally

To apply the migrations to your local development database (for testing with `wrangler dev`):

```bash
npx wrangler d1 migrations apply site-rules-db --local
```

### Apply Migrations Remotely (Production)

Once you are ready to deploy to production, apply the migrations to the live Cloudflare D1 database:

```bash
npx wrangler d1 migrations apply site-rules-db --remote
```

## 4. Local Development

You can run the worker locally. Wrangler will simulate the Cloudflare Worker environment and automatically use a local version of the D1 database.

```bash
npx wrangler dev
```

This starts a local server (usually on `http://localhost:8787`). Any changes you make to `src/index.ts` or other files will be live-reloaded.

*(Note: If you need your local environment to connect to the actual remote D1 database instead of the local simulation, run `npx wrangler dev --remote`.)*

## 5. Type Generation

Whenever you update bindings in `wrangler.toml` (e.g., adding KV namespaces, R2 buckets, or changing D1 configurations), you should regenerate the TypeScript definitions so your editor provides accurate auto-completion.

```bash
npx wrangler types
```

This generates or updates the `worker-configuration.d.ts` file.

## 6. Deployment

Deploying your Worker to Cloudflare's edge network is straightforward. Make sure you have applied your remote D1 migrations first.

```bash
npx wrangler deploy
```

Wrangler will bundle your code, upload it to Cloudflare, and provide you with a live URL (e.g., `https://scraper.<your-subdomain>.workers.dev`).

## Summary of Useful Commands

| Task | Command |
|------|---------|
| **Start Local Server** | `npx wrangler dev` |
| **Create DB** | `npx wrangler d1 create site-rules-db` |
| **Local Migrations** | `npx wrangler d1 migrations apply site-rules-db --local` |
| **Remote Migrations** | `npx wrangler d1 migrations apply site-rules-db --remote` |
| **Generate Types** | `npx wrangler types` |
| **Deploy to Production** | `npx wrangler deploy` |
| **View Live Logs** | `npx wrangler tail` |
