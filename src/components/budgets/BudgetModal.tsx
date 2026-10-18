import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Budget } from '../../types';
import { Modal } from '../common/Modal';
import { toMinorUnits, fromMinorUnits } from '../../services/currencyFormatter';
import { CategoryIcon } from '../common/CategoryIcon';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBudget: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  editingBudget,
}) => {
  const { currentMonth, categories, saveBudget, settings } = useFinance();
  const [categoryId, setCategoryId] = useState<string>('overall');
  const [amountStr, setAmountStr] = useState<string>('');
  const [alertThreshold, setAlertThreshold] = useState<number>(80);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editingBudget) {
      setCategoryId(editingBudget.categoryId);
      setAmountStr(fromMinorUnits(editingBudget.amount).toString());
      setAlertThreshold(editingBudget.alertThreshold || 80);
    } else {
      setCategoryId('overall');
      setAmountStr('');
      setAlertThreshold(80);
    }
    setError('');
  }, [editingBudget, isOpen]);

  const expenseCategories = categories.filter((c) => c.type === 'expense' || c.type === 'both');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please specify a positive budget limit.');
      return;
    }

    saveBudget({
      id: editingBudget ? editingBudget.id : undefined,
      categoryId,
      amount: toMinorUnits(parsedAmount),
      month: currentMonth,
      alertThreshold,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingBudget ? 'Edit Spending Budget' : 'Create Monthly Budget'}
      subtitle={`Budget for ${currentMonth}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-xs text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
            {error}
          </div>
        )}

        {/* Target Category or Overall */}
        <div>
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
            Budget Scope
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={!!editingBudget}
            className="w-full text-xs py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="overall">Overall Total Monthly Limit</option>
            <optgroup label="Category-Specific Budgets">
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Amount Input */}
        <div>
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
            Budget Amount ({settings.currencySymbol})
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">
              {settings.currencySymbol}
            </span>
            <input
              type="number"
              step="1"
              min="1"
              placeholder="e.g. 50000"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2.5 text-sm font-mono font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Alert Threshold Slider */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              Warning Alert Threshold
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {alertThreshold}%
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="95"
            step="5"
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <p className="text-[10px] text-zinc-400 mt-1">
            Receive a notification alert once you have reached {alertThreshold}% of this budget.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            {editingBudget ? 'Update Budget' : 'Save Budget'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
