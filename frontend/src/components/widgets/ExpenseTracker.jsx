import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { getExpenses, getExpenseSummary, createExpense, deleteExpense } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { format } from 'date-fns';

const EXPENSE_CATS = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Bills', 'Education', 'Other'];
const INCOME_CATS  = ['Salary', 'Freelance', 'Gift', 'Investment', 'Other'];

const CAT_EMOJI = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️', Entertainment: '🎬',
  Health: '💊', Bills: '📄', Education: '📚', Salary: '💼',
  Freelance: '💻', Gift: '🎁', Investment: '📈', Other: '📦',
};

const TODAY = new Date().toISOString().split('T')[0];
const CURRENT_MONTH = TODAY.slice(0, 7);

export default function ExpenseTracker({ corner }) {
  const { add } = useNotification();
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ amount: '', type: 'expense', category: 'Food', description: '', date: TODAY });

  const load = useCallback(async () => {
    try {
      const [sumRes, listRes] = await Promise.all([
        getExpenseSummary(CURRENT_MONTH),
        getExpenses(CURRENT_MONTH),
      ]);
      setSummary(sumRes.data);
      setExpenses(listRes.data);
    } catch {
      add('Could not load expenses', 'error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) { add('Enter a valid amount', 'error'); return; }
    setLoading(true);
    try {
      const res = await createExpense({ ...form, amount: parseFloat(form.amount) });
      setExpenses((prev) => [res.data, ...prev]);
      // Update summary locally
      setSummary((s) => ({
        income: form.type === 'income' ? s.income + parseFloat(form.amount) : s.income,
        expense: form.type === 'expense' ? s.expense + parseFloat(form.amount) : s.expense,
        balance: form.type === 'income' ? s.balance + parseFloat(form.amount) : s.balance - parseFloat(form.amount),
      }));
      setForm({ amount: '', type: 'expense', category: 'Food', description: '', date: TODAY });
      setShowForm(false);
      add('Entry added!', 'success');
    } catch {
      add('Failed to add entry', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type, amount) => {
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      setSummary((s) => ({
        income: type === 'income' ? s.income - amount : s.income,
        expense: type === 'expense' ? s.expense - amount : s.expense,
        balance: type === 'income' ? s.balance - amount : s.balance + amount,
      }));
      add('Entry removed', 'info');
    } catch {
      add('Failed to delete', 'error');
    }
  };

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  const cats = form.type === 'income' ? INCOME_CATS : EXPENSE_CATS;

  return (
    <div className="rounded-3xl border overflow-hidden" style={{ borderColor: corner.border }}>
      {/* Summary header */}
      <div className="p-5" style={{ background: corner.btnGradient }}>
        <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </p>
        <p className="text-white text-3xl font-bold mb-4">
          {summary.balance >= 0 ? '+' : ''}{fmt(summary.balance)}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/20 rounded-2xl px-3 py-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-white/80" />
            <div>
              <p className="text-white/70 text-[10px]">Income</p>
              <p className="text-white font-semibold text-sm">{fmt(summary.income)}</p>
            </div>
          </div>
          <div className="bg-white/20 rounded-2xl px-3 py-2 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-white/80" />
            <div>
              <p className="text-white/70 text-[10px]">Spent</p>
              <p className="text-white font-semibold text-sm">{fmt(summary.expense)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4" style={{ background: corner.soft }}>
        {/* Add button */}
        <button
          onClick={() => setShowForm((v) => !v)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-white text-sm font-medium mb-4 transition-all"
          style={{ background: corner.btnGradient }}
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Add entry'}
        </button>

        {/* Add form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white/70 rounded-2xl p-4 mb-4 flex flex-col gap-3 animate-slide-up">
            {/* Type toggle */}
            <div className="flex gap-2">
              {['expense', 'income'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: t, category: t === 'income' ? 'Salary' : 'Food' }))}
                  className="flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all"
                  style={form.type === t
                    ? { background: corner.btnGradient, color: '#fff' }
                    : { background: 'transparent', color: '#78716c', border: `1px solid ${corner.border}` }}
                >
                  {t === 'expense' ? '💸 Expense' : '💵 Income'}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">Amount ($)</label>
                <input
                  type="number" min="0.01" step="0.01" className="input py-2"
                  placeholder="0.00" value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Date</label>
                <input type="date" className="input py-2" value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input py-2" value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {cats.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Note (optional)</label>
              <input type="text" className="input py-2" placeholder="What was this for?"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <button type="submit" disabled={loading}
              className="py-2.5 rounded-2xl text-white text-sm font-medium transition-all disabled:opacity-50"
              style={{ background: corner.btnGradient }}>
              {loading ? 'Saving...' : 'Save entry'}
            </button>
          </form>
        )}

        {/* Transactions list */}
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
          {expenses.length === 0 ? (
            <p className="text-center text-sm text-stone-400 py-6">No entries this month yet 💰</p>
          ) : (
            expenses.map((exp) => (
              <div key={exp.id} className="flex items-center gap-3 bg-white/70 rounded-2xl px-3 py-2.5 group">
                <span className="text-xl shrink-0">{CAT_EMOJI[exp.category] || '📦'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700 truncate">
                    {exp.description || exp.category}
                  </p>
                  <p className="text-[11px] text-stone-400">{exp.category} · {exp.date}</p>
                </div>
                <p className={`text-sm font-bold shrink-0 ${exp.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                  {exp.type === 'income' ? '+' : '-'}{fmt(exp.amount)}
                </p>
                <button
                  onClick={() => handleDelete(exp.id, exp.type, exp.amount)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
