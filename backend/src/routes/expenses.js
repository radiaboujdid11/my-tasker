const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

const CATEGORIES_EXPENSE = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Bills', 'Education', 'Other'];
const CATEGORIES_INCOME  = ['Salary', 'Freelance', 'Gift', 'Investment', 'Other'];

router.get('/', (req, res) => {
  const { month } = req.query; // e.g. "2026-05"
  const userId = req.user.userId;
  let query = 'SELECT * FROM expenses WHERE user_id = ?';
  const params = [userId];
  if (month) { query += " AND strftime('%Y-%m', date) = ?"; params.push(month); }
  query += ' ORDER BY date DESC, created_at DESC';
  try {
    res.json(db.prepare(query).all(...params));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

router.get('/summary', (req, res) => {
  const { month } = req.query;
  const userId = req.user.userId;
  let where = 'WHERE user_id = ?';
  const params = [userId];
  if (month) { where += " AND strftime('%Y-%m', date) = ?"; params.push(month); }
  try {
    const income  = db.prepare(`SELECT COALESCE(SUM(amount),0) AS total FROM expenses ${where} AND type='income'`).get(...params).total;
    const expense = db.prepare(`SELECT COALESCE(SUM(amount),0) AS total FROM expenses ${where} AND type='expense'`).get(...params).total;
    res.json({ income, expense, balance: income - expense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

router.post('/', [
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be positive'),
  body('type').isIn(['income', 'expense']),
  body('category').optional().isString(),
  body('description').optional().trim(),
  body('date').optional().isISO8601(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { amount, type, category = 'Other', description, date } = req.body;
  const userId = req.user.userId;
  try {
    const result = db.prepare(
      'INSERT INTO expenses (user_id, amount, type, category, description, date) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(userId, amount, type, category, description || null, date || new Date().toISOString().split('T')[0]);
    res.status(201).json(db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

router.delete('/:id', param('id').isInt(), (req, res) => {
  if (!validationResult(req).isEmpty()) return res.status(400).json({ error: 'Invalid id' });
  try {
    const result = db.prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?').run(req.params.id, req.user.userId);
    if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;
