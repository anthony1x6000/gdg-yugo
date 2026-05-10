# Database API Documentation

This document describes the Drizzle ORM schema, setup, and common database operations for the Website Guessr backend.

## Schema Overview

The database uses Cloudflare D1 and is managed via Drizzle ORM. 
The schema definitions are shared from the `@yugo/middleware` package.

### `siteCleanerRules` Table
Stores CSS injection rules used to anonymize websites based on their domain.

| Column | Type | Description |
| :--- | :--- | :--- |
| `domain` | `TEXT` (PK) | Primary Key. The domain name (e.g., `youtube.com`). |
| `cssInjection` | `TEXT` | The CSS rules to be injected for this domain. |
| `isActive` | `BOOLEAN` | Flag to enable/disable the rule. Defaults to `true`. |
| `createdBy` | `TEXT` (FK) | Optional reference to the user ID who created the rule. |

### `user` Table (Managed by better-auth in middleware)
Stores user accounts and game statistics.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `TEXT` (PK) | Unique user ID. |
| `username` | `TEXT` | The user's chosen display name. |
| `profilePictureUrl` | `TEXT` | Optional URL to the user's avatar. |
| `highscore` | `INTEGER` | The user's highest achieved score in the game. Defaults to 0. |

*(Note: Other standard auth fields like name, email, etc., may also exist on the user table).*

---

## Cloudflare D1 Connection

### 1. `wrangler.toml` Configuration
Ensure your `wrangler.toml` in the scraper directory has the D1 database binding:
```toml
[[d1_databases]]
binding = "DB"
database_name = "site-rules-db"
database_id = "your-database-id"
```

### 2. Initializing Drizzle Client
The Drizzle client is initialized within the route handlers using the Cloudflare Worker environment variables.

```typescript
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './src/db/schema.js';

// Inside a Hono route or fetch handler:
const db = drizzle(c.env.DB, { schema });
```

---

## Example Queries (Drizzle ORM)

Here are practical examples of how the database is queried within the application.

### Example 1: Updating a User's Highscore
This example checks if a user's new score is higher than their current highscore before updating.

```typescript
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from './src/db/schema.js';

const db = drizzle(env.DB, { schema });
const newScore = 150;
const userId = "user_12345";

// 1. Fetch the user
const user = await db.query.user.findFirst({
  where: eq(schema.user.id, userId)
});

// 2. Update if the new score is higher
if (user && newScore > (user.highscore || 0)) {
  await db.update(schema.user)
    .set({ highscore: newScore })
    .where(eq(schema.user.id, userId));
}
```

### Example 2: Fetching the Leaderboard
This query retrieves the top 10 users with the highest scores, returning only the necessary columns.

```typescript
import { drizzle } from 'drizzle-orm/d1';
import { desc } from 'drizzle-orm';
import * as schema from './src/db/schema.js';

const db = drizzle(env.DB, { schema });

const topUsers = await db.query.user.findMany({ 
  columns: { 
    username: true, 
    profilePictureUrl: true, 
    highscore: true 
  }, 
  orderBy: [desc(schema.user.highscore)], 
  limit: 10 
});
```

### Example 3: Upserting a Site Rule
When a user submits a rule, we insert it, or update it if a rule for that domain already exists (upsert).

```typescript
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './src/db/schema.js';

const db = drizzle(env.DB, { schema });
const domain = "reddit.com";
const cssInjection = "header, .thumbnail { display: none; }";
const userId = "user_12345"; // Can be null if guest

await db.insert(schema.siteCleanerRules)
  .values({ 
    domain, 
    cssInjection, 
    isActive: true, 
    createdBy: userId 
  })
  .onConflictDoUpdate({ 
    target: schema.siteCleanerRules.domain, 
    set: { 
      cssInjection, 
      isActive: true, 
      createdBy: userId 
    } 
  });
```

### Example 4: Finding an Active Rule for Scraping
When scraping a URL, we need to find if there is an active rule for that domain.

```typescript
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import * as schema from './src/db/schema.js';

const db = drizzle(env.DB, { schema });
const targetDomain = "github.com";

const dbRule = await db.query.siteCleanerRules.findFirst({
  where: and(
    eq(schema.siteCleanerRules.domain, targetDomain),
    eq(schema.siteCleanerRules.isActive, true)
  )
});

if (dbRule) {
  console.log("Found CSS rule:", dbRule.cssInjection);
}
```
