# Project Instructions (Website Guessr)

This document outlines the architecture, tech stack, and conventions for the Website Guessr project.

## Project Overview
Website Guessr is a game where users guess a website based on its layout, with all identifying features stripped out.

## Architecture (Multi-Worker)

The backend is split into three specialized Cloudflare Workers:

### 1. Filter Service (`backend/filter`)
- **Role:** Puppeteer-based screenshot service.
- **Platform:** Node.js (Hono). Run via Docker in development to handle system dependencies.
- **Input:** `site` URL, optional `css` string, and optional `selector`.

### 2. Randomizer Worker (`backend/randomizer`)
- **Role:** Game Logic & Selection.
- **Database:** Reads from Cloudflare D1 (`gsrsites`).

### 3. Pusher Worker (`backend/pusher`)
- **Role:** Contribution API.
- **Database:** Writes to Cloudflare D1 (`gsrsites`).
- **Function:** Allows users to submit new sites and CSS payloads.

## Tech Stack
- **Frontend:** React, TypeScript, TanStack Router/Query, Zustand.
- **Backend:** Cloudflare Workers (Hono), Node.js (Filter Service).
- **Database:** Cloudflare D1 (SQLite).
- **Dev Ops:** Docker (for Filter Service).

## Development Rules
- Maintain separation between Game Logic (Randomizer), Utility (Filter), and Contributions (Pusher).
- All D1 writes happen via the Pusher worker.
