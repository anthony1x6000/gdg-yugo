import { Hono } from 'hono';
import { cors } from 'hono/cors';

export interface Env {
  DB: D1Database;
  FILTER_URL: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors());

app.get('/random', async (c) => {
  try {
    // 1. Get a random site from D1
    const { results } = await c.env.DB.prepare(
      'SELECT id, website_address, css_payload, js_selector FROM sites ORDER BY RANDOM() LIMIT 1'
    ).all();

    if (!results || results.length === 0) {
      return c.json({ error: 'No sites found in database' }, 404);
    }

    const correctSite = results[0];

    // 2. Get 3 additional random sites for options (total 4 choices)
    const { results: optionsResults } = await c.env.DB.prepare(
      'SELECT website_address FROM sites WHERE id != ? ORDER BY RANDOM() LIMIT 3'
    ).bind(correctSite.id).all();

    const options = [correctSite.website_address, ...optionsResults.map((r: any) => r.website_address)];
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    // 3. Call the filter worker
    const filterUrl = new URL(c.env.FILTER_URL);
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
      console.error(`Filter worker failed: ${filterResponse.status} ${errorText}`);
      throw new Error(`Filter worker failed with status ${filterResponse.status}: ${errorText}`);
    }

    const imageBuffer = await filterResponse.arrayBuffer();
    const base64Image = btoa(
      new Uint8Array(imageBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

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
