const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET all user's custom corners
router.get('/', (req, res) => {
  try {
    const corners = db.prepare(
      'SELECT * FROM user_corners WHERE user_id = ? ORDER BY created_at ASC'
    ).all(req.user.userId);
    res.json(corners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch corners' });
  }
});

// POST create a new corner
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 30 }),
  body('emoji').optional().isString(),
  body('color').optional().matches(/^#[0-9a-fA-F]{6}$/).withMessage('Color must be a hex code'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, emoji = '📌', color = '#6366f1' } = req.body;
  try {
    const result = db.prepare(
      'INSERT INTO user_corners (user_id, name, emoji, color) VALUES (?, ?, ?, ?)'
    ).run(req.user.userId, name, emoji, color);

    const corner = db.prepare('SELECT * FROM user_corners WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(corner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create corner' });
  }
});

// DELETE a corner — reassign its todos to 'tasks' first
router.delete('/:id', param('id').isInt(), (req, res) => {
  if (!validationResult(req).isEmpty()) return res.status(400).json({ error: 'Invalid id' });

  const cornerId = `c_${req.params.id}`;
  try {
    const existing = db.prepare(
      'SELECT id FROM user_corners WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.user.userId);
    if (!existing) return res.status(404).json({ error: 'Corner not found' });

    // Reassign todos to default 'tasks' corner
    db.prepare(
      "UPDATE todos SET corner = 'tasks' WHERE user_id = ? AND corner = ?"
    ).run(req.user.userId, cornerId);

    db.prepare('DELETE FROM user_corners WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.user.userId);

    res.json({ message: 'Corner deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete corner' });
  }
});

module.exports = router;
