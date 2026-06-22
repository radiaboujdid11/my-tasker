import React, { useState, useEffect } from 'react';
import { Droplets, Plus, RotateCcw } from 'lucide-react';

const TARGET = 8;
const TODAY_KEY = () => `water_${new Date().toISOString().split('T')[0]}`;

export default function WaterTracker({ corner }) {
  const [glasses, setGlasses] = useState(() => {
    return parseInt(localStorage.getItem(TODAY_KEY()) || '0', 10);
  });

  useEffect(() => {
    localStorage.setItem(TODAY_KEY(), glasses);
  }, [glasses]);

  const add = () => setGlasses((g) => Math.min(g + 1, TARGET));
  const reset = () => setGlasses(0);
  const pct = Math.round((glasses / TARGET) * 100);

  return (
    <div className="rounded-3xl p-5 border" style={{ background: corner.soft, borderColor: corner.border }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5" style={{ color: corner.primary }} />
          <h3 className="font-semibold text-stone-700 text-sm">Water Tracker</h3>
        </div>
        <button onClick={reset} className="p-1.5 rounded-xl hover:bg-white/60 text-stone-400 transition-colors" title="Reset">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Glasses grid */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Array.from({ length: TARGET }).map((_, i) => (
          <button
            key={i}
            onClick={() => setGlasses(i + 1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all duration-200"
            style={i < glasses
              ? { background: corner.btnGradient, boxShadow: `0 2px 8px ${corner.ring}` }
              : { background: 'rgba(255,255,255,0.7)', border: `1.5px dashed ${corner.border}` }
            }
            title={`${i + 1} glass${i > 0 ? 'es' : ''}`}
          >
            {i < glasses ? '💧' : '○'}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-stone-500">{glasses}/{TARGET} glasses</span>
        <span className="text-xs font-bold" style={{ color: corner.primary }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/60 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: corner.btnGradient }}
        />
      </div>

      {glasses >= TARGET && (
        <p className="mt-3 text-xs text-center font-medium" style={{ color: corner.primary }}>
          🎉 Goal reached! Amazing!
        </p>
      )}

      <button
        onClick={add}
        disabled={glasses >= TARGET}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-2xl text-white text-sm font-medium transition-all disabled:opacity-40"
        style={{ background: corner.btnGradient }}
      >
        <Plus className="w-4 h-4" /> Add a glass
      </button>
    </div>
  );
}
