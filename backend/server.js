require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { initializeDatabase } = require('./src/config/database');
const authRoutes    = require('./src/routes/auth');
const todoRoutes    = require('./src/routes/todos');
const expenseRoutes = require('./src/routes/expenses');
const cornerRoutes  = require('./src/routes/corners');

const app = express();
const PORT = process.env.PORT || 5000;

initializeDatabase();

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (
      origin === 'http://localhost:5173' ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.railway.app')
    ) return cb(null, true);
    cb(null, false);
  },
  credentials: true,
}));
app.use(express.json());
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.use('/api/auth',     authRoutes);
app.use('/api/todos',    todoRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/corners',  cornerRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
