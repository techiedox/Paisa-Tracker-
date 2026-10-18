import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types';
import { Modal } from '../common/Modal';
import { toMinorUnits, fromMinorUnits } from '../../services/currencyFormatter';
import { ShieldCheck, Laptop, Plane, Home, Car, Heart, Smartphone } from 'lucide-react';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGoal: SavingsGoal | null;
}

const GOAL_ICONS = [
  { name: 'ShieldCheck', label: 'Safety Fund' },
  { name: 'Laptop', label: 'Gadget' },
  { name: 'Plane', label: 'Travel' },
  { name: 'Home', label: 'Real Estate' },
  { name: 'Car', label: 'Vehicle' },
  { name: 'Heart', label: 'Wedding / Life' },
];

const GOAL_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  onClose,
  editingGoal,
}) => {
  const { saveSavingsGoal, settings } = useFinance();
  const [name, setName] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [color, setColor] = useState('#10B981');
  const [icon, setIcon] = useState('ShieldCheck');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingGoal) {
      setName(editingGoal.name);
      setTargetAmountStr(fromMinorUnits(editingGoal.targetAmount).toString());
      setTargetDate(editingGoal.targetDate || '');
      setColor(editingGoal.color);
      setIcon(editingGoal.icon);
      setNotes(editingGoal.notes || '');
    } else {
      setName('');
      setTargetAmountStr('');
      setTargetDate('');
      setColor('#10B981');
      setIcon('ShieldCheck');
      setNotes('');
    }
    setError('');
  }, [editingGoal, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a goal title.');
      return;
    }

    const targetVal = parseFloat(targetAmountStr);
    if (isNaN(targetVal) || targetVal <= 0) {
      setError('Please enter a target amount greater than 0.');
      return;
    }

    saveSavingsGoal({
      id: editingGoal ? editingGoal.id : undefined,
      name: name.trim(),
      targetAmount: toMinorUnits(targetVal),
      currentAmount: editingGoal ? editingGoal.currentAmount : 0,
      targetDate: targetDate || undefined,
      color,
      icon,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
      subtitle="Define a target to build financial security"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-xs text-rose-600 dark:text-rose-400 border border-rose-200">
            {error}
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
            Goal Name
          </label>
          <input
            type="text"
            placeholder="e.g. Emergency Fund, New Car, Goa Vacation"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full text-xs py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
            Target Amount ({settings.currencySymbol})
          </label>
          <input
            type="number"
            step="1"
            min="1"
            placeholder="e.g. 100000"
            value={targetAmountStr}
            onChange={(e) => setTargetAmountStr(e.target.value)}
            required
            className="w-full text-xs py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
            Target Date (Optional)
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full text-xs py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Color Palette */}
        <div>
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
            Badge Color
          </label>
          <div className="flex gap-2">
            {GOAL_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-7 h-7 rounded-full cursor-pointer transition-transform ${
                  color === c ? 'ring-2 ring-offset-2 ring-zinc-900 scale-110' : 'opacity-80'
                }`}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
            Notes / Motivation
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Dedicated high-yield deposit account"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            {editingGoal ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
