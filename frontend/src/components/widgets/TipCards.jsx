import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';

export default function TipCards({ corner }) {
  const [idx, setIdx] = useState(0);
  const tips = corner.tips;
  if (!tips?.length) return null;

  const tip = tips[idx];
  const prev = () => setIdx((i) => (i - 1 + tips.length) % tips.length);
  const next = () => setIdx((i) => (i + 1) % tips.length);

  return (
    <div className="rounded-3xl p-5 border" style={{ background: corner.soft, borderColor: corner.border }}>
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4" style={{ color: corner.primary }} />
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: corner.primary }}>
          Quick Tip
        </h3>
        <span className="ml-auto text-[10px] text-stone-400">{idx + 1}/{tips.length}</span>
      </div>

      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">{tip.icon}</span>
        <p className="text-sm text-stone-600 leading-relaxed flex-1">{tip.text}</p>
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={prev} className="p-1.5 rounded-xl hover:bg-white/60 text-stone-400 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 flex items-center justify-center gap-1">
          {tips.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="w-1.5 h-1.5 rounded-full transition-all"
              style={{ background: i === idx ? corner.primary : '#d1d5db' }}
            />
          ))}
        </div>
        <button onClick={next} className="p-1.5 rounded-xl hover:bg-white/60 text-stone-400 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
