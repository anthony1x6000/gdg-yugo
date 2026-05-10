import Fastify from 'fastify';
import axios from 'axios';
import * as cheerio from 'cheerio';

const fastify = Fastify({ logger: true });

// Route takes in a single URL via query string: /scrape?url=https://example.com
/**
 * Fastify instance for the scraper service.
 */
export const app = fastify;

/**
 * Endpoint to scrape a website and return raw HTML content.
 * 
 * @route GET /scrape
 * @param {string} url - The URL of the website to scrape (must be a valid URI).
 * @returns {string} - The raw HTML content.
 * @throws {400} - If the URL is missing or invalid.
 * @throws {500} - If scraping fails.
 */
fastify.get('/scrape', {
  schema: {
    querystring: {
      type: 'object',
      required: ['url'],
      properties: {
        url: { type: 'string', format: 'uri' }
      }
    }
  }
}, async (request, reply) => {
  const { url } = request.query as { url: string };

  try {
    // Fetch the website (This is your 'wget' replacement)
    // We use a custom User-Agent to avoid being blocked by some websites
    const { data: rawHtml } = await axios.get(url, {
      maxRedirects: 0,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Return as HTML content without filtering
    reply.type('text/html').send(rawHtml);

  } catch (error: any) {
    fastify.log.error(error);
    reply.status(500).send({ 
      error: 'Failed to scrape website',
      message: error.message 
    });
  }
});

if (process.env.NODE_ENV !== 'test') {
  const start = async () => {
    try {
      await app.listen({ port: 3000, host: '0.0.0.0' });
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }
  };
  start();
}
