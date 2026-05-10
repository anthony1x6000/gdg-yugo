# Scraper Service API Documentation (Cloudflare Worker)

The Scraper Service is a Cloudflare Worker that fetches a website's HTML and optionally injects CSS rules stored in a D1 database or provided via query parameters.

## Base URL

When running locally: `http://localhost:8787`

## Endpoints

### Scrape Website

Fetches the HTML from a provided URL and returns the raw content with optional CSS injection.

**URL:** `/scrape`

**Method:** `GET`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url`     | string | Yes      | The full URL of the website to scrape. |
| `css`     | string | No       | Optional CSS payload to inject. Overrides any database rules. |

**Success Response:**

*   **Code:** `200 OK`
*   **Content-Type:** `text/html`
*   **Body:** Raw HTML (optionally with injected CSS).

## Database Rules

The service automatically checks a Cloudflare D1 database for rules matching the target domain.

- **Table:** `site_cleaner_rules`
- **Columns:**
  - `domain` (TEXT, PK): The hostname of the site.
  - `css_injection` (TEXT): The CSS to inject.
  - `is_active` (BOOLEAN): Whether the rule is currently active.

If an active rule is found for the domain, its CSS will be injected unless the `css` query parameter is provided (which takes precedence).

## Development

Install dependencies:
```bash
npm install
```

Generate migrations:
```bash
npm run generate
```

Apply migrations locally:
```bash
npm run migrate:local
```

Run locally:
```bash
npm run dev
```
