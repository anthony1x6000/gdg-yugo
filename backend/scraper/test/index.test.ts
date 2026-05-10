import { describe, it, expect, vi, beforeEach } from 'vitest';
import worker from '../src/index.js';

describe('Scraper Worker', () => {
  const mockD1 = {
    prepare: vi.fn().mockReturnThis(),
    bind: vi.fn().mockReturnThis(),
    first: vi.fn(),
    all: vi.fn().mockResolvedValue({ results: [] }),
    raw: vi.fn().mockResolvedValue([]),
    exec: vi.fn().mockResolvedValue({}),
  };

  const mockEnv = {
    DB: mockD1 as any,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    // Default mock behavior
    mockD1.first.mockResolvedValue(null);
  });

  it('should return 400 if url is missing', async () => {
    const request = new Request('http://localhost/scrape');
    const response = await worker.fetch(request, mockEnv);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toMatchObject({ error: 'URL is required' });
  });

  it('should scrape and return raw HTML', async () => {
    const mockHtml = '<html><body>Test</body></html>';
    (global.fetch as any).mockResolvedValue(new Response(mockHtml));
    
    mockD1.first.mockResolvedValue(null);

    const request = new Request('http://localhost/scrape?url=https://example.com');
    const response = await worker.fetch(request, mockEnv);

    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).toBe(mockHtml);
  });

  it('should inject CSS from query param', async () => {
    const mockHtml = '<html><head></head><body>Test</body></html>';
    (global.fetch as any).mockResolvedValue(new Response(mockHtml));
    
    mockD1.first.mockResolvedValue(null);

    const css = '.ads { display: none; }';
    const request = new Request(`http://localhost/scrape?url=https://example.com&css=${encodeURIComponent(css)}`);
    const response = await worker.fetch(request, mockEnv);

    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).toContain('<style>');
    expect(body).toContain(css);
    expect(body).toContain('</style>');
    expect(body).toContain('</head>');
  });
});
