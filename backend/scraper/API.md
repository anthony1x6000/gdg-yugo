# Scraper Service API Documentation

The Scraper Service is a Cloudflare Worker that handles web scraping, CSS injection, user highscores, leaderboards, and site rules for the Website Guessr game.

## Base URL

When running locally: `http://localhost:8787` (or your configured port).
In production, it will be your deployed Cloudflare Worker URL.

## Endpoints

---

### 1. Scrape Website
Fetches the HTML from a provided URL and returns the raw content with optional CSS injection. 
It automatically checks the `site_cleaner_rules` table for the domain and injects the rules if found, unless the `css` query parameter is explicitly provided.

* **URL:** `/scrape`
* **Method:** `GET`
* **Query Parameters:**
  * `url` (string, **required**): The full URL of the website to scrape.
  * `css` (string, optional): CSS payload to inject. Overrides any database rules for the domain.

#### Example: Basic Scrape
```bash
curl "http://localhost:8787/scrape?url=https://example.com"
```

#### Example: Scrape with Custom CSS Injection
```bash
curl "http://localhost:8787/scrape?url=https://example.com&css=body%20%7B%20display%3A%20none%3B%20%7D"
```

#### Example Response (200 OK)
Returns the raw `text/html` of the scraped site with the injected `<style>` tag.

#### Example Error Response (400 Bad Request)
```json
{
  "error": "URL is required"
}
```

---

### 2. Update Highscore
Updates the current authenticated user's highscore, but only if the provided score is strictly greater than their current highscore.

* **URL:** `/highscore`
* **Method:** `POST`
* **Headers:**
  * Requires authentication headers (handled by `better-auth`).
* **Body:** JSON
  * `score` (number, **required**): The player's new score.

#### Example Request
```bash
curl -X POST "http://localhost:8787/highscore" \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN" \
  -d '{"score": 42}'
```

#### Example Responses

**Success - Highscore Updated (200 OK)**
```json
{
  "message": "Highscore updated",
  "newHighscore": 42
}
```

**Success - Score Not High Enough (200 OK)**
```json
{
  "message": "Score not high enough",
  "currentHighscore": 50
}
```

**Error - Unauthorized (401 Unauthorized)**
```json
{
  "error": "Unauthorized"
}
```

---

### 3. Get Leaderboard
Fetches the top 10 users with the highest scores.

* **URL:** `/leaderboard`
* **Method:** `GET`

#### Example Request
```bash
curl "http://localhost:8787/leaderboard"
```

#### Example Response (200 OK)
```json
[
  {
    "username": "PlayerOne",
    "profilePictureUrl": "https://example.com/p1.jpg",
    "highscore": 999
  },
  {
    "username": "PlayerTwo",
    "profilePictureUrl": null,
    "highscore": 850
  }
]
```

---

### 4. Create or Update Site Rule
Adds or updates a CSS injection rule for a specific domain. Both authenticated users and guests can submit rules, though the `createdBy` field will be null for guests.

* **URL:** `/rules`
* **Method:** `POST`
* **Body:** JSON
  * `domain` (string, **required**): The domain name (e.g., `google.com`).
  * `cssInjection` (string, **required**): The CSS code to hide logos, text, etc.
  * `isActive` (boolean, optional): Whether the rule should be active. Defaults to `true`.

#### Example Request
```bash
curl -X POST "http://localhost:8787/rules" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "news.ycombinator.com",
    "cssInjection": "img, .votearrow { display: none !important; }",
    "isActive": true
  }'
```

#### Example Response (200 OK)
```json
{
  "message": "Rule saved successfully"
}
```

#### Example Error Response (400 Bad Request)
```json
{
  "error": "Domain and CSS injection required"
}
```
