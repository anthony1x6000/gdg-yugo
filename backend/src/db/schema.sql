-- Site Cleaner Rules Schema
CREATE TABLE IF NOT EXISTS site_cleaner_rules (
    domain TEXT PRIMARY KEY,
    css_injection TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Index for high-performance lookups
CREATE INDEX IF NOT EXISTS idx_domain_active ON site_cleaner_rules (domain) WHERE is_active = TRUE;
