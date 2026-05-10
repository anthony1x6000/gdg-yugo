import { Hono } from 'hono';

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

export const app = new Hono<{ Bindings: Env }>();
