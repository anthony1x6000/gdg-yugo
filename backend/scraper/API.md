# Backend Setup & Deployment Guide

This document provides a comprehensive guide on how to configure, develop, and deploy the `scraper` backend to a single Virtual Private Server (VPS). This backend is powered by **Fastify** for high-performance routing and **Drizzle ORM** with **SQLite** for data management.

## Prerequisites

Ensure you have Node.js and your preferred package manager (`pnpm` recommended) installed on both your local machine and your VPS.

```bash
pnpm install
```

## 1. Database Setup (SQLite)

The project uses a local SQLite database and Drizzle ORM. Drizzle automatically manages your local SQLite database file based on your configuration.

### Apply Migrations

To apply the database migrations and ensure your schema is up-to-date, run:

```bash
pnpm run db:push
# Or if using specific migration scripts:
pnpm run db:migrate
```

## 2. Local Development

You can run the Fastify backend locally using your development script, which typically leverages `tsx` or `ts-node-dev` for live reloading.

```bash
pnpm run dev
```

This starts a local Fastify server. Any changes you make to the source code will trigger a reload automatically. By default, Fastify will listen on a port like `3000` or `8080`, depending on your `src/index.ts` configuration.

## 3. VPS Deployment

Deploying your Fastify backend to a single VPS involves pulling your code, installing dependencies, building the TypeScript files, and running the application with a process manager like PM2.

### Server Setup

1. SSH into your VPS.
2. Ensure Node.js and `pnpm` are installed.
3. Clone the repository to your VPS.

```bash
git clone <your-repo-url>
cd <your-repo-directory>/backend
```

### Install Dependencies and Migrate

Once inside the project directory on your server:

```bash
pnpm install --prod=false # Ensure devDependencies for building
pnpm run db:migrate
```

### Running with PM2

We recommend using PM2 to keep your Fastify application running in the background. PM2 handles log management and restarts the app automatically if it crashes or the server reboots.

```bash
# Install PM2 globally
npm install -g pm2

# Build the TypeScript project into JavaScript
pnpm run build

# Start the Fastify application
pm2 start dist/index.js --name "fastify-scraper-backend"

# Save the PM2 process list so it starts on boot
pm2 save
pm2 startup
```

## 4. Reverse Proxy Configuration (Optional but Recommended)

For a production environment on a VPS, it is highly recommended to put Fastify behind a reverse proxy like Nginx or Caddy. This allows you to handle SSL/TLS termination and route traffic from port 80/443 to your Fastify app's internal port.

## Summary of Useful Commands

| Task | Command |
|------|---------|
| **Start Local Server** | `pnpm run dev` |
| **Apply Migrations** | `pnpm run db:migrate` |
| **Build Project** | `pnpm run build` |
| **Start on VPS** | `pm2 start dist/index.js` |
| **View Logs (VPS)** | `pm2 logs` |
| **Restart App (VPS)**| `pm2 restart fastify-scraper-backend` |
