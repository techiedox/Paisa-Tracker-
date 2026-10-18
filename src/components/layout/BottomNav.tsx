import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Plus,
  PieChart,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, openTransactionModal } = useFinance();

  return (
    <nav className="sticky sm:fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200/80 dark:border-zinc-800/80 py-2 px-4 pb-safe select-none">
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        {/* Home */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          <LayoutDashboard size={20} strokeWidth={activeTab === 'dashboard' ? 2.4 : 1.8} />
          <span className="text-[10px] mt-1 tracking-tight">Home</span>
        </button>

        {/* Transactions */}
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'transactions'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          <Receipt size={20} strokeWidth={activeTab === 'transactions' ? 2.4 : 1.8} />
          <span className="text-[10px] mt-1 tracking-tight">Activity</span>
        </button>

        {/* Center Prominent Add Button */}
        <div className="relative -top-5">
          <button
            onClick={() => openTransactionModal(null, 'expense')}
            className="w-13 h-13 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shadow-xl shadow-zinc-900/30 dark:shadow-black/60 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-white dark:ring-zinc-900"
            aria-label="Add Transaction"
          >
            <Plus size={24} strokeWidth={2.6} />
          </button>
        </div>

        {/* Insights / Analytics */}
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          <PieChart size={20} strokeWidth={activeTab === 'analytics' ? 2.4 : 1.8} />
          <span className="text-[10px] mt-1 tracking-tight">Insights</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
          }`}
        >
          <SettingsIcon size={20} strokeWidth={activeTab === 'settings' ? 2.4 : 1.8} />
          <span className="text-[10px] mt-1 tracking-tight">Settings</span>
        </button>
      </div>
    </nav>
  );
};
