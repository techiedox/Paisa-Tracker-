import React, { useState } from 'react';
import {
  Plus,
  Target,
  Edit2,
  Trash2,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types';
import { SavingsGoalModal } from './SavingsGoalModal';
import { ContributionModal } from './ContributionModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatCurrency, formatDate } from '../../services/currencyFormatter';

export const SavingsGoalsView: React.FC = () => {
  const { savingsGoals, settings, deleteSavingsGoal } = useFinance();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);
  const [activeGoalForActivity, setActiveGoalForActivity] = useState<SavingsGoal | null>(null);
  const [expandedHistoryGoalId, setExpandedHistoryGoalId] = useState<string | null>(null);

  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);

  const handleEdit = (g: SavingsGoal) => {
    setEditingGoal(g);
    setIsGoalModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingGoalId) {
      deleteSavingsGoal(deletingGoalId);
      setDeletingGoalId(null);
    }
  };

  return (
    <div className="space-y-4 px-4 py-3 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Savings Goals
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Dedicated reserves & long-term targets
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGoal(null);
            setIsGoalModalOpen(true);
          }}
          className="py-2 px-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs hover:scale-102"
        >
          <Plus size={14} />
          <span>New Goal</span>
        </button>
      </div>

      {/* Overview Metric Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-3xl shadow-lg shadow-emerald-950/20">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100">
            Total Accumulated Savings
          </span>
          <Target size={16} className="text-emerald-200" />
        </div>
        <div className="text-2xl font-black font-mono">
          {formatCurrency(totalSaved, settings.currency, settings.numberFormat)}
        </div>
        <div className="text-xs text-emerald-100/90 mt-1 flex justify-between">
          <span>Target Aggregate: {formatCurrency(totalTarget, settings.currency, settings.numberFormat)}</span>
          <span>{totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0}% Reached</span>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        {savingsGoals.length === 0 ? (
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
            <Target size={28} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              No Savings Goals Yet
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Set goals for an emergency fund, travel, or vehicle to stay motivated.
            </p>
            <button
              onClick={() => {
                setEditingGoal(null);
                setIsGoalModalOpen(true);
              }}
              className="py-2 px-4 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 cursor-pointer"
            >
              + Create First Goal
            </button>
          </div>
        ) : (
          savingsGoals.map((g) => {
            const percent = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);
            const isCompleted = g.currentAmount >= g.targetAmount;
            const isHistoryOpen = expandedHistoryGoalId === g.id;

            return (
              <div
                key={g.id}
                className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: g.color }}
                    >
                      <Target size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {g.name}
                        </h4>
                        {isCompleted && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center gap-0.5">
                            <Sparkles size={10} /> Completed!
                          </span>
                        )}
                      </div>
                      {g.targetDate && (
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 mt-0.5">
                          <Calendar size={11} />
                          <span>Target: {formatDate(g.targetDate, settings.dateFormat)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(g)}
                      className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => setDeletingGoalId(g.id)}
                      className="p-1 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%`, backgroundColor: g.color }}
                  />
                </div>

                {/* Numbers */}
                <div className="flex justify-between items-baseline text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-sans block">Saved</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(g.currentAmount, settings.currency, settings.numberFormat)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 font-sans block">Target</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(g.targetAmount, settings.currency, settings.numberFormat)} ({percent}%)
                    </span>
                  </div>
                </div>

                {/* Action Row */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() =>
                      setExpandedHistoryGoalId(isHistoryOpen ? null : g.id)
                    }
                    className="text-[11px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <span>{g.contributions?.length || 0} entries</span>
                    {isHistoryOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  <button
                    onClick={() => setActiveGoalForActivity(g)}
                    className="py-1.5 px-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>Deposit / Withdraw</span>
                  </button>
                </div>

                {/* History Drawer */}
                {isHistoryOpen && (
                  <div className="pt-2 space-y-1.5 border-t border-dashed border-zinc-100 dark:border-zinc-800 animate-fade-in">
                    {(!g.contributions || g.contributions.length === 0) ? (
                      <p className="text-[11px] text-zinc-400 italic py-1">No transaction history for this goal.</p>
                    ) : (
                      g.contributions.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50"
                        >
                          <div className="flex items-center gap-1.5">
                            {c.type === 'contribution' ? (
                              <ArrowDownLeft size={13} className="text-emerald-500" />
                            ) : (
                              <ArrowUpRight size={13} className="text-amber-500" />
                            )}
                            <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                              {formatDate(c.date, settings.dateFormat)}
                            </span>
                            {c.note && (
                              <span className="text-zinc-400 truncate max-w-[120px]">
                                • {c.note}
                              </span>
                            )}
                          </div>
                          <span
                            className={`font-mono font-bold ${
                              c.type === 'contribution' ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            {c.type === 'contribution' ? '+' : '-'}
                            {formatCurrency(c.amount, settings.currency, settings.numberFormat)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        editingGoal={editingGoal}
      />

      <ContributionModal
        isOpen={!!activeGoalForActivity}
        onClose={() => setActiveGoalForActivity(null)}
        goal={activeGoalForActivity}
      />

      <ConfirmDialog
        isOpen={!!deletingGoalId}
        onClose={() => setDeletingGoalId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Savings Goal"
        message="Are you sure you want to delete this savings goal? Its contribution history will also be removed."
      />
    </div>
  );
};
