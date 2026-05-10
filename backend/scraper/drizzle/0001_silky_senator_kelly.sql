DROP INDEX `idx_domain_active`;--> statement-breakpoint
CREATE INDEX `idx_domain` ON `site_cleaner_rules` (`domain`);--> statement-breakpoint
ALTER TABLE `site_cleaner_rules` DROP COLUMN `is_active`;