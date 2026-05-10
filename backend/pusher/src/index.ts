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

    // Remove www. from the domain
    let normalizedAddress = website_address.replace(/:\/\/(www\.)?/, '://');

    // Validate URL format
    try {
      new URL(normalizedAddress);
    } catch (e) {
      return c.json({ error: 'Invalid website_address format' }, 400);
    }

    const { success } = await c.env.DB.prepare(
      `INSERT INTO sites (website_address, css_payload, js_selector) 
       VALUES (?, ?, ?)
       ON CONFLICT(website_address) DO UPDATE SET
       css_payload = excluded.css_payload,
       js_selector = excluded.js_selector,
       updated_at = CURRENT_TIMESTAMP`
    ).bind(normalizedAddress, css_payload || '', js_selector || '').run();

    return c.json({ message: 'Site pushed/updated successfully' }, success ? 200 : 500);
  } catch (error: any) {
    return c.json({ error: 'Internal Server Error', message: error.message }, 500);
  }
});

export default app;
