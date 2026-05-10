import { app } from './base.js';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@yugo/middleware';
import { getAuth } from '@yugo/middleware';

app.post('/rules', async (c: any) => {
  const { domain, cssInjection, isActive } = await c.req.json();
  if (!domain || !cssInjection) return c.json({ error: 'Domain and CSS injection required' }, 400);

  const auth = getAuth(c.env.DB);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  
  // guests can upload sites and rules
  const userId = session?.user?.id || null;

  const db = drizzle(c.env.DB, { schema });
  await db.insert(schema.siteCleanerRules).values({ 
    domain, 
    cssInjection, 
    isActive: isActive ?? true, 
    createdBy: userId 
  }).onConflictDoUpdate({ 
    target: schema.siteCleanerRules.domain, 
    set: { 
        cssInjection, 
        isActive: isActive ?? true, 
        createdBy: userId 
    } 
  });

  return c.json({ message: 'Rule saved successfully' });
});
