# Project Instructions (Website Guessr)

This document outlines the architecture, tech stack, and conventions for the Website Guessr project.

## Project Overview
Website Guessr is a game where users guess a website based on its layout, with all identifying features stripped out.

## Architecture (Multi-Worker)

The backend is split into two specialized Cloudflare Workers:

### 1. Filter Worker (`backend/filter`)
- **Role:** Pure HTML proxy and CSS injector.
- **Function:** Fetches a site and injects a CSS payload to hide logos/text.
- **Input:** `site` URL and optional `css` string.

### 2. Randomizer Worker (`backend/randomizer`)
- **Role:** Orchestrator and Game Logic.
- **Database:** Cloudflare D1 (`gsrsites`).
- **Function:** 
  - Picks a random site/CSS pair from D1.
  - Fetches 3 additional decoy domains.
  - Calls the Filter worker to get anonymized HTML.
  - Returns HTML, the correct domain, and 4 shuffled options.

## Tech Stack

### Frontend
- **React**, **TypeScript**, **TanStack Router/Query**, **Zustand**.

### Backend
- **Cloudflare Workers** (Hono).
- **Cloudflare D1** (SQLite).

## Development Rules
- Maintain separation between Game Logic (Randomizer) and Utility (Filter).
- Use strict TypeScript types.
- All database interactions must be through the Randomizer worker.
