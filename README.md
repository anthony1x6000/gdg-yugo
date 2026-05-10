# Website Guessr

Website Guessr is a game where you guess websites from their bare layouts.

## Backend Architecture

The project uses a dual-worker setup on Cloudflare Workers:

- **Filter Worker:** Handles HTML scraping and CSS injection.
- **Randomizer Worker:** Manages game state, multiple-choice options, and D1 database integration.

## Getting Started

### Database Setup
1. Create a D1 database: `wrangler d1 create gsrsites`.
2. Initialize schema: `wrangler d1 execute gsrsites --local --file=backend/randomizer/schema.sql`.

### Running Locally
1. Start the Filter worker: `cd backend/filter && pnpm run dev --port 8787`.
2. Start the Randomizer worker: `cd backend/randomizer && pnpm run dev`.
3. Start the Frontend: `cd frontend && pnpm run dev`.

Refer to [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md) for complete Cloudflare setup and deployment instructions.
