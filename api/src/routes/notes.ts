import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { db } from '../db/db';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res: Response) => {
  const result = await db.query(
    'SELECT * FROM notes WHERE user_id = $1 ORDER BY z_index ASC, created_at ASC',
    [req.userId]
  );
  res.json(result.rows);
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const { content, color, opacity, shape, font, font_size, pinned, pos_x, pos_y, width, height, z_index } = req.body;
  const result = await db.query(
    `INSERT INTO notes (user_id, content, color, opacity, shape, font, font_size, pinned, pos_x, pos_y, width, height, z_index)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [req.userId, content ?? '', color ?? '#fef9c3', opacity ?? 1.0, shape ?? 'rectangle',
     font ?? 'Montserrat', font_size ?? 14, pinned ?? false, pos_x ?? 100, pos_y ?? 100,
     width ?? 280, height ?? 300, z_index ?? 0]
  );
  res.json(result.rows[0]);
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const allowed = ['content', 'color', 'opacity', 'shape', 'font', 'font_size', 'pinned', 'pos_x', 'pos_y', 'width', 'height', 'z_index'];
  const updates = Object.entries(req.body).filter(([k]) => allowed.includes(k));
  if (!updates.length) return res.status(400).json({ error: 'No valid fields' });

  const sets = updates.map(([k], i) => `${k} = $${i + 1}`).join(', ');
  const values = updates.map(([, v]) => v);

  const result = await db.query(
    `UPDATE notes SET ${sets} WHERE id = $${values.length + 1} AND user_id = $${values.length + 2} RETURNING *`,
    [...values, req.params.id, req.userId]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  await db.query('DELETE FROM notes WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
  res.json({ ok: true });
});

router.get('/colors', async (req: AuthRequest, res: Response) => {
  const result = await db.query(
    'SELECT color, position FROM favorite_colors WHERE user_id = $1 ORDER BY position',
    [req.userId]
  );
  res.json(result.rows);
});

router.put('/colors', async (req: AuthRequest, res: Response) => {
  const { colors } = req.body as { colors: string[] };
  if (!Array.isArray(colors)) return res.status(400).json({ error: 'colors must be array' });

  await db.query('DELETE FROM favorite_colors WHERE user_id = $1', [req.userId]);
  for (let i = 0; i < colors.length; i++) {
    await db.query(
      'INSERT INTO favorite_colors (user_id, color, position) VALUES ($1, $2, $3)',
      [req.userId, colors[i], i]
    );
  }
  res.json({ ok: true });
});

export default router;
