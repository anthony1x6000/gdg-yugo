import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import puppeteer from 'puppeteer';

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowMethods: ['*'],
  allowHeaders: ['*'],
  exposeHeaders: ['*'],
  maxAge: 86400,
}));

app.get('/', async (c) => {
  const targetUrl = c.req.query('site');
  const cssToInject = c.req.query('css');
  const selector = c.req.query('selector');

  if (!targetUrl) return c.json({ error: 'site argument is required' }, 400);

  let browser;
  try {
    console.log(`Launching browser for: ${targetUrl}`);
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto(targetUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    if (cssToInject) {
      await page.addStyleTag({ content: cssToInject });
    }

    if (selector) {
      let cleanSelector = selector;
      if (selector.includes('document.querySelector')) {
        const parts = selector.split(/['"]/);
        if (parts.length >= 2 && parts[1]) {
          cleanSelector = parts[1];
        }
      }

      try {
        console.log(`Waiting for and clicking selector: ${cleanSelector}`);
        await page.waitForSelector(cleanSelector, { timeout: 15000 });
        await page.evaluate((sel) => {
          const element = document.querySelector(sel) as HTMLElement;
          if (element) element.click();
        }, cleanSelector);
        await new Promise(r => setTimeout(r, 2000));
      } catch (e: any) {
        console.warn(`Selector "${cleanSelector}" interaction failed or timed out:`, e.message);
      }
    }

    const screenshot = await page.screenshot({ type: 'png' });

    return new Response(screenshot as any, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error: any) {
    console.error(`Error for ${targetUrl}:`, error);
    return c.json({
      error: 'Failed to capture site',
      message: error.message,
      target: targetUrl
    }, 500);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// Cloud Run injects PORT; fall back to 8080
const port = parseInt(process.env.PORT ?? '8080', 10);
console.log(`Server running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
