import { app } from './base.js';
import { getAuth } from '../auth/index.js';

app.on(['POST', 'GET'], '/api/auth/*', async (c) => {
    const auth = getAuth(c.env.DB);
    return auth.handler(c.req.raw);
});
