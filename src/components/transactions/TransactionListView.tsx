import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Plus,
  Calendar,
  X,
  CreditCard,
  ChevronDown,
  FileSpreadsheet,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, PaymentMethod, TransactionType } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
} from '../../services/currencyFormatter';
import { exportTransactionsToCSV } from '../../services/exportService';

type SortOption = 'newest' | 'oldest' | 'amount_high' | 'amount_low';

export const TransactionListView: React.FC = () => {
  const {
    transactions,
    categories,
    settings,
    openTransactionModal,
    currentMonth,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [filterByMonth, setFilterByMonth] = useState<boolean>(true);

  // Filter & Search Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Month filter
      if (filterByMonth && !t.date.startsWith(currentMonth)) {
        return false;
      }

      // Type filter
      if (selectedType !== 'all' && t.type !== selectedType) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) {
        return false;
      }

      // Payment method filter
      if (selectedPayment !== 'all' && t.paymentMethod !== selectedPayment) {
        return false;
      }

      // Search query filter (note, amount, or category name)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const noteMatch = (t.note || '').toLowerCase().includes(query);
        const cat = categories.find((c) => c.id === t.categoryId);
        const catMatch = cat?.name.toLowerCase().includes(query);
        const amountMatch = (t.amount / 100).toString().includes(query);
        if (!noteMatch && !catMatch && !amountMatch) {
          return false;
        }
      }

      return true;
    });
  }, [
    transactions,
    filterByMonth,
    currentMonth,
    selectedType,
    selectedCategory,
    selectedPayment,
    searchQuery,
    categories,
  ]);

  // Sort Logic
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'amount_high') {
        return b.amount - a.amount;
      }
      if (sortBy === 'amount_low') {
        return a.amount - b.amount;
      }
      return 0;
    });
  }, [filteredTransactions, sortBy]);

  // Group by Day
  const dailyGroups = useMemo(() => {
    const groups: Record<string, { date: string; items: Transaction[]; dayTotal: number }> = {};

    sortedTransactions.forEach((tx) => {
      const dayKey = tx.date.split('T')[0];
      if (!groups[dayKey]) {
        groups[dayKey] = { date: dayKey, items: [], dayTotal: 0 };
      }
      groups[dayKey].items.push(tx);
      // Net for day
      if (tx.type === 'income') {
        groups[dayKey].dayTotal += tx.amount;
      } else {
        groups[dayKey].dayTotal -= tx.amount;
      }
    });

    return Object.values(groups);
  }, [sortedTransactions]);

  // Totals for filtered set
  const filteredSummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    sortedTransactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });
    return { income, expense, net: income - expense };
  }, [sortedTransactions]);

  const activeFiltersCount =
    (selectedType !== 'all' ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedPayment !== 'all' ? 1 : 0) +
    (!filterByMonth ? 1 : 0);

  const resetFilters = () => {
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedPayment('all');
    setFilterByMonth(true);
    setSearchQuery('');
    setSortBy('newest');
  };

  return (
    <div className="space-y-4 px-4 py-3 animate-fade-in pb-24">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Transactions
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {sortedTransactions.length} {sortedTransactions.length === 1 ? 'record' : 'records'} found
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* CSV Export Button */}
          <button
            onClick={() => exportTransactionsToCSV(sortedTransactions, categories, settings)}
            title="Export filtered records to CSV"
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Quick Add Button */}
          <button
            onClick={() => openTransactionModal(null, 'expense')}
            className="py-2 px-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs hover:scale-102"
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by note, category or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showFilters || activeFiltersCount > 0
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900'
                : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
            }`}
          >
            <Filter size={14} />
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-2 pl-3 pr-8 text-xs font-semibold cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="amount_high">Highest ₹</option>
              <option value="amount_low">Lowest ₹</option>
            </select>
            <ArrowUpDown
              size={12}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Collapsible Filters Drawer */}
        {showFilters && (
          <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Filter Criteria
              </span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-rose-500 hover:underline cursor-pointer font-medium"
                >
                  Reset All Filters
                </button>
              )}
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5">
              {(['all', 'expense', 'income'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`py-1 px-3 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                    selectedType === t
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {t === 'all' ? 'All Types' : t === 'expense' ? 'Expenses Only' : 'Income Only'}
                </button>
              ))}
            </div>

            {/* Scope Toggle: Selected Month vs All History */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterByMonth(!filterByMonth)}
                className={`text-xs py-1 px-2.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterByMonth
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-500'
                }`}
              >
                <Calendar size={12} />
                <span>{filterByMonth ? 'Month: Current' : 'Showing All Months'}</span>
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <span className="text-[10px] text-zinc-400 font-medium block mb-1">By Category:</span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`py-1 px-2 rounded-lg text-[11px] cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 font-bold'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`py-1 px-2 rounded-lg text-[11px] flex items-center gap-1 cursor-pointer ${
                      selectedCategory === c.id
                        ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 font-bold'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Filter */}
            <div>
              <span className="text-[10px] text-zinc-400 font-medium block mb-1">By Payment:</span>
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'upi', 'cash', 'credit_card', 'debit_card', 'net_banking', 'other'] as const).map(
                  (pm) => (
                    <button
                      key={pm}
                      onClick={() => setSelectedPayment(pm)}
                      className={`py-1 px-2 rounded-lg text-[11px] cursor-pointer uppercase ${
                        selectedPayment === pm
                          ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 font-bold'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {pm === 'all' ? 'All Methods' : pm.replace('_', ' ')}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filtered Subset Period Summary Banner */}
      <div className="p-3 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex gap-4">
          <div>
            <span className="text-zinc-400 text-[10px] block">In</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              +{formatCurrency(filteredSummary.income, settings.currency, settings.numberFormat)}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 text-[10px] block">Out</span>
            <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
              -{formatCurrency(filteredSummary.expense, settings.currency, settings.numberFormat)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-zinc-400 text-[10px] block">Net</span>
          <span
            className={`font-bold font-mono ${
              filteredSummary.net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(filteredSummary.net, settings.currency, settings.numberFormat)}
          </span>
        </div>
      </div>

      {/* Grouped Transaction List */}
      {transactions.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
            <Plus size={24} />
          </div>
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-1">
            No transactions yet
          </p>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto mb-4">
            Your expense ledger is clean. Tap below or use the floating (+) button to record your first entry.
          </p>
          <button
            onClick={() => openTransactionModal(null, 'expense')}
            className="py-2.5 px-5 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 cursor-pointer hover:scale-102 transition-all shadow-sm"
          >
            + Add First Transaction
          </button>
        </div>
      ) : dailyGroups.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800">
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            No matching transactions
          </p>
          <p className="text-xs text-zinc-400 mb-4">
            No records matched your search query or active filter criteria.
          </p>
          <button
            onClick={resetFilters}
            className="py-2 px-4 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {dailyGroups.map((group) => (
            <div
              key={group.date}
              className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-2xs"
            >
              {/* Daily Header */}
              <div className="px-4 py-2.5 bg-zinc-50/70 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800/70 flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {formatRelativeDate(group.date, settings.dateFormat)}
                </span>
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 font-semibold">
                  Net: {formatCurrency(group.dayTotal, settings.currency, settings.numberFormat)}
                </span>
              </div>

              {/* Transactions in this day */}
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 p-2">
                {group.items.map((tx) => {
                  const cat = categories.find((c) => c.id === tx.categoryId) || {
                    id: tx.categoryId,
                    name: 'Other',
                    icon: 'Tag',
                    color: '#6B7280',
                    type: 'expense' as const,
                  };
                  const isExpense = tx.type === 'expense';

                  return (
                    <div
                      key={tx.id}
                      onClick={() => openTransactionModal(tx)}
                      className="p-2.5 rounded-2xl flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer group"
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
                          {tx.note && (
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                              {tx.note}
                            </p>
                          )}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
