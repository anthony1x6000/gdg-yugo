# Scraper Service API Documentation

The Scraper Service provides an endpoint to programmatically fetch a website's HTML and filter it for safe embedding into a frontend application.

## Base URL

By default, the service runs at: `http://localhost:3000`

## Endpoints

### Scrape Website

Fetches the HTML from a provided URL and returns the raw content as found.

**URL:** `/scrape`

**Method:** `GET`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url`     | string | Yes      | The full URL of the website to scrape (e.g., `https://example.com`). Must be a valid URI. |

**Success Response:**

*   **Code:** `200 OK`
*   **Content-Type:** `text/html`
*   **Body:** A string containing the raw HTML of the scraped page.

**Example Request:**

```bash
curl "http://localhost:3000/scrape?url=https://example.com"
```

**Error Responses:**

*   **Code:** `400 Bad Request`
    *   **Reason:** Missing `url` parameter or the provided string is not a valid URI.
    *   **Body:** JSON object detailing the validation error.
*   **Code:** `500 Internal Server Error`
    *   **Reason:** The target website could not be reached.
    *   **Body:**
        ```json
        {
          "error": "Failed to scrape website",
          "message": "Specific error details"
        }
        ```

## Scraped Content

The service returns the exact HTML content received from the target URL without any filtering or modifications.

## Development

To run the service locally:

```bash
npm run dev
```

To run tests:

```bash
npm test
```
