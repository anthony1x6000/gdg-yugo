import { Hono } from 'hono';
import { cors } from 'hono/cors';
import sanitizeHtml from 'sanitize-html';

export interface Env {
  DB: D1Database;
  SECRET_KEY_TURNSTILE: string;
}

const app = new Hono<{ Bindings: Env }>();

const ALLOWED_DOMAINS_CSV = 'youtube.com,bing.com,google.com,linkedin.com,brave.com,openbsd.org,instagram.com,p9f.org,docker.com,mcdonalds.com,burgerking.ca,timhortons.ca,filen.io,anthonyis.online,discord.com,github.com';
const ALLOWED_DOMAINS = ALLOWED_DOMAINS_CSV.split(',').map(d => d.trim().toLowerCase());

app.use('*', cors());

app.post('/push', async (c) => {
  try {
    const { website_address, css_payload, js_selector, turnstile_token } = await c.req.json();

    if (!turnstile_token) {
      return c.json({ error: 'Verification required', message: 'Turnstile token is missing.' }, 400);
    }

    // Verify Turnstile Token
    const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const result = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: c.env.SECRET_KEY_TURNSTILE,
        response: turnstile_token,
        remoteip: c.req.header('cf-connecting-ip') || '',
      }),
    });

    const outcome: any = await result.json();
    if (!outcome.success) {
      return c.json({ error: 'Verification failed', message: 'Turnstile verification failed.' }, 403);
    }

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

    // Sanitize payloads to remove any HTML tags (like <script>)
    const cleanCss = css_payload ? sanitizeHtml(css_payload, { allowedTags: [], allowedAttributes: {} }) : '';
    const cleanSelector = js_selector ? sanitizeHtml(js_selector, { allowedTags: [], allowedAttributes: {} }) : '';

    // Block @import and url() in CSS and selectors to prevent XSS and unauthorized resource loading
    const securityPattern = /@import|url\s*\(/i;
    if (securityPattern.test(cleanCss) || securityPattern.test(cleanSelector)) {
      return c.json({ 
        error: 'Security violation', 
        message: 'CSS and selectors cannot contain @import or url().' 
      }, 400);
    }

    const { success } = await c.env.DB.prepare(
      `INSERT INTO sites (website_address, css_payload, js_selector) 
       VALUES (?, ?, ?)
       ON CONFLICT(website_address) DO UPDATE SET
       css_payload = excluded.css_payload,
       js_selector = excluded.js_selector,
       updated_at = CURRENT_TIMESTAMP`
    ).bind(normalizedAddress, cleanCss, cleanSelector).run();

    return c.json({ message: 'Site pushed/updated successfully' }, success ? 200 : 500);
  } catch (error: any) {
    return c.json({ error: 'Internal Server Error', message: error.message }, 500);
  }
});

export default app;
