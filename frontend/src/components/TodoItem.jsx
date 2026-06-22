import React, { useState } from 'react';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { Pencil, Trash2, CalendarClock, Check } from 'lucide-react';
import TodoForm from './TodoForm';

const PRIORITY_BADGE = {
  high:   { bg: '#fff1f2', text: '#e11d48',  label: '🌹 High' },
  medium: { bg: '#fff7ed', text: '#c2410c',  label: '🍑 Medium' },
  low:    { bg: '#f0fdf4', text: '#15803d',  label: '🌿 Low' },
};

function DueDateBadge({ dateStr, isCompleted }) {
  if (!dateStr) return null;
  const date = parseISO(dateStr);
  const overdue  = !isCompleted && isPast(date) && !isToday(date);
  const dueToday = !isCompleted && isToday(date);

  const style = overdue
    ? { bg: '#fff1f2', text: '#e11d48', border: '#fecdd3' }
    : dueToday
    ? { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' }
    : { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' };

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border"
      style={{ background: style.bg, color: style.text, borderColor: style.border }}
    >
      <CalendarClock className="w-3 h-3" />
      {overdue ? 'Overdue · ' : dueToday ? 'Today · ' : ''}
      {format(date, 'MMM d, yyyy')}
    </span>
  );
}

export default function TodoItem({
  todo, onToggle, onUpdate, onDelete,
  cornerColor = '#f43f5e',
  cornerGradient = 'linear-gradient(135deg,#f43f5e,#ec4899)',
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    await onToggle(todo.id, !todo.is_completed);
    setToggling(false);
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    await onUpdate(todo.id, { ...data, is_completed: todo.is_completed });
    setSaving(false);
    setEditing(false);
  };

  const pb = PRIORITY_BADGE[todo.priority] || PRIORITY_BADGE.medium;

  if (editing) {
    return (
      <div className="card p-5 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-stone-600 flex items-center gap-1.5">
            <Pencil className="w-3.5 h-3.5" style={{ color: cornerColor }} /> Edit task
          </p>
          <button onClick={() => setEditing(false)} className="p-1 rounded-lg hover:bg-rose-50 text-stone-400 text-xs">✕</button>
        </div>
        <TodoForm
          initialData={todo}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
          loading={saving}
          cornerColor={cornerColor}
          cornerGradient={cornerGradient}
        />
      </div>
    );
  }

  return (
    <div className={`card p-4 flex gap-4 group hover:shadow-soft-lg transition-all duration-200 hover:-translate-y-0.5 animate-fade-in ${todo.is_completed ? 'opacity-60' : ''}`}>
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        disabled={toggling}
        className="mt-0.5 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300"
        style={todo.is_completed
          ? { background: cornerGradient, borderColor: 'transparent', boxShadow: `0 0 12px ${cornerColor}40` }
          : { borderColor: '#e5e7eb' }
        }
        onMouseEnter={(e) => { if (!todo.is_completed) e.currentTarget.style.borderColor = cornerColor; }}
        onMouseLeave={(e) => { if (!todo.is_completed) e.currentTarget.style.borderColor = '#e5e7eb'; }}
      >
        {todo.is_completed && <Check className="w-3.5 h-3.5 text-white animate-bounce-soft" strokeWidth={3} />}
        {toggling && !todo.is_completed && (
          <span className="w-3 h-3 rounded-full border-2 border-gray-200 animate-spin"
            style={{ borderTopColor: cornerColor }} />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug break-words transition-all ${
          todo.is_completed ? 'line-through text-stone-300' : 'text-stone-700'
        }`}>
          {todo.title}
        </p>
        {todo.description && (
          <p className="mt-1 text-xs text-stone-400 break-words leading-relaxed">{todo.description}</p>
        )}
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ background: pb.bg, color: pb.text }}
          >
            {pb.label}
          </span>
          <DueDateBadge dateStr={todo.due_date} isCompleted={todo.is_completed} />
          <span className="text-[11px] text-stone-300">
            {format(parseISO(todo.created_at), 'MMM d')}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-300 hover:bg-gray-50 transition-all"
          style={{}}
          onMouseEnter={(e) => { e.currentTarget.style.color = cornerColor; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#d1d5db'; }}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>

        {confirmDelete ? (
          <div className="flex items-center gap-1 animate-scale-in">
            <button onClick={() => onDelete(todo.id)} className="h-7 px-2.5 text-xs rounded-xl text-white font-medium"
              style={{ background: cornerGradient }}>
              Delete
            </button>
            <button onClick={() => setConfirmDelete(false)} className="h-7 px-2.5 text-xs rounded-xl border border-gray-200 text-stone-500 hover:bg-gray-50">
              Keep
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-300 hover:text-red-400 hover:bg-red-50 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
