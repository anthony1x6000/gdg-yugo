# Website Guessr - Randomizer Worker

This worker selects a random website from a Cloudflare D1 database, calls the `filter` worker to anonymize the HTML, and returns the result along with multiple-choice options.

## Setup Instructions

### 1. Create the D1 Database
Create the `gsrsites` database in your Cloudflare account:
```bash
wrangler d1 create gsrsites
```
Copy the `database_id` from the output and paste it into `wrangler.toml`.

### 2. Initialize the Schema
Apply the schema and seed data to your D1 database:

**Local Development:**
```bash
wrangler d1 execute gsrsites --local --file=schema.sql
```

**Production:**
```bash
wrangler d1 execute gsrsites --remote --file=schema.sql
```

### 3. Configure the Filter URL
In `wrangler.toml`, ensure `FILTER_URL` points to your deployed `filter` worker URL (or `http://localhost:8787` for local testing).
## Database Setup

To initialize or reset your local D1 database (useful if you encounter schema errors like missing columns):

```bash
npm run init-db
```

This will recreate the `sites` table with the latest schema and seed data.

## Development

Run the development server:

```bash
pnpm run dev
```


## API Endpoints

### `GET /random`
Returns a random website's anonymized HTML and 4 multiple-choice options.

**Response Example:**
```json
{
  "html": "<html>...</html>",
  "correct_domain": "https://google.com",
  "options": [
    "https://github.com",
    "https://google.com",
    "https://news.ycombinator.com",
    "https://reddit.com"
  ]
}
```
