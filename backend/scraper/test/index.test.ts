import { describe, it, expect, vi } from 'vitest';
import { app } from '../src/index.js';
import axios from 'axios';

vi.mock('axios');

describe('Scraper API', () => {
  it('should return 400 if url is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/scrape'
    });

    expect(response.statusCode).toBe(400);
  });

  it('should return 400 if url is invalid', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/scrape?url=not-a-url'
    });

    expect(response.statusCode).toBe(400);
  });
it('should return raw HTML correctly', async () => {
  const mockHtml = `
    <html>
      <head><title>Test</title></head>
      <body>
        <header><h1>Header</h1></header>
        <nav><ul><li>Link</li></ul></nav>
        <main>
          <p>Main content</p>
          <script>alert('hack')</script>
          <style>.ads { color: red; }</style>
          <div class="ads">Ad</div>
        </main>
        <footer>Footer</footer>
      </body>
    </html>
  `;

  vi.mocked(axios.get).mockResolvedValue({ data: mockHtml });

  const response = await app.inject({
    method: 'GET',
    url: '/scrape?url=https://example.com'
  });

  expect(response.statusCode).toBe(200);
  expect(response.headers['content-type']).toContain('text/html');
  expect(axios.get).toHaveBeenCalledWith('https://example.com', expect.objectContaining({
    maxRedirects: 0
  }));

  const body = response.body;
  expect(body).toBe(mockHtml);
  expect(body).toContain('<header>');
  expect(body).toContain('<nav>');
  expect(body).toContain('<footer>');
  expect(body).toContain('<script>');
  expect(body).toContain('<style>');
});


  it('should return 500 if axios fails', async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error('Network error'));

    const response = await app.inject({
      method: 'GET',
      url: '/scrape?url=https://example.com'
    });

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toMatchObject({
      error: 'Failed to scrape website'
    });
  });
});
