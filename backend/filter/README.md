# Website Guessr - Filter Worker

This worker acts as an HTML proxy that fetches a website and injects custom CSS to anonymize it.

## Development

Run the development server:
```bash
pnpm run dev --port 8787
```

## Deployment

Deploy to Cloudflare Workers:
```bash
pnpm run deploy
```

## API Endpoints

### `GET /`
Fetches HTML from a provided URL and returns it with optional CSS injection.

* **Query Parameters:**
  * `site` (string, **required**): The full URL of the website to scrape.
  * `css` (string, optional): CSS payload to inject.
