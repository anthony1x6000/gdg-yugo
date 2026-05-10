import { drizzle } from 'drizzle-orm/d1';
import * as schema from './db/schema.js';
import { eq, and } from 'drizzle-orm';

export interface Env {
  DB: D1Database;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Cloudflare Worker handler for the scraper service.
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // --- API ROUTES ---
    if (url.pathname === '/api/rules') {
      const db = drizzle(env.DB, { schema });
      
      if (request.method === 'GET') {
        const allRules = await db.select().from(schema.siteCleanerRules);
        return new Response(JSON.stringify(allRules), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (request.method === 'POST') {
        const body: any = await request.json();
        await db.insert(schema.siteCleanerRules).values(body);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    if (url.pathname.startsWith('/api/rules/')) {
       const db = drizzle(env.DB, { schema });
       const domain = url.pathname.split('/').pop()!;

       if (request.method === 'DELETE') {
         await db.delete(schema.siteCleanerRules).where(eq(schema.siteCleanerRules.domain, domain));
         return new Response(JSON.stringify({ success: true }), {
           headers: { ...corsHeaders, 'Content-Type': 'application/json' }
         });
       }
    }

    // --- SCRAPE ROUTE ---
    if (url.pathname !== '/scrape') {
      return new Response('Not Found', { status: 404 });
    }

    const targetUrl = url.searchParams.get('url');
    let queryCss = url.searchParams.get('css');
    const interactive = url.searchParams.has('interactive');

    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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
        const styleTag = `\n<style id="injected-css">\n${cssToInject}\n</style>\n`;
        if (finalHtml.includes('</head>')) {
          finalHtml = finalHtml.replace('</head>', `${styleTag}</head>`);
        } else if (finalHtml.includes('</body>')) {
          finalHtml = finalHtml.replace('</body>', `${styleTag}</body>`);
        } else {
          finalHtml += styleTag;
        }
      }

      // 4. Inject Picker Script if interactive mode
      if (interactive) {
        const pickerScript = `
          <script>
            (function() {
              const style = document.createElement('style');
              style.id = 'picker-styles';
              style.innerHTML = '.picker-highlight { outline: 3px solid #3b82f6 !important; cursor: pointer !important; }';
              document.head.appendChild(style);

              const bannedStyle = document.createElement('style');
              bannedStyle.id = 'banned-styles';
              document.head.appendChild(bannedStyle);

              document.addEventListener('mouseover', (e) => {
                e.target.classList.add('picker-highlight');
                e.stopPropagation();
              }, true);

              document.addEventListener('mouseout', (e) => {
                e.target.classList.remove('picker-highlight');
                e.stopPropagation();
              }, true);

              document.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const tagName = e.target.tagName.toLowerCase();
                window.parent.postMessage({ type: 'ELEMENT_PICKED', tagName }, '*');
              }, true);

              window.addEventListener('message', (event) => {
                if (event.data?.type === 'UPDATE_CSS') {
                  document.getElementById('banned-styles').innerHTML = event.data.css;
                }
              });
            })();
          </script>
        `;
        if (finalHtml.includes('</body>')) {
           finalHtml = finalHtml.replace('</body>', `${pickerScript}</body>`);
        } else {
           finalHtml += pickerScript;
        }
      }

      return new Response(finalHtml, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });

    } catch (error: any) {
      return new Response(JSON.stringify({ 
        error: 'Failed to scrape website',
        message: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
