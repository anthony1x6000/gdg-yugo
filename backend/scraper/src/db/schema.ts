import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const siteCleanerRules = sqliteTable('site_cleaner_rules', {
    domain: text('domain').primaryKey(),
    cssInjection: text('css_injection').notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
}, (table) => {
    return {
        domainIdx: index('idx_domain_active').on(table.domain),
    };
});
