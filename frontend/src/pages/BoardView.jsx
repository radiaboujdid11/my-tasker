import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Check } from 'lucide-react';
import { useCorner } from '../context/CornerContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { getTodos, createTodo, toggleComplete } from '../services/api';
import { CORNER_ORDER } from '../config/corners';
import { useNotification } from '../context/NotificationContext';

function greeting(name) {
  const h = new Date().getHours();
  const first = name?.[0]?.toUpperCase() || '';
  if (h < 12) return `Good morning, ${first ? name : 'there'}.`;
  if (h < 18) return `Good afternoon, ${first ? name : 'there'}.`;
  return `Good evening, ${first ? name : 'there'}.`;
}

function CornerCard({ corner, todos, onToggle, onAdd }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();

  const cornerTodos = todos.filter((t) => t.corner === corner.id);
  const done = cornerTodos.filter((t) => t.is_completed).length;
  const total = cornerTodos.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    await onAdd(corner.id, title.trim());
    setTitle('');
    setAdding(false);
    setSubmitting(false);
  };

  return (
    <div className="rounded-2xl border border-beige-300 overflow-hidden flex flex-col" style={{ background: '#f5f1ea' }}>
      {/* Card header */}
      <div className="px-5 pt-5 pb-3" style={{ background: `${corner.soft}` }}>
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full mt-0.5" style={{ background: corner.primary }} />
            <div>
              <p className="font-display font-semibold text-brown-600 leading-tight">{corner.name}</p>
              <p className="text-xs text-brown-300 mt-0.5">{corner.description}</p>
            </div>
          </div>
          <span className="text-xs text-brown-300 font-mono mt-0.5">
            {String(CORNER_ORDER.indexOf(corner.id) + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Progress */}
        <div className="mt-3">
          <div className="h-0.5 bg-beige-300 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: corner.primary }} />
          </div>
          <p className="text-xs text-brown-300 mt-1.5">{done} / {total || 0}</p>
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 divide-y divide-beige-200">
        {cornerTodos.map((todo) => (
          <div key={todo.id}
            className="flex items-center gap-3 px-5 py-3 hover:bg-beige-100 transition-colors group">
            <button
              onClick={() => onToggle(todo.id, !todo.is_completed)}
              className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all"
              style={{
                borderColor: todo.is_completed ? corner.primary : '#d4cdc0',
                background: todo.is_completed ? corner.primary : 'transparent',
              }}
            >
              {todo.is_completed && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
            </button>
            <span className={`text-sm flex-1 ${todo.is_completed ? 'line-through text-brown-300' : 'text-brown-600'}`}>
              {todo.title}
            </span>
          </div>
        ))}

        {cornerTodos.length === 0 && !adding && (
          <div className="px-5 py-4 text-xs text-brown-300 italic">No tasks yet</div>
        )}
      </div>

      {/* Add task */}
      <div className="border-t border-beige-200">
        {adding ? (
          <form onSubmit={handleAdd} className="flex items-center gap-2 px-5 py-3">
            <input
              autoFocus
              className="flex-1 bg-transparent text-sm text-brown-600 outline-none placeholder-brown-300"
              placeholder="Task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setAdding(false)}
            />
            <button type="submit" disabled={!title.trim() || submitting}
              className="text-xs font-medium px-2 py-1 rounded-lg text-white disabled:opacity-40"
              style={{ background: corner.primary }}>
              Add
            </button>
            <button type="button" onClick={() => setAdding(false)}
              className="text-xs text-brown-300 hover:text-brown-500">✕</button>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full flex items-center gap-2 px-5 py-3 text-sm text-brown-300 hover:text-brown-500 hover:bg-beige-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> {t('dashboard.addTask')}
          </button>
        )}
      </div>
    </div>
  );
}

export default function BoardView() {
  const { allCorners } = useCorner();
  const { user } = useAuth();
  const { add } = useNotification();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTodos({});
      setTodos(res.data);
    } catch {
      add('Could not load tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleToggle = async (id, is_completed) => {
    try {
      const res = await toggleComplete(id, is_completed);
      setTodos((prev) => prev.map((t) => (t.id === id ? res.data : t)));
    } catch {
      add('Could not update task', 'error');
    }
  };

  const handleAdd = async (cornerId, title) => {
    try {
      const res = await createTodo({ title, corner: cornerId, priority: 'medium' });
      setTodos((prev) => [res.data, ...prev]);
    } catch {
      add('Could not add task', 'error');
    }
  };

  const userName = user?.email?.split('@')[0] || '';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-2 border-beige-400 border-t-brown-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Greeting */}
      <h1 className="font-display text-4xl font-semibold text-brown-600 mb-8 leading-tight">
        {greeting(userName)}
      </h1>

      {/* Corner grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CORNER_ORDER.map((id) => (
          <CornerCard
            key={id}
            corner={allCorners[id]}
            todos={todos}
            onToggle={handleToggle}
            onAdd={handleAdd}
          />
        ))}
      </div>
    </div>
  );
}
