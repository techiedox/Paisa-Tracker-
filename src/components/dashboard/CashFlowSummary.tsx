import React from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/currencyFormatter';

export const CashFlowSummary: React.FC = () => {
  const { monthSummary, settings } = useFinance();
  const { totalIncome, totalExpense } = monthSummary;

  const totalVolume = totalIncome + totalExpense;
  const incomePct = totalVolume > 0 ? (totalIncome / totalVolume) * 100 : 50;
  const expensePct = totalVolume > 0 ? (totalExpense / totalVolume) * 100 : 50;

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
      <div className="grid grid-cols-2 gap-4 divide-x divide-zinc-100 dark:divide-zinc-800">
        {/* Income Card */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ArrowDownLeft size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Total Income
            </span>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate block">
              {formatCurrency(totalIncome, settings.currency, settings.numberFormat)}
            </span>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="flex items-start gap-3 pl-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <ArrowUpRight size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Total Expenses
            </span>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate block">
              {formatCurrency(totalExpense, settings.currency, settings.numberFormat)}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Proportion Bar */}
      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
        <div className="flex justify-between text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
          <span>Income: {incomePct.toFixed(0)}%</span>
          <span>Expenses: {expensePct.toFixed(0)}%</span>
        </div>
        <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 rounded-l-full"
            style={{ width: `${incomePct}%` }}
          />
          <div
            className="h-full bg-rose-500 transition-all duration-500 rounded-r-full"
            style={{ width: `${expensePct}%` }}
          />
        </div>
      </div>
    </div>
  );
};
