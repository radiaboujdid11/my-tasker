import React, { useState } from 'react';
import { X, Plus, Trash2, Check, Loader2, LayoutGrid, Calendar, Settings } from 'lucide-react';
import { CORNERS, CORNER_ORDER } from '../config/corners';
import { useCorner } from '../context/CornerContext';
import { useNotification } from '../context/NotificationContext';
import { useTranslation } from 'react-i18next';

const PRESET_COLORS = [
  '#c17c6b','#7a9b76','#7b9eb8','#b8956a',
  '#8a9a6a','#9b7ab8','#6a9a8a','#b8a06a',
  '#6a7ab8','#b86a7a','#7ab8a0','#b8b06a',
];

const PRESET_EMOJIS = [
  '📌','🌟','🎯','💡','🔥','🎨','🎵','🏋️',
  '📚','🌈','💎','🚀','🌙','☕','🎭','🌺',
  '🦋','🍀','⚡','🎪','🧩','🎲','🌊','🏆',
];

function AddCornerForm({ onDone }) {
  const { addCorner } = useCorner();
  const { add } = useNotification();
  const { t } = useTranslation();
  const [name, setName]   = useState('');
  const [emoji, setEmoji] = useState('📌');
  const [color, setColor] = useState('#c17c6b');
  const [saving, setSaving] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await addCorner({ name: name.trim(), emoji, color });
      add(`"${name.trim()}" created!`, 'success');
      onDone();
    } catch {
      add('Could not create corner', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}
      className="mt-2 rounded-xl p-3 flex flex-col gap-3 border border-beige-300"
      style={{ background: '#f5f1ea' }}>
      <div className="flex gap-2">
        <div className="relative">
          <button type="button" onClick={() => setShowEmojis((v) => !v)}
            className="w-9 h-9 rounded-lg text-lg flex items-center justify-center hover:bg-beige-200 border border-beige-300 transition-colors">
            {emoji}
          </button>
          {showEmojis && (
            <div className="absolute left-0 top-11 z-50 rounded-xl p-2 shadow-lg grid grid-cols-4 gap-1 w-44"
              style={{ background: '#f5f1ea', border: '1px solid #d4cdc0' }}>
              {PRESET_EMOJIS.map((em) => (
                <button key={em} type="button"
                  onClick={() => { setEmoji(em); setShowEmojis(false); }}
                  className="w-9 h-9 rounded-lg text-lg flex items-center justify-center hover:bg-beige-200 transition-colors">
                  {em}
                </button>
              ))}
            </div>
          )}
        </div>
        <input type="text" className="input flex-1 py-2 text-sm"
          placeholder={t('sidebar.cornerName')}
          value={name} onChange={(e) => setName(e.target.value)}
          maxLength={30} autoFocus />
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-brown-300 mb-1.5">{t('sidebar.color')}</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_COLORS.map((c) => (
            <button key={c} type="button" onClick={() => setColor(c)}
              className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110"
              style={{ background: c, borderColor: color === c ? '#2c2420' : 'transparent' }}>
              {color === c && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onDone}
          className="flex-1 py-2 rounded-xl text-xs font-medium text-brown-400 hover:bg-beige-200 border border-beige-300 transition-colors">
          {t('sidebar.cancel')}
        </button>
        <button type="submit" disabled={!name.trim() || saving}
          className="flex-1 py-2 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 disabled:opacity-50"
          style={{ background: color }}>
          {saving
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('sidebar.creating')}</>
            : <><Check className="w-3.5 h-3.5" /> {t('sidebar.create')}</>}
        </button>
      </div>
    </form>
  );
}

function SidebarItem({ corner, isActive, onSelect, onDelete }) {
  const Icon = corner.icon;
  const [confirmDel, setConfirmDel] = useState(false);

  return (
    <div className="relative group">
      <button onClick={onSelect}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all"
        style={isActive ? { background: corner.soft, color: corner.primary } : {}}>
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: corner.primary }} />
        <span className={`text-sm truncate ${isActive ? 'font-semibold' : 'text-brown-500 font-medium'}`}>
          {corner.name}
        </span>
      </button>

      {onDelete && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
          {confirmDel ? (
            <>
              <button onClick={() => { onDelete(); setConfirmDel(false); }}
                className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-lg"
                style={{ background: '#ef4444' }}>Yes</button>
              <button onClick={() => setConfirmDel(false)}
                className="text-[10px] text-brown-400 px-1.5 py-0.5 rounded-lg bg-beige-200">No</button>
            </>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); setConfirmDel(true); }}
              className="p-1 rounded-lg hover:bg-beige-200 text-brown-300 hover:text-red-400 transition-colors">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ open, onClose, view, onViewChange }) {
  const { activeCorner, changeCorner, customCorners, allCorners, removeCorner } = useCorner();
  const { add } = useNotification();
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSelect = (id) => {
    changeCorner(id);
    onViewChange('corner');
    onClose?.();
  };

  const handleDelete = async (row) => {
    try {
      await removeCorner(row.id);
      add(`"${row.name}" removed`, 'info');
    } catch {
      add('Could not delete corner', 'error');
    }
  };

  const navItems = [
    { id: 'board', label: 'Today', Icon: LayoutGrid },
    { id: 'calendar', label: 'Calendar', Icon: Calendar },
  ];

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-60 z-40 flex flex-col
          transition-transform duration-300 border-r
          lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: '#e0d9cc', borderColor: '#d4cdc0' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="font-display font-semibold text-brown-600 text-lg ml-1">Tasker</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-beige-200 text-brown-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto px-3 pb-4 gap-0.5">

          {/* Main nav */}
          {navItems.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => { onViewChange(id); onClose?.(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${view === id ? 'bg-beige-100 text-brown-600' : 'text-brown-400 hover:bg-beige-200 hover:text-brown-600'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}

          <div className="my-3 border-t border-beige-300" />

          {/* Built-in corners */}
          <p className="text-[10px] font-semibold uppercase tracking-widest text-brown-300 px-3 mb-1">
            {t('sidebar.yourCorners')}
          </p>
          {CORNER_ORDER.map((id) => (
            <SidebarItem key={id} corner={allCorners[id]}
              isActive={view === 'corner' && activeCorner === id}
              onSelect={() => handleSelect(id)} />
          ))}

          {/* Custom corners */}
          {customCorners.length > 0 && (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-brown-300 px-3 mt-3 mb-1">
                {t('sidebar.myCorners')}
              </p>
              {customCorners.map((row) => {
                const id = `c_${row.id}`;
                return (
                  <SidebarItem key={id} corner={allCorners[id]}
                    isActive={view === 'corner' && activeCorner === id}
                    onSelect={() => handleSelect(id)}
                    onDelete={() => handleDelete(row)} />
                );
              })}
            </>
          )}

          {/* Add corner */}
          <div className="mt-2 px-1">
            {showAddForm ? (
              <AddCornerForm onDone={() => setShowAddForm(false)} />
            ) : (
              <button onClick={() => setShowAddForm(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-brown-300 hover:text-brown-500 hover:bg-beige-200 transition-colors border-2 border-dashed border-beige-300">
                <Plus className="w-3.5 h-3.5" /> {t('sidebar.addCorner')}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-beige-300">
          <p className="text-[10px] text-brown-300 text-center">{t('sidebar.allInOnePlace')}</p>
        </div>
      </aside>
    </>
  );
}
