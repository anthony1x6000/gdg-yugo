import { app } from './base.js';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

app.get('/scrape', async (c: any) => {
  const targetUrl = c.req.query('url');
  let queryCss = c.req.query('css');
  if (!targetUrl) return c.json({ error: 'URL is required' }, 400);
  try {
    const targetUri = new URL(targetUrl);
    const domain = targetUri.hostname;
    const db = drizzle(c.env.DB, { schema });
    const dbRule = await db.query.siteCleanerRules.findFirst({ where: and(eq(schema.siteCleanerRules.domain, domain), eq(schema.siteCleanerRules.isActive, true)) });
    const response = await fetch(targetUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!response.ok) throw new Error('Failed to fetch');
    const rawHtml = await response.text();
    let finalHtml = rawHtml;
    const cssToInject = queryCss || dbRule?.cssInjection;
    if (cssToInject) {
      const styleTag = '\n<style>\n' + cssToInject + '\n</style>\n';
      if (finalHtml.includes('</head>')) finalHtml = finalHtml.replace('</head>', styleTag + '</head>');
      else if (finalHtml.includes('</body>')) finalHtml = finalHtml.replace('</body>', styleTag + '</body>');
      else finalHtml += styleTag;
    }
    return c.html(finalHtml);
  } catch (error: any) { return c.json({ error: 'Failed to scrape', message: error.message }, 500); }
});