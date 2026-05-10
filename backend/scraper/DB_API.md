# Database API Documentation

This document describes the Drizzle ORM schema and common database operations for the Scraper backend.

## Schema Overview

### `site_cleaner_rules` Table

This table stores CSS injection rules for specific domains to clean up scraped content.

| Column | Type | Drizzle Type | Description |
| :--- | :--- | :--- | :--- |
| `domain` | `TEXT` | `text` | Primary Key. The domain name (e.g., `example.com`). |
| `css_injection` | `TEXT` | `text` | The CSS rules to be injected for this domain. |
| `is_active` | `BOOLEAN` | `integer` (mode: `boolean`) | Flag to enable/disable the rule. Defaults to `true`. |

#### Indexes
- `idx_domain_active`: Index on `domain` for fast lookups.

## Cloudflare D1 Connection

### 1. Configure `wrangler.toml`

Ensure your `wrangler.toml` has the D1 database binding:

```toml
[[d1_databases]]
binding = "DB" # This is the name used in your code
database_name = "site-rules-db"
database_id = "your-database-id"
```

### 2. Initialize Drizzle Client

In your Cloudflare Worker (`index.ts`), initialize the Drizzle client using the D1 binding from the `env` object.

```typescript
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './db/schema';

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const db = drizzle(env.DB, { schema });
    
    // Now you can use db for queries
    // ...
  },
};
```

### 3. Database Migrations

#### Generate Migrations
```bash
npx drizzle-kit generate
```

#### Apply Migrations Locally
```bash
npx wrangler d1 migrations apply site-rules-db --local
```

#### Apply Migrations to Production
```bash
npx wrangler d1 migrations apply site-rules-db --remote
```

---

## Example Queries (Drizzle ORM)

### Import Schema

```typescript
import { siteCleanerRules } from './db/schema';
import { eq } from 'drizzle-orm';
```

### Create (Insert)

```typescript
await db.insert(siteCleanerRules).values({
  domain: 'example.com',
  cssInjection: '.ad-banner { display: none; }',
  isActive: true,
});
```

### Read (Select)

#### Get rule by domain
```typescript
const rule = await db.query.siteCleanerRules.findFirst({
  where: eq(siteCleanerRules.domain, 'example.com'),
});
```

#### Get all active rules
```typescript
const activeRules = await db.select()
  .from(siteCleanerRules)
  .where(eq(siteCleanerRules.isActive, true));
```

### Update

```typescript
await db.update(siteCleanerRules)
  .set({ cssInjection: 'body { background: red; }' })
  .where(eq(siteCleanerRules.domain, 'example.com'));
```

### Delete

```typescript
await db.delete(siteCleanerRules)
  .where(eq(siteCleanerRules.domain, 'example.com'));
```
