import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { isToday, isThisWeek, isPast, parseISO } from 'date-fns';
import { Plus, X, ListChecks, CheckCheck } from 'lucide-react';
import Filters from '../components/Filters';
import TodoItem from '../components/TodoItem';
import TodoForm from '../components/TodoForm';
import TipCards from '../components/widgets/TipCards';
import WaterTracker from '../components/widgets/WaterTracker';
import SkinRoutine from '../components/widgets/SkinRoutine';
import ExpenseTracker from '../components/widgets/ExpenseTracker';
import { useNotification } from '../context/NotificationContext';
import { useCorner } from '../context/CornerContext';
import { getTodos, createTodo, updateTodo, deleteTodo, toggleComplete } from '../services/api';
import { useTranslation } from 'react-i18next';

const DEFAULT_FILTERS = { status: 'all', priority: '', search: '', due: '' };

function CornerHeader({ corner, activeCnt, completedCnt, totalCnt, onAdd, showForm }) {
  const Icon = corner.icon;
  const { t } = useTranslation();
  return (
    <div
      className="rounded-3xl p-6 mb-6 relative overflow-hidden"
      style={{ background: corner.btnGradient }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl">{corner.emoji}</span>
          </div>
          <h2 className="font-display text-2xl font-semibold text-white leading-tight">
            {corner.name}
          </h2>
          <p className="text-white/70 text-sm mt-0.5">{corner.description}</p>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className="inline-flex items-center gap-1.5 bg-white/20 text-white rounded-full px-3 py-1 text-xs font-medium">
              <ListChecks className="w-3 h-3" /> {activeCnt} {t('dashboard.active')}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/20 text-white rounded-full px-3 py-1 text-xs font-medium">
              <CheckCheck className="w-3 h-3" /> {completedCnt} {t('dashboard.done')}
            </span>
          </div>
        </div>

        <button
          onClick={onAdd}
          className="shrink-0 flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 backdrop-blur-sm"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span className="hidden sm:inline">{showForm ? t('dashboard.cancel') : t('dashboard.addTask')}</span>
        </button>
      </div>

      {/* Progress bar */}
      {totalCnt > 0 && (
        <div className="relative mt-4">
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/80 rounded-full transition-all duration-700"
              style={{ width: `${Math.round((completedCnt / totalCnt) * 100)}%` }}
            />
          </div>
          <p className="text-white/60 text-[11px] mt-1">
            {Math.round((completedCnt / totalCnt) * 100)}% {t('dashboard.complete')}
          </p>
        </div>
      )}
    </div>
  );
}

function CornerWidgets({ corner }) {
  if (corner.id === 'tasks') return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      {corner.id === 'healthy' && (
        <>
          <WaterTracker corner={corner} />
          <TipCards corner={corner} />
        </>
      )}
      {corner.id === 'skin' && (
        <>
          <SkinRoutine corner={corner} />
          <TipCards corner={corner} />
        </>
      )}
      {corner.id === 'financial' && (
        <div className="sm:col-span-2">
          <ExpenseTracker corner={corner} />
        </div>
      )}
      {corner.id === 'glowup' && (
        <div className="sm:col-span-2">
          <TipCards corner={corner} />
        </div>
      )}
      {corner.id === 'mind' && (
        <div className="sm:col-span-2">
          <TipCards corner={corner} />
        </div>
      )}
    </div>
  );
}

