CREATE TABLE `site_cleaner_rules` (
	`domain` text PRIMARY KEY NOT NULL,
	`css_injection` text NOT NULL,
	`is_active` integer DEFAULT true
);
--> statement-breakpoint
CREATE INDEX `idx_domain_active` ON `site_cleaner_rules` (`domain`);