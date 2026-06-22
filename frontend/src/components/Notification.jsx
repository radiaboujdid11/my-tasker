import React from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const CONFIG = {
  success: {
    icon: CheckCircle2,
    classes: 'bg-sage-50 border-sage-200 dark:bg-sage-400/10 dark:border-sage-400/30',
    iconClass: 'text-sage-400',
    textClass: 'text-stone-700 dark:text-sage-100',
  },
  error: {
    icon: XCircle,
    classes: 'bg-rose-50 border-rose-200 dark:bg-rose-400/10 dark:border-rose-400/30',
    iconClass: 'text-rose-500',
    textClass: 'text-stone-700 dark:text-rose-100',
  },
  info: {
    icon: Info,
    classes: 'bg-lavender-50 border-lavender-200 dark:bg-lavender-400/10 dark:border-lavender-400/30',
    iconClass: 'text-lavender-500',
    textClass: 'text-stone-700 dark:text-lavender-100',
  },
};

export default function Notification() {
  const { notifications, remove } = useNotification();
  if (!notifications.length) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full">
      {notifications.map((n) => {
        const cfg = CONFIG[n.type] || CONFIG.info;
        const Icon = cfg.icon;
        return (
          <div
            key={n.id}
            className={`flex items-start gap-3 rounded-2xl border p-4 shadow-soft-lg animate-slide-in-right ${cfg.classes}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.iconClass}`} />
            <p className={`flex-1 text-sm font-medium ${cfg.textClass}`}>{n.message}</p>
            <button
              onClick={() => remove(n.id)}
              className="shrink-0 text-stone-300 hover:text-stone-500 dark:text-white/30 dark:hover:text-white/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
