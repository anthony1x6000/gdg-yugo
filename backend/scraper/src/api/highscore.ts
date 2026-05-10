import { app } from './base.js';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@yugo/middleware';
import { getAuth } from '@yugo/middleware';
import { eq } from 'drizzle-orm';

app.post('/highscore', async (c: any) => {
  const auth = getAuth(c.env.DB);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  
  if (!session) return c.json({ error: 'Unauthorized' }, 401);

  const { score } = await c.req.json();
  if (typeof score !== 'number') return c.json({ error: 'Invalid score' }, 400);
  
  const db = drizzle(c.env.DB, { schema });
  const user = await db.query.user.findFirst({ where: eq(schema.user.id, session.user.id) });
  
  if (!user) return c.json({ error: 'User not found' }, 404);
  
  // Requirement: ensure it updates when playing (if higher)
  if (score > (user.highscore || 0)) {
    await db.update(schema.user).set({ highscore: score }).where(eq(schema.user.id, user.id));
    return c.json({ message: 'Highscore updated', newHighscore: score });
  }
  
  return c.json({ message: 'Score not high enough', currentHighscore: user.highscore });
});
