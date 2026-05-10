import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', cors());

app.get('/', async (c) => {
  const targetUrl = c.req.query('site');
  const cssToInject = c.req.query('css');
  
  if (!targetUrl) return c.json({ error: 'site argument is required' }, 400);
  
  try {
    const response = await fetch(targetUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!response.ok) throw new Error('Failed to fetch site');
    
    let finalHtml = await response.text();
    
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
    return c.json({ error: 'Failed to scrape', message: error.message }, 500);
  }
});

export default app;
