import React from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { getMonthDisplayName, getMonthString } from '../../services/currencyFormatter';

export const MonthSelector: React.FC = () => {
  const { currentMonth, setCurrentMonth } = useFinance();
  const currentActualMonth = getMonthString();

  const changeMonth = (delta: number) => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + delta, 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${newY}-${newM}`);
  };

  const isCurrent = currentMonth === currentActualMonth;

  return (
    <div className="flex items-center justify-between bg-white dark:bg-zinc-900 px-3.5 py-2 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 shadow-2xs">
      <button
        onClick={() => changeMonth(-1)}
        className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
        aria-label="Previous Month"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
          {getMonthDisplayName(currentMonth)}
        </span>
        {!isCurrent && (
          <button
            onClick={() => setCurrentMonth(currentActualMonth)}
            title="Jump to current month"
            className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <RotateCcw size={10} /> Now
          </button>
        )}
      </div>

      <button
        onClick={() => changeMonth(1)}
        className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
        aria-label="Next Month"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};
