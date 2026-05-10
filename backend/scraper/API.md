# Scraper Service API Documentation

The Scraper Service provides an endpoint to programmatically fetch a website's HTML for use in other applications.

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
| `css`     | string | No       | Optional CSS payload to inject into the HTML. Used for hiding elements or custom styling. |

**Success Response:**

*   **Code:** `200 OK`
*   **Content-Type:** `text/html`
*   **Body:** A string containing the raw HTML (optionally with injected CSS).

**Example Request with CSS Injection:**

```bash
curl "http://localhost:3000/scrape?url=https://example.com&css=.ad-container{display:none!important;}"
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

The service returns the exact HTML content received from the target URL. If the `css` parameter is provided, it is injected as a `<style>` block into the `<head>`, `<body>`, or at the end of the document. No other filtering or modifications are performed.

## Development

To run the service locally:

```bash
npm run dev
```

To run tests:

```bash
npm test
```
