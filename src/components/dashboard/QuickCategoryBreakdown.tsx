import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatCurrency } from '../../services/currencyFormatter';

export const QuickCategoryBreakdown: React.FC = () => {
  const { transactions, categories, currentMonth, monthSummary, settings, setActiveTab } = useFinance();

  const currentExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(currentMonth)
  );

  // Group by category
  const categoryTotals = new Map<string, number>();
  for (const t of currentExpenses) {
    categoryTotals.set(t.categoryId, (categoryTotals.get(t.categoryId) || 0) + t.amount);
  }

  // Sort descending
  const sortedCategories = Array.from(categoryTotals.entries())
    .map(([categoryId, total]) => {
      const category = categories.find((c) => c.id === categoryId) || {
        id: categoryId,
        name: 'Other',
        icon: 'Tag',
        color: '#6B7280',
        type: 'expense' as const,
      };
      const percentage =
        monthSummary.totalExpense > 0 ? (total / monthSummary.totalExpense) * 100 : 0;
      return { category, total, percentage };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  if (sortedCategories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
          Top Spending Categories
        </span>
        <button
          onClick={() => setActiveTab('analytics')}
          className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center gap-0.5 cursor-pointer font-medium"
        >
          Insights <ChevronRight size={14} />
        </button>
      </div>

      <div className="space-y-3">
        {sortedCategories.map(({ category, total, percentage }) => (
          <div key={category.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${category.color}20`, color: category.color }}
                >
                  <CategoryIcon name={category.icon} size={13} color={category.color} />
                </div>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  {category.name}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(total, settings.currency, settings.numberFormat)}
                </span>
                <span className="text-[11px] text-zinc-400 font-medium w-8 text-right">
                  {percentage.toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: category.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
