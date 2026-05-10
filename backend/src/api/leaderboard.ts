import { app } from './base.js';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema.js';
import { desc } from 'drizzle-orm';

app.get('/leaderboard', async (c: any) => {
  const db = drizzle(c.env.DB, { schema });
  const topUsers = await db.query.user.findMany({ 
    columns: { 
        username: true, 
        profilePictureUrl: true, 
        highscore: true 
    }, 
    orderBy: [desc(schema.user.highscore)], 
    limit: 10 
  });
  return c.json(topUsers);
});
