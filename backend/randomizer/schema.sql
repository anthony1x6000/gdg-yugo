-- D1 Schema for gsrsites

CREATE TABLE IF NOT EXISTS sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  website_address TEXT NOT NULL UNIQUE,
  css_payload TEXT,
  js_selector TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data (YouTube and Pornhub only)
DELETE FROM sites;
INSERT OR IGNORE INTO sites (website_address, css_payload, js_selector) VALUES 
('https://youtube.com', '#masthead-container, #guide-content { display: none !important; }', NULL),
('https://pornhub.com', '.header-wrapper, .footer-container { display: none !important; }', 'button.orange');
