-- D1 Schema for gsrsites

CREATE TABLE IF NOT EXISTS sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  website_address TEXT NOT NULL UNIQUE,
  css_payload TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Example Seed Data
INSERT OR IGNORE INTO sites (website_address, css_payload) VALUES 
('https://google.com', 'center, .gb_Sa, .o3j99 { display: none !important; }'),
('https://github.com', '.Header, .footer { display: none !important; }'),
('https://news.ycombinator.com', '.votearrow, .pagetop { display: none !important; }'),
('https://reddit.com', '#header, .side { display: none !important; }');
