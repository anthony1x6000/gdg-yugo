import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import puppeteer from 'puppeteer';

const app = new Hono();

app.use('*', cors());

app.get('/', async (c) => {
  const targetUrl = c.req.query('site');
  const cssToInject = c.req.query('css');
  const selector = c.req.query('selector');
  
  if (!targetUrl) return c.json({ error: 'site argument is required' }, 400);
  
  let browser;
  try {
    console.log(`Launching browser for: ${targetUrl}`);
    // Standard puppeteer launch for VPS (no-sandbox often required in Docker/VPS)
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    
    // Set a common viewport
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto(targetUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // 1. Inject CSS to hide identifying features
    if (cssToInject) {
      await page.addStyleTag({ content: cssToInject });
    }

    // 2. Click JS Selector if provided (e.g., "Enter" button)
    if (selector) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        await page.click(selector);
        // Wait for potential content change or animation
        await new Promise(r => setTimeout(r, 2000));
      } catch (e: any) {
        console.warn(`Selector "${selector}" interaction failed or timed out:`, e.message);
      }
    }

    // 3. Take Screenshot
    const screenshot = await page.screenshot({ type: 'png' });
    
    return new Response(screenshot as any, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error: any) {
    console.error(`Filter Error for ${targetUrl}:`, error);
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

const port = 8789;
console.log(`Filter server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
