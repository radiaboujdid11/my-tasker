import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
         addDays, addMonths, subMonths, isSameMonth, isToday, parseISO, isSameDay } from 'date-fns';
import { getTodos } from '../services/api';
import { useCorner } from '../context/CornerContext';
import { useNotification } from '../context/NotificationContext';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarPage() {
  const [current, setCurrent] = useState(new Date());
  const [todos, setTodos] = useState([]);
  const [selected, setSelected] = useState(null);
  const { allCorners } = useCorner();
  const { add } = useNotification();

  const fetchAll = useCallback(async () => {
    try {
      const res = await getTodos({});
      setTodos(res.data.filter((t) => t.due_date));
    } catch {
      add('Could not load tasks', 'error');
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Build calendar grid
  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = [];
  let day = gridStart;
  while (day <= gridEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const todosForDay = (d) =>
    todos.filter((t) => t.due_date && isSameDay(parseISO(t.due_date), d));

  const selectedTodos = selected ? todosForDay(selected) : [];

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl font-semibold text-brown-600">
          {format(current, 'MMMM yyyy')}
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrent(subMonths(current, 1))}
            className="w-9 h-9 rounded-xl border border-beige-300 flex items-center justify-center hover:bg-beige-200 text-brown-400 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setCurrent(new Date())}
            className="px-3 py-1.5 rounded-xl border border-beige-300 text-sm text-brown-500 hover:bg-beige-200 transition-colors">
            Today
          </button>
          <button onClick={() => setCurrent(addMonths(current, 1))}
            className="w-9 h-9 rounded-xl border border-beige-300 flex items-center justify-center hover:bg-beige-200 text-brown-400 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="card overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-beige-200">
          {DAYS.map((d) => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-brown-300 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {days.map((d, i) => {
            const dayTodos = todosForDay(d);
            const isCurrentMonth = isSameMonth(d, current);
            const isTodayDate = isToday(d);
            const isSelected = selected && isSameDay(d, selected);

            return (
              <button
                key={i}
                onClick={() => setSelected(isSameDay(d, selected) ? null : d)}
                className={`min-h-[80px] p-2 text-left border-b border-r border-beige-200 transition-colors
                  ${!isCurrentMonth ? 'bg-beige-50' : 'hover:bg-beige-100'}
                  ${isSelected ? 'bg-beige-200' : ''}`}
              >
                <span className={`text-sm font-medium inline-flex items-center justify-center w-7 h-7 rounded-full
                  ${isTodayDate ? 'bg-brown-600 text-white' : isCurrentMonth ? 'text-brown-600' : 'text-brown-300'}`}>
                  {format(d, 'd')}
                </span>

                {/* Task dots */}
                <div className="mt-1 flex flex-col gap-0.5">
                  {dayTodos.slice(0, 3).map((todo) => {
                    const corner = allCorners[todo.corner] || allCorners.tasks;
                    return (
                      <div key={todo.id}
                        className="text-[10px] px-1.5 py-0.5 rounded truncate leading-tight"
                        style={{ background: corner.soft, color: corner.primary }}>
                        {todo.title}
                      </div>
                    );
                  })}
                  {dayTodos.length > 3 && (
                    <p className="text-[10px] text-brown-300 px-1">+{dayTodos.length - 3} more</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day tasks */}
      {selected && selectedTodos.length > 0 && (
        <div className="mt-6 card p-5 animate-slide-up">
          <h3 className="font-display font-semibold text-brown-600 mb-3">
            {format(selected, 'MMMM d, yyyy')}
          </h3>
          <div className="flex flex-col gap-2">
            {selectedTodos.map((todo) => {
              const corner = allCorners[todo.corner] || allCorners.tasks;
              return (
                <div key={todo.id} className="flex items-center gap-3 py-2 border-b border-beige-200 last:border-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: corner.primary }} />
                  <span className={`text-sm ${todo.is_completed ? 'line-through text-brown-300' : 'text-brown-600'}`}>
                    {todo.title}
                  </span>
                  <span className="text-xs text-brown-300 ml-auto">{corner.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selected && selectedTodos.length === 0 && (
        <div className="mt-6 text-center py-8 text-brown-300 text-sm">
          No tasks due on {format(selected, 'MMMM d')}
        </div>
      )}
    </div>
  );
}
