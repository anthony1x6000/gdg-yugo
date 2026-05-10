# Filter API Documentation

The filter backend is a Node.js server using Hono and Puppeteer. It visits a provided URL, optionally injects CSS to hide elements, optionally clicks a specified selector, and returns a screenshot (PNG).

## Base URL

Local: `http://localhost:8789`

## Endpoints

### 1. Capture Screenshot
Fetches the target URL, applies optional CSS/JS, and returns a PNG screenshot.

* **URL:** `/` (Root)
* **Method:** `GET`
* **Query Parameters:**
  * `site` (string, **required**): The full URL of the website to capture.
  * `css` (string, optional): CSS payload to inject into the page before taking the screenshot. Useful for hiding elements.
  * `selector` (string, optional): A CSS selector to click before taking the screenshot (e.g., an "Enter" button). It will wait for the selector to appear and wait 2 seconds after clicking before capturing.

#### Examples

**Basic Screenshot:**
```bash
# Saves the output to capture.png
curl -o capture.png "http://localhost:8789/?site=https://example.com"
```

**Hide elements with CSS:**
```bash
# Hide the header before taking a screenshot
# URL-encoded: header { display: none !important; }
curl -o capture.png "http://localhost:8789/?site=https://example.com&css=header%20%7B%20display%3A%20none%20%21important%3B%20%7D"
```

**Click an element before screenshot:**
```bash
# Click a button with class .accept-btn
curl -o capture.png "http://localhost:8789/?site=https://example.com&selector=.accept-btn"
```

**Combined (URL encoding is required for complex CSS/selectors):**
```bash
curl -o capture.png "http://localhost:8789/?site=https://example.com&css=.banner%7Bdisplay%3Anone%7D&selector=%23enter-site"
```

## Responses

* **Success (200 OK):** Returns the raw PNG image (`Content-Type: image/png`).
* **Error (400 Bad Request):** If the `site` parameter is missing.
  ```json
  { "error": "site argument is required" }
  ```
* **Error (500 Internal Server Error):** If navigation or screenshot capture fails.
  ```json
  { 
    "error": "Failed to capture site", 
    "message": "Error details",
    "target": "https://example.com" 
  }
  ```