import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types';
import { Modal } from '../common/Modal';
import { toMinorUnits } from '../../services/currencyFormatter';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export const ContributionModal: React.FC<ContributionModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  const { recordSavingsActivity, settings } = useFinance();
  const [type, setType] = useState<'contribution' | 'withdrawal'>('contribution');
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  if (!goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountStr);
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    if (type === 'withdrawal' && toMinorUnits(val) > goal.currentAmount) {
      setError('Withdrawal amount cannot exceed current saved balance.');
      return;
    }

    recordSavingsActivity(goal.id, toMinorUnits(val), type, date, note.trim());
    setAmountStr('');
    setNote('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === 'contribution' ? `Contribute to ${goal.name}` : `Withdraw from ${goal.name}`}
      subtitle="Dedicated savings ledger"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-xs text-rose-600 dark:text-rose-400 border border-rose-200">
            {error}
          </div>
        )}

        {/* Type toggle */}
        <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setType('contribution');
              setError('');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              type === 'contribution'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <ArrowDownLeft size={14} /> Deposit / Save
          </button>
          <button
            type="button"
            onClick={() => {
              setType('withdrawal');
              setError('');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              type === 'withdrawal'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <ArrowUpRight size={14} /> Withdraw
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
            Amount ({settings.currencySymbol})
          </label>
          <input
            type="number"
            step="1"
            min="1"
            placeholder="e.g. 5000"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            required
            autoFocus
            className="w-full text-sm py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Date */}
        <div>
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full text-xs py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Note */}
        <div>
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
            Note (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Monthly allocation from salary"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full text-xs py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Record {type === 'contribution' ? 'Contribution' : 'Withdrawal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
