import { Hono } from 'hono';
import { cors } from 'hono/cors';

export interface Env {
  DB: D1Database;
  FILTER_URL?: string;
  SCREENSHOTS: R2Bucket;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: '*',
  allowMethods: ['*'],
  allowHeaders: ['*'],
  exposeHeaders: ['*'],
  maxAge: 86400,
}));

app.get('/random', async (c) => {
  try {
    // 1. Get a random site from D1
    const { results } = await c.env.DB.prepare(
      'SELECT id, website_address, css_payload, js_selector, updated_at FROM sites ORDER BY RANDOM() LIMIT 1'
    ).all();

    if (!results || results.length === 0) {
      return c.json({ error: 'No sites found in database' }, 404);
    }

    const correctSite = results[0];

    if (!correctSite.website_address) {
      return c.json({ error: 'Site has no URL' }, 500);
    }

    // 2. Check R2 Cache
    const rawUpdatedAt = correctSite.updated_at;
    const safeUpdatedAt = rawUpdatedAt != null ? String(rawUpdatedAt).replace(/[: -]/g, '') : '';
    const cacheKey = `site-${correctSite.id}-${safeUpdatedAt}.png`;
    let imageBuffer: ArrayBuffer | undefined;

    if (c.env.SCREENSHOTS) {
      const cached = await c.env.SCREENSHOTS.get(cacheKey);
      if (cached) {
        console.log(`Cache hit for ${correctSite.website_address}`);
        imageBuffer = await cached.arrayBuffer();
      }
    }

    // 3. Call filter worker if no cache hit
    let isCacheMiss = false;
    if (!imageBuffer) {
      isCacheMiss = true;
      const targetFilterUrl = c.env.FILTER_URL || 'http://filter.anthonyis.online/';
      console.log(`Cache miss for ${correctSite.website_address}, calling filter at ${targetFilterUrl}...`);
      const filterUrl = new URL(targetFilterUrl);
      filterUrl.searchParams.set('site', correctSite.website_address as string);
      if (correctSite.css_payload) {
        filterUrl.searchParams.set('css', correctSite.css_payload as string);
      }
      if (correctSite.js_selector) {
        filterUrl.searchParams.set('selector', correctSite.js_selector as string);
      }

      const filterResponse = await fetch(filterUrl.toString());
      if (!filterResponse.ok) {
        const errorText = await filterResponse.text();
        throw new Error(`Filter worker failed with status ${filterResponse.status}: ${errorText}`);
      }

      imageBuffer = await filterResponse.arrayBuffer();

      // Store in R2 (background)
      if (c.env.SCREENSHOTS) {
        c.executionCtx.waitUntil(
          c.env.SCREENSHOTS.put(cacheKey, imageBuffer)
        );
      }
    }

    const base64Image = btoa(
      new Uint8Array(imageBuffer!)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    // 4. Get 3 additional random sites for options (total 4 choices)
    const { results: optionsResults } = await c.env.DB.prepare(
      'SELECT website_address FROM sites WHERE id != ? ORDER BY RANDOM() LIMIT 3'
    ).bind(correctSite.id).all();

    const options = [correctSite.website_address, ...optionsResults.map((r: any) => r.website_address)];
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return c.json({
      image: `data:image/png;base64,${base64Image}`,
      correct_domain: correctSite.website_address,
      options
    });
  } catch (error: any) {
    console.error('Randomizer Error:', error);
    return c.json({ 
      error: 'Internal Server Error', 
      message: error.message,
      stack: error.stack
    }, 500);
  }
});

export default app;
