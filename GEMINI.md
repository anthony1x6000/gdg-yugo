# Project Instructions (Website Guessr)

This document outlines the architecture, tech stack, and conventions for the Website Guessr project.

## Project Overview
Website Guessr is a game where users guess a website based on its layout, with all identifying features stripped out.

## Architecture (Multi-Worker)

The backend is split into three specialized Cloudflare Workers:

### 1. Filter Worker (`backend/filter`)
- **Role:** Pure HTML proxy and CSS injector.
- **Input:** `site` URL and optional `css` string.

### 2. Randomizer Worker (`backend/randomizer`)
- **Role:** Game Logic & Selection.
- **Database:** Reads from Cloudflare D1 (`gsrsites`).

### 3. Pusher Worker (`backend/pusher`)
- **Role:** Contribution API.
- **Database:** Writes to Cloudflare D1 (`gsrsites`).
- **Function:** Allows users to submit new sites and CSS payloads.

## Tech Stack
- **Frontend:** React, TypeScript, TanStack Router/Query, Zustand.
- **Backend:** Cloudflare Workers (Hono).
- **Database:** Cloudflare D1 (SQLite).

## Development Rules
- Maintain separation between Game Logic (Randomizer), Utility (Filter), and Contributions (Pusher).
- All D1 writes happen via the Pusher worker.
