import React, { useState, useEffect } from 'react';
import { Sparkles, CalendarDays, AlignLeft, Check } from 'lucide-react';

const PRIORITIES = [
  { value: 'low',    label: 'Low',    emoji: '🌿' },
  { value: 'medium', label: 'Medium', emoji: '🍑' },
  { value: 'high',   label: 'High',   emoji: '🌹' },
];

const DEFAULT_FORM = { title: '', description: '', priority: 'medium', due_date: '' };

export default function TodoForm({
  onSubmit, onCancel, initialData, loading,
  cornerColor = '#f43f5e',
  cornerGradient = 'linear-gradient(135deg,#f43f5e,#ec4899)',
}) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        title:       initialData.title || '',
        description: initialData.description || '',
        priority:    initialData.priority || 'medium',
        due_date:    initialData.due_date ? initialData.due_date.split('T')[0] : '',
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Give your task a name ✨'); return; }
    setError('');
    onSubmit({ ...form, due_date: form.due_date || null });
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="text-sm rounded-2xl px-4 py-2.5 flex items-center gap-2"
          style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }}>
          <span>🌸</span> {error}
        </p>
      )}

      {/* Title */}
      <div>
        <label className="label flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" style={{ color: cornerColor }} /> Task
        </label>
        <input
          type="text" className="input text-base"
          placeholder="What would you like to accomplish?"
          value={form.title} onChange={set('title')}
          maxLength={200} autoFocus
        />
        <p className="mt-1 text-[11px] text-stone-300 text-right">{form.title.length}/200</p>
      </div>

      {/* Description */}
      <div>
        <label className="label flex items-center gap-1.5">
          <AlignLeft className="w-3 h-3" style={{ color: cornerColor }} /> Notes
        </label>
        <textarea
          className="input resize-none" rows={2}
          placeholder="Any extra details? (optional)"
          value={form.description} onChange={set('description')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Priority */}
        <div>
          <label className="label">Priority</label>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p.value} type="button"
                onClick={() => setForm((f) => ({ ...f, priority: p.value }))}
                className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl border text-xs font-medium transition-all duration-150"
                style={form.priority === p.value
                  ? { background: cornerGradient, color: '#fff', borderColor: 'transparent' }
                  : { background: 'rgba(255,255,255,0.6)', color: '#78716c', borderColor: '#f0d9d9' }
                }
              >
                <span>{p.emoji}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Due date */}
        <div>
          <label className="label flex items-center gap-1.5">
            <CalendarDays className="w-3 h-3" style={{ color: cornerColor }} /> Due date
          </label>
          <input
            type="date" className="input"
            value={form.due_date}
            min={new Date().toISOString().split('T')[0]}
            onChange={set('due_date')}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        )}
        <button
          type="submit" disabled={loading}
          className="btn flex items-center gap-2 text-white"
          style={{ background: cornerGradient }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Saving...
            </span>
          ) : (
            <><Check className="w-4 h-4" /> {initialData ? 'Save changes' : 'Add task'}</>
          )}
        </button>
      </div>
    </form>
  );
}
