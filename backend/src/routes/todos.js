const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

const BUILTIN_CORNERS = ['tasks', 'healthy', 'skin', 'glowup', 'financial', 'mind'];
const isValidCorner = (v) => BUILTIN_CORNERS.includes(v) || /^c_\d+$/.test(v);

const todoValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').optional().trim(),
  body('priority').optional().isIn(['high', 'medium', 'low']),
  body('due_date').optional({ nullable: true, checkFalsy: true }).isISO8601(),
  body('corner').optional().custom((v) => {
    if (!isValidCorner(v)) throw new Error('Invalid corner');
    return true;
  }),
];

router.get('/', (req, res) => {
  const { status, priority, search, corner } = req.query;
  const userId = req.user.userId;

  let query = 'SELECT * FROM todos WHERE user_id = ?';
  const params = [userId];

  if (status === 'active') { query += ' AND is_completed = 0'; }
  else if (status === 'completed') { query += ' AND is_completed = 1'; }

  if (priority && ['high', 'medium', 'low'].includes(priority)) {
    query += ' AND priority = ?'; params.push(priority);
  }
  if (search) { query += ' AND title LIKE ?'; params.push(`%${search}%`); }
  if (corner && isValidCorner(corner)) {
    query += ' AND corner = ?'; params.push(corner);
  }

  query += ' ORDER BY created_at DESC';

  try {
    const todos = db.prepare(query).all(...params);
    res.json(todos.map((t) => ({ ...t, is_completed: t.is_completed === 1 })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

router.post('/', todoValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { title, description, priority = 'medium', due_date, corner = 'tasks' } = req.body;
  const userId = req.user.userId;

  try {
    const result = db.prepare(
      'INSERT INTO todos (user_id, title, description, priority, due_date, corner) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(userId, title, description || null, priority, due_date || null, corner);

    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ ...todo, is_completed: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

router.get('/:id', param('id').isInt(), (req, res) => {
  if (!validationResult(req).isEmpty()) return res.status(400).json({ error: 'Invalid id' });
  try {
    const todo = db.prepare('SELECT * FROM todos WHERE id = ? AND user_id = ?').get(req.params.id, req.user.userId);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    res.json({ ...todo, is_completed: todo.is_completed === 1 });
  } catch {
    res.status(500).json({ error: 'Failed to fetch todo' });
  }
});

router.put('/:id', [param('id').isInt(), ...todoValidation], (req, res) => {
  if (!validationResult(req).isEmpty()) return res.status(400).json({ errors: validationResult(req).array() });

  const { title, description, is_completed, priority, due_date, corner } = req.body;
  try {
    const existing = db.prepare('SELECT id FROM todos WHERE id = ? AND user_id = ?').get(req.params.id, req.user.userId);
    if (!existing) return res.status(404).json({ error: 'Todo not found' });

    db.prepare(
      `UPDATE todos SET title=?, description=?, is_completed=?, priority=?, due_date=?, corner=?,
       updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?`
    ).run(title, description || null, is_completed ? 1 : 0, priority || 'medium',
          due_date || null, corner || 'tasks', req.params.id, req.user.userId);

    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
    res.json({ ...todo, is_completed: todo.is_completed === 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

router.delete('/:id', param('id').isInt(), (req, res) => {
  if (!validationResult(req).isEmpty()) return res.status(400).json({ error: 'Invalid id' });
  try {
    const result = db.prepare('DELETE FROM todos WHERE id = ? AND user_id = ?').run(req.params.id, req.user.userId);
    if (result.changes === 0) return res.status(404).json({ error: 'Todo not found' });
    res.json({ message: 'Todo deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

router.patch('/:id/complete', param('id').isInt(), (req, res) => {
  if (!validationResult(req).isEmpty()) return res.status(400).json({ error: 'Invalid id' });
  const { is_completed } = req.body;
  try {
    const existing = db.prepare('SELECT id FROM todos WHERE id = ? AND user_id = ?').get(req.params.id, req.user.userId);
    if (!existing) return res.status(404).json({ error: 'Todo not found' });
    db.prepare('UPDATE todos SET is_completed=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?')
      .run(is_completed ? 1 : 0, req.params.id, req.user.userId);
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
    res.json({ ...todo, is_completed: todo.is_completed === 1 });
  } catch {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

module.exports = router;
