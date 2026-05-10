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
      'SELECT id, website_address, css_payload FROM sites ORDER BY RANDOM() LIMIT 1'
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

    const filterResponse = await fetch(filterUrl.toString());
    if (!filterResponse.ok) {
      throw new Error('Filter worker failed');
    }

    const html = await filterResponse.text();

    return c.json({
      html,
      correct_domain: correctSite.website_address,
      options
    });
  } catch (error: any) {
    return c.json({ error: 'Internal Server Error', message: error.message }, 500);
  }
});

export default app;
