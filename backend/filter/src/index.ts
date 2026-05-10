import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', cors());

app.get('/', async (c) => {
  const targetUrl = c.req.query('site');
  const cssToInject = c.req.query('css');
  
  if (!targetUrl) return c.json({ error: 'site argument is required' }, 400);
  
  try {
    const response = await fetch(targetUrl, { 
      redirect: 'follow',
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      } 
    });

    if (!response.ok) throw new Error(`Failed to fetch site: ${response.status} ${response.statusText}`);
    
    let finalHtml = await response.text();

    // 0. Strip <meta http-equiv="refresh"> tags to prevent browser-side redirects
    finalHtml = finalHtml.replace(/<meta[^>]*http-equiv=["']refresh["'][^>]*>/gi, '<!-- Removed Redirect -->');
    
    // 0.1 Strip all script tags and their content
    finalHtml = finalHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '<!-- Removed Script -->');
    
    // 0.2 Strip inline event handlers (on*)
    finalHtml = finalHtml.replace(/\s+on\w+="[^"]*"/gi, '');
    finalHtml = finalHtml.replace(/\s+on\w+='[^']*'/gi, '');
    
    // 1. Inject <base> tag to fix relative URLs
    const baseTag = `<base href="${targetUrl}">`;
    if (finalHtml.includes('<head>')) {
      finalHtml = finalHtml.replace('<head>', '<head>' + baseTag);
    } else {
      finalHtml = baseTag + finalHtml;
    }

    // 2. Inject CSS Payload
    if (cssToInject) {
      const styleTag = `
<style>
${cssToInject}
</style>
`;
      if (finalHtml.includes('</head>')) finalHtml = finalHtml.replace('</head>', styleTag + '</head>');
      else if (finalHtml.includes('</body>')) finalHtml = finalHtml.replace('</body>', styleTag + '</body>');
      else finalHtml += styleTag;
    }
    
    return c.html(finalHtml);
  } catch (error: any) {
    console.error(`Filter Error for ${targetUrl}:`, error);
    return c.json({ 
      error: 'Failed to scrape', 
      message: error.message,
      target: targetUrl 
    }, 500);
  }
});

export default app;
