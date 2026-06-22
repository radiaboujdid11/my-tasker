import React, { useState, useEffect } from 'react';
import { Check, Sun, Moon } from 'lucide-react';

const AM_STEPS = ['Gentle Cleanser', 'Toner', 'Vitamin C Serum', 'Moisturizer', 'Sunscreen SPF 30+'];
const PM_STEPS = ['Makeup Remover', 'Cleanser', 'Exfoliant (2-3x/week)', 'Toner', 'Retinol/Serum', 'Night Cream'];

const KEY = (tab) => `routine_${tab}_${new Date().toISOString().split('T')[0]}`;

export default function SkinRoutine({ corner }) {
  const [tab, setTab] = useState('am');
  const steps = tab === 'am' ? AM_STEPS : PM_STEPS;

  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY(tab)) || '[]'); } catch { return []; }
  });

  useEffect(() => {
    try { setChecked(JSON.parse(localStorage.getItem(KEY(tab)) || '[]')); } catch { setChecked([]); }
  }, [tab]);

  const toggle = (step) => {
    const next = checked.includes(step) ? checked.filter((s) => s !== step) : [...checked, step];
    setChecked(next);
    localStorage.setItem(KEY(tab), JSON.stringify(next));
  };

  const pct = steps.length ? Math.round((checked.length / steps.length) * 100) : 0;

  return (
    <div className="rounded-3xl border overflow-hidden" style={{ borderColor: corner.border }}>
      {/* Tab header */}
      <div className="flex" style={{ background: corner.soft }}>
        {[
          { id: 'am', label: 'AM Routine', Icon: Sun },
          { id: 'pm', label: 'PM Routine', Icon: Moon },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all"
            style={tab === id
              ? { background: corner.btnGradient, color: '#fff' }
              : { color: corner.primary }}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      <div className="p-4" style={{ background: corner.soft }}>
        {/* Progress */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-stone-500">{checked.length}/{steps.length} steps done</p>
          <p className="text-xs font-bold" style={{ color: corner.primary }}>{pct}%</p>
        </div>
        <div className="h-1.5 bg-white/60 rounded-full overflow-hidden mb-4">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: corner.btnGradient }} />
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-2">
          {steps.map((step) => {
            const done = checked.includes(step);
            return (
              <button
                key={step}
                onClick={() => toggle(step)}
                className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-2xl transition-all bg-white/60 hover:bg-white/80"
              >
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                  style={done
                    ? { background: corner.btnGradient, borderColor: 'transparent' }
                    : { borderColor: corner.border }}
                >
                  {done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
                <span className={`text-sm ${done ? 'line-through text-stone-400' : 'text-stone-700'}`}>
                  {step}
                </span>
              </button>
            );
          })}
        </div>

        {pct === 100 && (
          <p className="mt-3 text-center text-xs font-semibold" style={{ color: corner.primary }}>
            ✨ Full routine complete — your skin thanks you!
          </p>
        )}
      </div>
    </div>
  );
}
