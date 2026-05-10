import { Hono } from 'hono';
import { cors } from 'hono/cors';

export interface Env {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors());

app.post('/push', async (c) => {
  try {
    const { website_address, css_payload, js_selector } = await c.req.json();

    if (!website_address) {
      return c.json({ error: 'website_address is required' }, 400);
    }

    // Validate URL format
    try {
      new URL(website_address);
    } catch (e) {
      return c.json({ error: 'Invalid website_address format' }, 400);
    }

    const { success } = await c.env.DB.prepare(
      'INSERT INTO sites (website_address, css_payload, js_selector) VALUES (?, ?, ?)'
    ).bind(website_address, css_payload || '', js_selector || '').run();

    if (success) {
      return c.json({ message: 'Site pushed successfully' }, 201);
    } else {
      return c.json({ error: 'Failed to push site' }, 500);
    }
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'Site already exists in database' }, 409);
    }
    return c.json({ error: 'Internal Server Error', message: error.message }, 500);
  }
});

export default app;
