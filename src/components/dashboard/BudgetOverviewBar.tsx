import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, Sliders, Check } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, toMinorUnits, fromMinorUnits } from '../../services/currencyFormatter';
import { Modal } from '../common/Modal';

export const BudgetOverviewBar: React.FC = () => {
  const { budgets, currentMonth, monthSummary, settings, saveBudget } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  const overallBudget = budgets.find(
    (b) => b.month === currentMonth && b.categoryId === 'overall'
  );

  const spent = monthSummary.totalExpense;
  const budgetAmount = overallBudget ? overallBudget.amount : 0;
  const remaining = budgetAmount - spent;
  const percentUsed = budgetAmount > 0 ? Math.min(100, Math.round((spent / budgetAmount) * 100)) : 0;
  const isOverBudget = budgetAmount > 0 && spent > budgetAmount;
  const isNearLimit = !isOverBudget && budgetAmount > 0 && percentUsed >= (overallBudget?.alertThreshold || 80);

  const openBudgetModal = () => {
    if (overallBudget) {
      setBudgetInput(fromMinorUnits(overallBudget.amount).toString());
    } else {
      setBudgetInput('50000');
    }
    setIsModalOpen(true);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(budgetInput);
    if (!isNaN(parsed) && parsed > 0) {
      saveBudget({
        id: overallBudget ? overallBudget.id : undefined,
        categoryId: 'overall',
        amount: toMinorUnits(parsed),
        month: currentMonth,
        alertThreshold: 80,
      });
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
              Monthly Budget
            </span>
            {budgetAmount > 0 ? (
              isOverBudget ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800 flex items-center gap-1">
                  <ShieldAlert size={10} /> Over Limit
                </span>
              ) : isNearLimit ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800 flex items-center gap-1">
                  <AlertTriangle size={10} /> {percentUsed}% Used
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 size={10} /> On Track
                </span>
              )
            ) : (
              <span className="text-[10px] font-medium text-zinc-400">Not set</span>
            )}
          </div>

          <button
            onClick={openBudgetModal}
            className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer font-medium p-1"
            title="Configure monthly budget"
          >
            <Sliders size={13} />
            <span>{budgetAmount > 0 ? 'Edit' : 'Set'}</span>
          </button>
        </div>

        {budgetAmount > 0 ? (
          <>
            {/* Figures */}
            <div className="flex justify-between items-baseline mb-2 text-xs">
              <div>
                <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Spent: </span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                  {formatCurrency(spent, settings.currency, settings.numberFormat)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                  {isOverBudget ? 'Over by: ' : 'Remaining: '}
                </span>
                <span
                  className={`font-bold font-mono ${
                    isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {formatCurrency(Math.abs(remaining), settings.currency, settings.numberFormat)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isOverBudget
                    ? 'bg-rose-500'
                    : isNearLimit
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (spent / budgetAmount) * 100)}%` }}
              />
            </div>

            <div className="mt-2 flex justify-between text-[10px] text-zinc-400">
              <span>Limit: {formatCurrency(budgetAmount, settings.currency, settings.numberFormat)}</span>
              <span>{percentUsed}% spent</span>
            </div>
          </>
        ) : (
          <div className="py-2 flex items-center justify-between">
            <span className="text-xs text-zinc-400">Track monthly spending against a target.</span>
            <button
              onClick={openBudgetModal}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              + Set Budget
            </button>
          </div>
        )}
      </div>

      {/* Quick Budget Setting Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Set Monthly Budget"
        subtitle={`Spending target for ${currentMonth}`}
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleSaveBudget} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
              Monthly Limit ({settings.currencySymbol})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">
                {settings.currencySymbol}
              </span>
              <input
                type="number"
                step="1"
                min="1"
                placeholder="50000"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                autoFocus
                required
                className="w-full pl-9 pr-3 py-2.5 text-base font-mono font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1.5">
              You will receive gentle in-app alerts when reaching 80% of this budget.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check size={15} /> Save Monthly Budget
          </button>
        </form>
      </Modal>
    </>
  );
};
