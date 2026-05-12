# Website Guessr - Pusher Worker

This worker allows users to submit new websites and CSS anonymization payloads to the `gsrsites` D1 database.

## API Endpoints

### `POST /push`
Adds a new site to the database. Only permitted domains are accepted.

**Permitted Domains:**
YouTube, Bing, Google, LinkedIn, Brave, OpenBSD, Instagram, p9f.org, Docker, McDonald's, Burger King, Tim Hortons, Filen, Anthonyis.online, Discord, and GitHub.

**Request Body:**
```json
{
  "website_address": "https://example.com",
  "css_payload": ".header { display: none; }"
}
```

**Response Example (201 Created):**
```json
{
  "message": "Site pushed successfully"
}
```

## Setup

1.  Ensure `wrangler.toml` has the correct `database_id` for `gsrsites`.
2.  Deploy: `wrangler deploy`.