function EmptyState({ corner, hasFilters, onClear }) {
  const { t } = useTranslation();
  return (
    <div className="text-center py-14 animate-fade-in">
      <div className="text-5xl mb-4">{hasFilters ? '🔍' : corner.emoji}</div>
      {hasFilters ? (
        <>
          <p className="text-stone-500 font-medium">{t('dashboard.noMatch')}</p>
          <button onClick={onClear} className="mt-2 text-sm font-medium flex items-center gap-1 mx-auto"
            style={{ color: corner.primary }}>
            <X className="w-3.5 h-3.5" /> {t('dashboard.clearFilters')}
          </button>
        </>
      ) : (
        <>
          <p className="text-stone-600 font-semibold font-display">{t('dashboard.nothingYet')}</p>
          <p className="text-sm text-stone-400 mt-1">{t('dashboard.addFirstTask')}</p>
        </>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { add } = useNotification();
  const { activeCorner, allCorners } = useCorner();
  const { t } = useTranslation();
  const corner = allCorners[activeCorner] || allCorners.tasks;

  const [todos, setTodos] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Reset filters and form when corner changes
  useEffect(() => {
    setFilters(DEFAULT_FILTERS);
    setShowForm(false);
  }, [activeCorner]);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    try {
      const params = { corner: activeCorner };
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      const res = await getTodos(params);
      setTodos(res.data);
    } catch {
      add('Could not load tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeCorner, filters.status, filters.priority, filters.search]);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  // Client-side due date filter
  const displayedTodos = useMemo(() => {
    if (!filters.due) return todos;
    return todos.filter((t) => {
      if (!t.due_date) return false;
      const d = parseISO(t.due_date);
      if (filters.due === 'today') return isToday(d);
      if (filters.due === 'week') return isThisWeek(d, { weekStartsOn: 1 });
      if (filters.due === 'overdue') return isPast(d) && !isToday(d) && !t.is_completed;
      return true;
    });
  }, [todos, filters.due]);

  const activeTodos    = useMemo(() => todos.filter((t) => !t.is_completed), [todos]);
  const completedTodos = useMemo(() => todos.filter((t) => t.is_completed), [todos]);

  const handleCreate = async (data) => {
    setCreateLoading(true);
    try {
      const res = await createTodo({ ...data, corner: activeCorner });
      setTodos((prev) => [res.data, ...prev]);
      add('Task added! ✨', 'success');
      setShowForm(false);
    } catch (err) {
      add(err.response?.data?.errors?.[0]?.msg || 'Could not create task', 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggle = async (id, is_completed) => {
    try {
      const res = await toggleComplete(id, is_completed);
      setTodos((prev) => prev.map((t) => (t.id === id ? res.data : t)));
      add(is_completed ? 'Task completed! 🎉' : 'Moved back to active', 'success');
    } catch {
      add('Could not update task', 'error');
    }
  };

  const handleUpdate = async (id, data) => {
    const original = todos.find((t) => t.id === id);
    try {
      const res = await updateTodo(id, { ...data, corner: original?.corner || activeCorner });
      setTodos((prev) => prev.map((t) => (t.id === id ? res.data : t)));
      add('Task updated ✨', 'success');
    } catch {
      add('Could not update task', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
      add('Task removed', 'info');
    } catch {
      add('Could not delete task', 'error');
    }
  };

  const hasFilters = filters.status !== 'all' || filters.priority || filters.search || filters.due;

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: '#ece5d8' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">

        {/* Corner header */}
        <CornerHeader
          corner={corner}
          activeCnt={activeTodos.length}
          completedCnt={completedTodos.length}
          totalCnt={todos.length}
          onAdd={() => setShowForm((v) => !v)}
          showForm={showForm}
        />

        {/* Add task form */}
        {showForm && (
          <div className="card p-6 mb-6 animate-slide-up shadow-soft-lg">
            <h3 className="font-display text-base font-semibold text-stone-700 mb-4 flex items-center gap-2">
              <span>{corner.emoji}</span> {t('dashboard.newTask')} {corner.name}
            </h3>
            <TodoForm
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
              loading={createLoading}
              cornerColor={corner.primary}
              cornerGradient={corner.btnGradient}
            />
          </div>
        )}

        {/* Corner-specific widgets */}
        <CornerWidgets corner={corner} />

        {/* Filters */}
        <div className="mb-4">
          <Filters
            filters={filters}
            onChange={setFilters}
            totalCount={todos.length}
            activeCount={activeTodos.length}
            completedCount={completedTodos.length}
            corner={corner}
          />
        </div>

        {/* Task list */}
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex flex-col items-center py-14 gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: `${corner.border} transparent ${corner.border} ${corner.border}` }} />
              <p className="text-sm text-stone-400">{t('dashboard.loadingTasks')}</p>
            </div>
          ) : displayedTodos.length === 0 ? (
            <EmptyState corner={corner} hasFilters={hasFilters} onClear={() => setFilters(DEFAULT_FILTERS)} />
          ) : (
            displayedTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                cornerColor={corner.primary}
                cornerGradient={corner.btnGradient}
                onToggle={handleToggle}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
