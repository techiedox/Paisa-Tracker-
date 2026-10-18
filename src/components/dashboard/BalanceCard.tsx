import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Plus, Eye, EyeOff } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/currencyFormatter';

export const BalanceCard: React.FC = () => {
  const { totalBalance, monthSummary, settings, openTransactionModal } = useFinance();
  const [hideAmount, setHideAmount] = React.useState(false);

  const netCashFlow = monthSummary.netCashFlow;
  const isPositiveCashFlow = netCashFlow >= 0;

  return (
    <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 dark:from-zinc-900 dark:to-black text-white p-5 rounded-3xl shadow-xl shadow-zinc-900/10 border border-zinc-800 relative overflow-hidden">
      {/* Background ambient subtle glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with privacy toggle */}
      <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
        <span className="font-medium tracking-wide uppercase text-[11px] text-zinc-400">
          Total Net Worth / Balance
        </span>
        <button
          onClick={() => setHideAmount(!hideAmount)}
          className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1"
          title={hideAmount ? 'Show Balance' : 'Hide Balance'}
        >
          {hideAmount ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>

      {/* Main Total Balance */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
          {hideAmount
            ? '••••••••'
            : formatCurrency(totalBalance, settings.currency, settings.numberFormat)}
        </span>
      </div>

      {/* Monthly Cash Flow Chip (Distinguished from Balance) */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-xs mb-5">
        <span className="text-zinc-400 text-[11px]">Month Net Flow:</span>
        <span
          className={`font-semibold flex items-center ${
            isPositiveCashFlow ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {isPositiveCashFlow ? '+' : ''}
          {hideAmount
            ? '••••'
            : formatCurrency(netCashFlow, settings.currency, settings.numberFormat)}
        </span>
      </div>

      {/* Quick Actions (Add Expense & Add Income) */}
      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-zinc-800/90">
        <button
          onClick={() => openTransactionModal(null, 'expense')}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-zinc-800/90 hover:bg-zinc-700/90 text-white text-xs font-semibold border border-zinc-700/50 hover:border-zinc-600 transition-all cursor-pointer active:scale-98"
        >
          <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <ArrowUpRight size={13} strokeWidth={2.5} />
          </div>
          <span>Add Expense</span>
        </button>

        <button
          onClick={() => openTransactionModal(null, 'income')}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-zinc-800/90 hover:bg-zinc-700/90 text-white text-xs font-semibold border border-zinc-700/50 hover:border-zinc-600 transition-all cursor-pointer active:scale-98"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ArrowDownLeft size={13} strokeWidth={2.5} />
          </div>
          <span>Add Income</span>
        </button>
      </div>
    </div>
  );
};
