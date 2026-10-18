import React from 'react';
import { MonthSelector } from './MonthSelector';
import { BalanceCard } from './BalanceCard';
import { CashFlowSummary } from './CashFlowSummary';
import { BudgetOverviewBar } from './BudgetOverviewBar';
import { QuickCategoryBreakdown } from './QuickCategoryBreakdown';
import { RecentTransactionsList } from './RecentTransactionsList';

export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-4 px-4 py-3 animate-fade-in pb-24">
      {/* Month Navigator */}
      <MonthSelector />

      {/* Main Balance Card */}
      <BalanceCard />

      {/* Monthly Cash Flow Ratio (Income vs Expenses) */}
      <CashFlowSummary />

      {/* Monthly Budget Tracker Bar */}
      <BudgetOverviewBar />

      {/* Top Spending Categories Breakdown */}
      <QuickCategoryBreakdown />

      {/* Recent Activity List */}
      <RecentTransactionsList />
    </div>
  );
};
