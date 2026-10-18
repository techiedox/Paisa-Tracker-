import React, { useState, useMemo } from 'react';
import {
  Download,
  Printer,
  TrendingDown,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  formatCurrency,
  getMonthDisplayName,
} from '../../services/currencyFormatter';
import { exportTransactionsToCSV, printMonthlyStatement } from '../../services/exportService';

type TimeHorizon = 'month' | 'quarter' | 'year';

export const AnalyticsCharts: React.FC = () => {
  const { transactions, categories, currentMonth, settings, monthSummary } = useFinance();
  const [horizon, setHorizon] = useState<TimeHorizon>('month');

  // Filter transactions for current month
  const currentMonthTx = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(currentMonth));
  }, [transactions, currentMonth]);

  // Previous month transactions for period-over-period comparison
  const prevMonthTx = useMemo(() => {
    const [year, month] = currentMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    return transactions.filter((t) => t.date.startsWith(prevMonthStr));
  }, [transactions, currentMonth]);

  // Category Expense Breakdown
  const categoryBreakdown = useMemo(() => {
    const expenseTx = currentMonthTx.filter((t) => t.type === 'expense');
    const totalExp = expenseTx.reduce((sum, t) => sum + t.amount, 0);

    const map = new Map<string, number>();
    expenseTx.forEach((t) => {
      map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
    });

    return Array.from(map.entries())
      .map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId) || {
          id: catId,
          name: 'Other',
          icon: 'Tag',
          color: '#9CA3AF',
          type: 'expense' as const,
        };
        const percentage = totalExp > 0 ? (amount / totalExp) * 100 : 0;
        return { cat, amount, percentage };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [currentMonthTx, categories]);

  // Period-over-period calculations
  const comparison = useMemo(() => {
    const curExp = currentMonthTx
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const prevExp = prevMonthTx
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    let expDiffPct = 0;
    if (prevExp > 0) {
      expDiffPct = ((curExp - prevExp) / prevExp) * 100;
    }

    const curInc = currentMonthTx
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const prevInc = prevMonthTx
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    let incDiffPct = 0;
    if (prevInc > 0) {
      incDiffPct = ((curInc - prevInc) / prevInc) * 100;
    }

    return { curExp, prevExp, expDiffPct, curInc, prevInc, incDiffPct };
  }, [currentMonthTx, prevMonthTx]);

  // Historical 6-Month Comparison Data
  const historicalMonths = useMemo(() => {
    const list: { monthStr: string; label: string; income: number; expense: number }[] = [];
    const [curYear, curMonth] = currentMonth.split('-').map(Number);

    for (let i = 5; i >= 0; i--) {
      const d = new Date(curYear, curMonth - 1 - i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const shortName = d.toLocaleString('default', { month: 'short' });

      const txs = transactions.filter((t) => t.date.startsWith(mStr));
      let inc = 0;
      let exp = 0;
      txs.forEach((t) => {
        if (t.type === 'income') inc += t.amount;
        else exp += t.amount;
      });

      list.push({ monthStr: mStr, label: shortName, income: inc, expense: exp });
    }
    return list;
  }, [transactions, currentMonth]);

  // Maximum value for SVG scaling
  const maxVolume = useMemo(() => {
    const maxVal = Math.max(
      ...historicalMonths.map((m) => Math.max(m.income, m.expense)),
      1
    );
    return maxVal;
  }, [historicalMonths]);

  // SVG Donut calculation
  const donutSlices = useMemo(() => {
    let cumulativeAngle = 0;
    return categoryBreakdown.map((item) => {
      const angle = (item.percentage / 100) * 360;
      const startAngle = cumulativeAngle;
      cumulativeAngle += angle;
      return {
        ...item,
        startAngle,
        angle,
      };
    });
  }, [categoryBreakdown]);

  return (
    <div className="space-y-4 px-4 py-3 animate-fade-in pb-24">
      {/* Header & Export Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Analytics & Reports
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Insights for {getMonthDisplayName(currentMonth)}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() =>
              printMonthlyStatement(
                getMonthDisplayName(currentMonth),
                currentMonthTx,
                categories,
                settings,
                monthSummary
              )
            }
            title="Generate printable PDF statement"
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
          >
            <Printer size={14} />
            <span className="hidden sm:inline">Statement</span>
          </button>

          <button
            onClick={() => exportTransactionsToCSV(currentMonthTx, categories, settings)}
            title="Download CSV report"
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
          >
            <Download size={14} />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Period-Over-Period Comparison Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Spending Comparison */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
            vs Previous Month
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {formatCurrency(comparison.curExp, settings.currency, settings.numberFormat)}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1.5 text-xs font-semibold">
            {comparison.curExp === 0 && comparison.prevExp === 0 ? (
              <span className="text-zinc-400">No records yet</span>
            ) : comparison.expDiffPct > 0 ? (
              <span className="text-rose-500 flex items-center gap-0.5">
                <TrendingUp size={13} /> +{comparison.expDiffPct.toFixed(1)}% higher
              </span>
            ) : comparison.expDiffPct < 0 ? (
              <span className="text-emerald-500 flex items-center gap-0.5">
                <TrendingDown size={13} /> {Math.abs(comparison.expDiffPct).toFixed(1)}% saved
              </span>
            ) : (
              <span className="text-zinc-400">Equal to last month</span>
            )}
          </div>
        </div>

        {/* Income Comparison */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
            Income Growth
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {formatCurrency(comparison.curInc, settings.currency, settings.numberFormat)}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1.5 text-xs font-semibold">
            {comparison.curInc === 0 && comparison.prevInc === 0 ? (
              <span className="text-zinc-400">No records yet</span>
            ) : comparison.incDiffPct >= 0 ? (
              <span className="text-emerald-500 flex items-center gap-0.5">
                <TrendingUp size={13} /> +{comparison.incDiffPct.toFixed(1)}% growth
              </span>
            ) : (
              <span className="text-amber-500 flex items-center gap-0.5">
                <TrendingDown size={13} /> {Math.abs(comparison.incDiffPct).toFixed(1)}% decline
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 6-Month Income vs Expense Bar Chart */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
              Income vs Expenses (6-Month Trend)
            </h3>
            <span className="text-[10px] text-zinc-400">Visual cash flow comparison</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-semibold">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Income
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Expense
            </span>
          </div>
        </div>

        {/* Responsive Bar Graphic */}
        <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2">
          {historicalMonths.map((m) => {
            const incHeightPct = Math.max(4, (m.income / maxVolume) * 100);
            const expHeightPct = Math.max(4, (m.expense / maxVolume) * 100);
            const isSelected = m.monthStr === currentMonth;

            return (
              <div
                key={m.monthStr}
                className={`flex-1 flex flex-col items-center h-full justify-end group cursor-pointer ${
                  isSelected ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                }`}
              >
                <div className="w-full flex items-end justify-center gap-1 h-32">
                  {/* Income bar */}
                  <div
                    className="w-1/2 max-w-[14px] bg-emerald-500 rounded-t-md transition-all duration-300 group-hover:brightness-110"
                    style={{ height: `${incHeightPct}%` }}
                    title={`Income: ${formatCurrency(m.income, settings.currency, settings.numberFormat)}`}
                  />
                  {/* Expense bar */}
                  <div
                    className="w-1/2 max-w-[14px] bg-rose-500 rounded-t-md transition-all duration-300 group-hover:brightness-110"
                    style={{ height: `${expHeightPct}%` }}
                    title={`Expense: ${formatCurrency(m.expense, settings.currency, settings.numberFormat)}`}
                  />
                </div>
                <span
                  className={`text-[10px] mt-2 font-semibold ${
                    isSelected
                      ? 'text-zinc-900 dark:text-zinc-100 font-bold underline'
                      : 'text-zinc-400'
                  }`}
                >
                  {m.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown (Donut + Legend) */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
        <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide mb-3">
          Expense Breakdown by Category
        </h3>

        {categoryBreakdown.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400">
            No expense records in this period to display.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Donut representation */}
            <div className="flex items-center justify-center py-2">
              <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
                <circle
                  cx="90"
                  cy="90"
                  r="65"
                  fill="transparent"
                  stroke="currentColor"
                  className="text-zinc-100 dark:text-zinc-800"
                  strokeWidth="24"
                />
                {(() => {
                  let accumulated = 0;
                  const circumference = 2 * Math.PI * 65; // ~408.4

                  return categoryBreakdown.map((item) => {
                    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -((accumulated / 100) * circumference);
                    accumulated += item.percentage;

                    return (
                      <circle
                        key={item.cat.id}
                        cx="90"
                        cy="90"
                        r="65"
                        fill="transparent"
                        stroke={item.cat.color}
                        strokeWidth="24"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-500 hover:opacity-90"
                      />
                    );
                  });
                })()}
              </svg>
            </div>

            {/* Detailed Ranked Category List */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {categoryBreakdown.map(({ cat, amount, percentage }) => (
                <div key={cat.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} size={15} color={cat.color} />
                    </div>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {cat.name}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono block">
                      {formatCurrency(amount, settings.currency, settings.numberFormat)}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {percentage.toFixed(1)}% of total
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
