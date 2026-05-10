# Backend API Documentation

The backend is a Cloudflare Worker that provides a simple HTML proxy for scraping websites with optional CSS injection.

## Base URL

Local: `http://localhost:8787`

## Endpoints

### 1. Scrape Website
Fetches HTML from a provided URL and returns it with optional CSS injection.

* **URL:** `/` (Root)
* **Method:** `GET`
* **Query Parameters:**
  * `site` (string, **required**): The full URL of the website to scrape.
  * `css` (string, optional): CSS payload to inject into the HTML.

#### Example
```bash
curl "http://localhost:8787/?site=https://example.com&css=body%20{%20display:%20none;%20}"
```
