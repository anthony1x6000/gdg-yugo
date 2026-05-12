import { Hono } from 'hono';
import { cors } from 'hono/cors';

export interface Env {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

const ALLOWED_DOMAINS_CSV = 'youtube.com,bing.com,google.com,linkedin.com,brave.com,openbsd.org,instagram.com,p9f.org,docker.com,mcdonalds.com,burgerking.ca,timhortons.ca,filen.io,anthonyis.online,discord.com,github.com';
const ALLOWED_DOMAINS = ALLOWED_DOMAINS_CSV.split(',').map(d => d.trim().toLowerCase());

app.use('*', cors());

app.post('/push', async (c) => {
  try {
    const { website_address, css_payload, js_selector } = await c.req.json();

    if (!website_address) {
      return c.json({ error: 'website_address is required' }, 400);
    }

    // Remove www. from the domain
    let normalizedAddress = website_address.replace(/:\/\/(www\.)?/, '://');

    // Validate URL format and check against whitelist
    try {
      const url = new URL(normalizedAddress);
      const hostname = url.hostname.toLowerCase();

      const isAllowed = ALLOWED_DOMAINS.some(domain => 
        hostname === domain || hostname.endsWith('.' + domain)
      );

      if (!isAllowed) {
        return c.json({ 
          error: 'Domain not permitted', 
          message: `The domain ${hostname} is not in the whitelist.` 
        }, 403);
      }
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
