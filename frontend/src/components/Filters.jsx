import React from 'react';
import { Search, SlidersHorizontal, Calendar } from 'lucide-react';

const STATUS_TABS = [
  { value: 'all',       label: 'All' },
  { value: 'active',    label: 'Active' },
  { value: 'completed', label: 'Done' },
];

const PRIORITY_OPTIONS = [
  { value: '',       label: 'Any priority' },
  { value: 'high',   label: '🌹 High' },
  { value: 'medium', label: '🍑 Medium' },
  { value: 'low',    label: '🌿 Low' },
];

const DUE_OPTIONS = [
  { value: '',        label: 'Any date' },
  { value: 'today',   label: '☀️ Today' },
  { value: 'week',    label: '📅 This week' },
  { value: 'overdue', label: '⏰ Overdue' },
];

export default function Filters({
  filters, onChange,
  totalCount, activeCount, completedCount,
  corner = { primary: '#f43f5e', soft: '#fff1f2', border: '#fecdd3', btnGradient: 'linear-gradient(135deg,#f43f5e,#ec4899)' },
}) {
  const counts = { all: totalCount, active: activeCount, completed: completedCount };

  return (
    <div className="card p-4 flex flex-col gap-4">
      {/* Status tabs */}
      <div className="flex gap-1.5 rounded-2xl p-1.5" style={{ background: corner.soft }}>
        {STATUS_TABS.map((tab) => {
          const isActive = filters.status === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onChange({ ...filters, status: tab.value })}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={isActive
                ? { background: corner.btnGradient, color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
                : { color: '#78716c' }
              }
            >
              {tab.label}
              <span
                className="min-w-[1.2rem] h-5 rounded-full text-xs flex items-center justify-center font-semibold px-1"
                style={isActive
                  ? { background: 'rgba(255,255,255,0.25)', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.7)', color: corner.primary }
                }
              >
                {counts[tab.value]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="input pl-10"
          />
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 sm:flex-none">
            <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-300 pointer-events-none" />
            <select
              value={filters.priority}
              onChange={(e) => onChange({ ...filters, priority: e.target.value })}
              className="input pl-9 pr-3 appearance-none w-full sm:w-36 cursor-pointer"
            >
              {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="relative flex-1 sm:flex-none">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-300 pointer-events-none" />
            <select
              value={filters.due}
              onChange={(e) => onChange({ ...filters, due: e.target.value })}
              className="input pl-9 pr-3 appearance-none w-full sm:w-36 cursor-pointer"
            >
              {DUE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
