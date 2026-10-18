/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { DeviceFrameWrapper } from './components/layout/DeviceFrameWrapper';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionListView } from './components/transactions/TransactionListView';
import { BudgetView } from './components/budgets/BudgetView';
import { AnalyticsCharts } from './components/analytics/AnalyticsCharts';
import { SavingsGoalsView } from './components/savings/SavingsGoalsView';
import { SettingsView } from './components/settings/SettingsView';
import { CategoryManagementView } from './components/categories/CategoryManagementView';
import { TransactionFormModal } from './components/transactions/TransactionFormModal';
import { WelcomeOnboardingModal } from './components/onboarding/WelcomeOnboardingModal';

const AppContent: React.FC = () => {
  const { activeTab } = useFinance();

  return (
    <DeviceFrameWrapper>
      <AppHeader />
      
      <main className="flex-1 w-full max-w-4xl mx-auto">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'transactions' && <TransactionListView />}
        {activeTab === 'budgets' && <BudgetView />}
        {activeTab === 'analytics' && <AnalyticsCharts />}
        {activeTab === 'savings' && <SavingsGoalsView />}
        {activeTab === 'settings' && <SettingsView />}
        {activeTab === 'categories' && <CategoryManagementView />}
      </main>

      <BottomNav />
      <TransactionFormModal />
      <WelcomeOnboardingModal />
    </DeviceFrameWrapper>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
