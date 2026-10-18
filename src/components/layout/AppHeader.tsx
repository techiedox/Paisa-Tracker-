import React, { useState } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { getMonthDisplayName } from '../../services/currencyFormatter';

import { AppLogo } from '../common/AppLogo';

export const AppHeader: React.FC = () => {
  const {
    settings,
    isDarkMode,
    toggleTheme,
    notifications,
    clearNotifications,
    currentMonth,
  } = useFinance();

  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="shrink-0 w-full z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs transition-colors select-none">
      <div className="w-full px-4 py-2.5 flex items-center justify-between max-w-4xl mx-auto">
        {/* Brand Logo & Local Storage indicator */}
        <div className="flex items-center gap-2.5">
          <AppLogo size={36} />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black tracking-tight leading-none">
                <span className="text-[#C99E58] dark:text-[#E0B870]">Paisa</span>{' '}
                <span className="text-[#1E2C44] dark:text-zinc-100">Tracker</span>
              </h1>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                <ShieldCheck size={10} /> Local
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-1">
              <Calendar size={11} className="text-zinc-400" />
              <span>{getMonthDisplayName(currentMonth)}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          <button
            onClick={() => toggleTheme(isDarkMode ? 'light' : 'dark')}
            title="Toggle Light/Dark Theme"
            className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Notifications Menu */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell size={17} />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-zinc-900" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-3 z-50 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                      Budget & Spending Alerts
                    </span>
                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded-full font-bold">
                      {notifications.length}
                    </span>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={12} /> Clear
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-zinc-400">
                      No new alerts. Your spending is looking good!
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-xs flex gap-2.5"
                      >
                        <div className="mt-0.5 shrink-0">
                          {n.type === 'alert' ? (
                            <AlertTriangle size={15} className="text-rose-500" />
                          ) : n.type === 'warning' ? (
                            <AlertTriangle size={15} className="text-amber-500" />
                          ) : n.type === 'success' ? (
                            <CheckCircle2 size={15} className="text-emerald-500" />
                          ) : (
                            <Info size={15} className="text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                              {n.title}
                            </span>
                            <span className="text-[10px] text-zinc-400 ml-1 shrink-0">
                              {n.timestamp}
                            </span>
                          </div>
                          <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
