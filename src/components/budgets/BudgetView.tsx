import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  PiggyBank,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Budget } from '../../types';
import { BudgetModal } from './BudgetModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatCurrency, getMonthDisplayName } from '../../services/currencyFormatter';
import { MonthSelector } from '../dashboard/MonthSelector';

export const BudgetView: React.FC = () => {
  const { budgets, currentMonth, transactions, categories, settings, deleteBudget } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudgetId, setDeletingBudgetId] = useState<string | null>(null);

  const monthBudgets = budgets.filter((b) => b.month === currentMonth);
  const overallBudget = monthBudgets.find((b) => b.categoryId === 'overall');
  const categoryBudgets = monthBudgets.filter((b) => b.categoryId !== 'overall');

  // Month expenses
  const monthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(currentMonth)
  );

  const totalSpent = monthExpenses.reduce((sum, t) => sum + t.amount, 0);

  const getCategoryExpense = (catId: string) => {
    return monthExpenses
      .filter((t) => t.categoryId === catId)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleEdit = (b: Budget) => {
    setEditingBudget(b);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingBudgetId) {
      deleteBudget(deletingBudgetId);
      setDeletingBudgetId(null);
    }
  };

  return (
    <div className="space-y-4 px-4 py-3 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Budgets
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Monthly spending caps & targets for {getMonthDisplayName(currentMonth)}
          </p>
        </div>

        <button
          onClick={() => {
            setEditingBudget(null);
            setIsModalOpen(true);
          }}
          className="py-2 px-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs hover:scale-102"
        >
          <Plus size={14} />
          <span>New Budget</span>
        </button>
      </div>

      <MonthSelector />

      {/* Overall Budget Hero Card */}
      {overallBudget ? (
        (() => {
          const spent = totalSpent;
          const limit = overallBudget.amount;
          const remaining = limit - spent;
          const percent = Math.min(100, Math.round((spent / limit) * 100));
          const isOver = spent > limit;
          const isWarning = !isOver && percent >= overallBudget.alertThreshold;

          return (
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <PiggyBank size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Overall Monthly Budget
                    </h3>
                    <span className="text-[10px] text-zinc-400">
                      Alerts at {overallBudget.alertThreshold}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(overallBudget)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => setDeletingBudgetId(overallBudget.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Status Pill */}
              <div className="mb-3">
                {isOver ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                    <ShieldAlert size={12} /> Limit Exceeded by {formatCurrency(Math.abs(remaining), settings.currency, settings.numberFormat)}
                  </span>
                ) : isWarning ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <AlertTriangle size={12} /> Approaching Limit ({percent}%)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 size={12} /> On Track ({formatCurrency(remaining, settings.currency, settings.numberFormat)} remaining)
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (spent / limit) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-xs font-mono">
                <div>
                  <span className="text-[10px] text-zinc-400 block font-sans">Spent</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(spent, settings.currency, settings.numberFormat)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 block font-sans">Budget Limit</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(limit, settings.currency, settings.numberFormat)}
                  </span>
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
          <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
            No overall budget created for {getMonthDisplayName(currentMonth)}
          </p>
          <p className="text-xs text-zinc-400 mb-3">
            Set an overall monthly limit to prevent overspending.
          </p>
          <button
            onClick={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            + Set Monthly Budget
          </button>
        </div>
      )}

      {/* Category Specific Budgets */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
          Category Spending Limits ({categoryBudgets.length})
        </h3>

        {categoryBudgets.length === 0 ? (
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 text-center">
            <p className="text-xs text-zinc-400">
              No category-specific limits configured. You can set individual limits on Dining, Groceries, Shopping, etc.
            </p>
          </div>
        ) : (
          categoryBudgets.map((b) => {
            const cat = categories.find((c) => c.id === b.categoryId) || {
              id: b.categoryId,
              name: 'Category',
              icon: 'Tag',
              color: '#10B981',
              type: 'expense' as const,
            };
            const spent = getCategoryExpense(b.categoryId);
            const limit = b.amount;
            const remaining = limit - spent;
            const percent = Math.min(100, Math.round((spent / limit) * 100));
            const isOver = spent > limit;
            const isWarning = !isOver && percent >= b.alertThreshold;

            return (
              <div
                key={b.id}
                className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} size={16} color={cat.color} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {cat.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 block">
                        Limit: {formatCurrency(limit, settings.currency, settings.numberFormat)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(b)}
                      className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => setDeletingBudgetId(b.id)}
                      className="p-1 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (spent / limit) * 100)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Spent: {formatCurrency(spent, settings.currency, settings.numberFormat)} ({percent}%)
                  </span>
                  <span
                    className={`font-semibold ${
                      isOver ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {isOver
                      ? `Exceeded by ${formatCurrency(Math.abs(remaining), settings.currency, settings.numberFormat)}`
                      : `${formatCurrency(remaining, settings.currency, settings.numberFormat)} left`}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingBudget={editingBudget}
      />

      <ConfirmDialog
        isOpen={!!deletingBudgetId}
        onClose={() => setDeletingBudgetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Budget"
        message="Are you sure you want to delete this spending budget? It will remove progress tracking for this month."
      />
    </div>
  );
};
