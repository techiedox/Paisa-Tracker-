import React from 'react';
import { ChevronRight, PlusCircle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatCurrency, formatRelativeDate } from '../../services/currencyFormatter';

export const RecentTransactionsList: React.FC = () => {
  const { transactions, categories, settings, setActiveTab, openTransactionModal } = useFinance();

  const recentList = transactions.slice(0, 5);

  const getCategory = (catId: string) => {
    return (
      categories.find((c) => c.id === catId) || {
        id: catId,
        name: 'General',
        icon: 'Tag',
        color: '#6B7280',
        type: 'expense' as const,
      }
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
          Recent Activity
        </span>
        <button
          onClick={() => setActiveTab('transactions')}
          className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center gap-0.5 cursor-pointer font-medium"
        >
          View All <ChevronRight size={14} />
        </button>
      </div>

      {recentList.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-xs text-zinc-400 mb-2">No transactions recorded yet.</p>
          <button
            onClick={() => openTransactionModal(null, 'expense')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            <PlusCircle size={14} /> Add your first transaction
          </button>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
          {recentList.map((tx) => {
            const cat = getCategory(tx.categoryId);
            const isExpense = tx.type === 'expense';

            return (
              <div
                key={tx.id}
                onClick={() => openTransactionModal(tx)}
                className="py-3 flex items-center justify-between hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 px-2 -mx-2 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: `${cat.color}18`, color: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} size={18} color={cat.color} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {cat.name}
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                        {tx.paymentMethod.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                      <span>{formatRelativeDate(tx.date, settings.dateFormat)}</span>
                      {tx.note && <span>• {tx.note}</span>}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <span
                    className={`text-xs font-bold font-mono ${
                      isExpense
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {isExpense ? '-' : '+'}
                    {formatCurrency(tx.amount, settings.currency, settings.numberFormat)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
