import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import notesRoutes from './routes/notes';

const app = express();
const port = process.env.PORT ?? 3001;

app.use(cors({ origin: process.env.FRONTEND_URL?.split(',') ?? '*', credentials: true }));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);

app.get('/health', (_, res) => res.json({ ok: true }));

app.listen(port, () => console.log(`Sticky API on :${port}`));
