import { drizzle } from 'drizzle-orm/d1';
import * as schema from './db/schema.js';
import { eq, and } from 'drizzle-orm';
import * as cheerio from 'cheerio';

export interface Env {
  DB: D1Database;
}

/**
 * Cloudflare Worker handler for the scraper service.
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname !== '/scrape') {
      return new Response('Not Found', { status: 404 });
    }

    const targetUrl = url.searchParams.get('url');
    let queryCss = url.searchParams.get('css');

    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const targetUri = new URL(targetUrl);
      const domain = targetUri.hostname;

      // 1. Fetch Rules from D1
      const db = drizzle(env.DB, { schema });
      const dbRule = await db.query.siteCleanerRules.findFirst({
        where: and(
          eq(schema.siteCleanerRules.domain, domain),
          eq(schema.siteCleanerRules.isActive, true)
        )
      });

      // 2. Fetch the website
      // Note: Cloudflare Workers fetch doesn't support maxRedirects directly in the same way as axios,
      // but by default it follows redirects up to 20 times (or can be set to 'manual').
      // We will keep default redirect behavior for now unless requested otherwise.
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const rawHtml = await response.text();
      let finalHtml = rawHtml;

      // 3. Determine CSS to inject (DB rule OR query param)
      const cssToInject = queryCss || dbRule?.cssInjection;

      if (cssToInject) {
        const styleTag = `\n<style>\n${cssToInject}\n</style>\n`;
        // Try to inject before </head>, otherwise before </body>, otherwise append
        if (finalHtml.includes('</head>')) {
          finalHtml = finalHtml.replace('</head>', `${styleTag}</head>`);
        } else if (finalHtml.includes('</body>')) {
          finalHtml = finalHtml.replace('</body>', `${styleTag}</body>`);
        } else {
          finalHtml += styleTag;
        }
      }

      return new Response(finalHtml, {
        headers: { 'Content-Type': 'text/html' }
      });

    } catch (error: any) {
      return new Response(JSON.stringify({ 
        error: 'Failed to scrape website',
        message: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
