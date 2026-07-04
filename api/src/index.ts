import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import { db } from './db/db';
import authRoutes from './routes/auth';
import notesRoutes from './routes/notes';

const app = express();
const port = process.env.PORT ?? 3001;

app.use(cors({ origin: process.env.FRONTEND_URL?.split(',') ?? '*', credentials: true }));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);

app.get('/health', (_, res) => res.json({ ok: true }));

async function start() {
  const schema = fs.readFileSync(path.join(__dirname, 'db/schema.sql'), 'utf-8');
  await db.query(schema);
  console.log('DB ready');
  app.listen(port, () => console.log(`Sticky API on :${port}`));
}

start().catch(err => { console.error('Startup failed:', err); process.exit(1); });
