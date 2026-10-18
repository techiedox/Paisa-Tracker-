import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Transaction,
  Category,
  Budget,
  SavingsGoal,
  UserSettings,
  CashFlowPeriodSummary,
  TransactionType,
  ThemeMode,
} from '../types';
import { storage } from '../db/storage';
import { getMonthString, formatCurrency } from '../services/currencyFormatter';
import { notificationService, AppNotification } from '../services/notificationService';

export interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  settings: UserSettings;
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
  monthSummary: CashFlowPeriodSummary;
  totalBalance: number;
  activeTab: 'dashboard' | 'transactions' | 'budgets' | 'analytics' | 'savings' | 'settings' | 'categories';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'budgets' | 'analytics' | 'savings' | 'settings' | 'categories') => void;
  
  // Transaction CRUD
  saveTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Transaction;
  deleteTransaction: (id: string) => void;
  
  // Category CRUD
  saveCategory: (category: Category) => void;
  deleteCategory: (id: string) => { success: boolean; error?: string };
  
  // Budget CRUD
  saveBudget: (budget: Omit<Budget, 'id'> & { id?: string }) => void;
  deleteBudget: (id: string) => void;
  
  // Savings Goal CRUD
  saveSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'contributions'> & { id?: string }) => void;
  deleteSavingsGoal: (id: string) => void;
  recordSavingsActivity: (goalId: string, amount: number, type: 'contribution' | 'withdrawal', date: string, note?: string) => void;
  
  // Settings & Theme
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  isDarkMode: boolean;
  toggleTheme: (mode: ThemeMode) => void;
  
  // Modal states for Quick Add
  isTransactionModalOpen: boolean;
  editingTransaction: Transaction | null;
  transactionModalDefaultType: TransactionType;
  openTransactionModal: (tx?: Transaction | null, defaultType?: TransactionType) => void;
  closeTransactionModal: () => void;
  
  // Notifications
  notifications: AppNotification[];
  clearNotifications: () => void;
  
  // Data reset/refresh
  refreshData: () => void;
  resetToDemo: () => void;
  loadSampleData: () => void;
  clearAllData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => storage.getSettings());
  const [transactions, setTransactions] = useState<Transaction[]>(() => storage.getTransactions());
  const [categories, setCategories] = useState<Category[]>(() => storage.getCategories());
  const [budgets, setBudgets] = useState<Budget[]>(() => storage.getBudgets());
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => storage.getSavingsGoals());
  const [currentMonth, setCurrentMonth] = useState<string>(() => getMonthString());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'budgets' | 'analytics' | 'savings' | 'settings' | 'categories'>('dashboard');
  
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionModalDefaultType, setTransactionModalDefaultType] = useState<TransactionType>('expense');
  
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // System Dark Mode Listener
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Compute active dark mode state
  const isDarkMode = useMemo(() => {
    if (settings.theme === 'dark') return true;
    if (settings.theme === 'light') return false;
    return systemIsDark;
  }, [settings.theme, systemIsDark]);

  // Synchronize with documentElement and body classes
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Subscribe to notification service
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((list) => {
      setNotifications([...list]);
    });
    return unsubscribe;
  }, []);

  const refreshData = useCallback(() => {
    setTransactions(storage.getTransactions());
    setCategories(storage.getCategories());
    setBudgets(storage.getBudgets());
    setSavingsGoals(storage.getSavingsGoals());
    setSettings(storage.getSettings());
  }, []);

  // Budget alert evaluation
  const checkBudgetThresholds = useCallback((updatedTxList: Transaction[], updatedBudgets: Budget[]) => {
    if (!settings.budgetAlerts) return;
    const month = currentMonth;
    const currentMonthExpenses = updatedTxList
      .filter((t) => t.type === 'expense' && t.date.startsWith(month));

    const totalExpense = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);

    const activeBudgets = updatedBudgets.filter((b) => b.month === month);
    const overallBudget = activeBudgets.find((b) => b.categoryId === 'overall');

    if (overallBudget && overallBudget.amount > 0) {
      const percentage = (totalExpense / overallBudget.amount) * 100;
      if (percentage >= 100) {
        notificationService.notify(
          'Monthly Budget Exceeded',
          `You have spent ${formatCurrency(totalExpense, settings.currency, settings.numberFormat)}, exceeding your budget of ${formatCurrency(overallBudget.amount, settings.currency, settings.numberFormat)}.`,
          'alert'
        );
      } else if (percentage >= overallBudget.alertThreshold) {
        notificationService.notify(
          'Budget Warning Threshold',
          `You've used ${percentage.toFixed(0)}% of your monthly budget (${formatCurrency(totalExpense, settings.currency, settings.numberFormat)} / ${formatCurrency(overallBudget.amount, settings.currency, settings.numberFormat)}).`,
          'warning'
        );
      }
    }
  }, [currentMonth, settings]);

  // Actions
  const saveTransaction = useCallback((txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const saved = storage.saveTransaction(txData);
    const updated = storage.getTransactions();
    setTransactions(updated);
    checkBudgetThresholds(updated, budgets);
    return saved;
  }, [budgets, checkBudgetThresholds]);

  const deleteTransaction = useCallback((id: string) => {
    storage.deleteTransaction(id);
    setTransactions(storage.getTransactions());
  }, []);

  const saveCategory = useCallback((category: Category) => {
    const updated = storage.saveCategory(category);
    setCategories(updated);
  }, []);

  const deleteCategory = useCallback((id: string) => {
    const res = storage.deleteCategory(id);
    if (res.success) {
      setCategories(storage.getCategories());
    }
    return res;
  }, []);

  const saveBudget = useCallback((budget: Omit<Budget, 'id'> & { id?: string }) => {
    storage.saveBudget(budget);
    const updated = storage.getBudgets();
    setBudgets(updated);
    checkBudgetThresholds(transactions, updated);
  }, [transactions, checkBudgetThresholds]);

  const deleteBudget = useCallback((id: string) => {
    storage.deleteBudget(id);
    setBudgets(storage.getBudgets());
  }, []);

  const saveSavingsGoal = useCallback((goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'contributions'> & { id?: string }) => {
    storage.saveSavingsGoal(goal);
    setSavingsGoals(storage.getSavingsGoals());
  }, []);

  const deleteSavingsGoal = useCallback((id: string) => {
    storage.deleteSavingsGoal(id);
    setSavingsGoals(storage.getSavingsGoals());
  }, []);

  const recordSavingsActivity = useCallback((
    goalId: string,
    amount: number,
    type: 'contribution' | 'withdrawal',
    date: string,
    note?: string
  ) => {
    storage.recordSavingsActivity(goalId, amount, type, date, note);
    setSavingsGoals(storage.getSavingsGoals());
  }, []);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    const updated = storage.saveSettings(newSettings);
    setSettings(updated);
  }, []);

  const toggleTheme = useCallback((mode: ThemeMode) => {
    updateSettings({ theme: mode });
  }, [updateSettings]);

  const openTransactionModal = useCallback((tx?: Transaction | null, defaultType?: TransactionType) => {
    setEditingTransaction(tx || null);
    if (defaultType) {
      setTransactionModalDefaultType(defaultType);
    } else if (tx) {
      setTransactionModalDefaultType(tx.type);
    } else {
      setTransactionModalDefaultType('expense');
    }
    setIsTransactionModalOpen(true);
  }, []);

  const closeTransactionModal = useCallback(() => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  }, []);

  const clearNotifications = useCallback(() => {
    notificationService.clearAll();
  }, []);

  const resetToDemo = useCallback(() => {
    storage.loadSampleData();
    refreshData();
  }, [refreshData]);

  const loadSampleData = useCallback(() => {
    storage.loadSampleData();
    refreshData();
  }, [refreshData]);

  const clearAllData = useCallback(() => {
    storage.clearAllData();
    refreshData();
  }, [refreshData]);

  // Derived summaries
  const monthSummary = useMemo(() => {
    return storage.calculateMonthSummary(currentMonth, transactions);
  }, [currentMonth, transactions]);

  const totalBalance = useMemo(() => {
    return storage.calculateTotalBalance(transactions);
  }, [transactions]);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        budgets,
        savingsGoals,
        settings,
        currentMonth,
        setCurrentMonth,
        monthSummary,
        totalBalance,
        activeTab,
        setActiveTab,
        saveTransaction,
        deleteTransaction,
        saveCategory,
        deleteCategory,
        saveBudget,
        deleteBudget,
        saveSavingsGoal,
        deleteSavingsGoal,
        recordSavingsActivity,
        updateSettings,
        isDarkMode,
        toggleTheme,
        isTransactionModalOpen,
        editingTransaction,
        transactionModalDefaultType,
        openTransactionModal,
        closeTransactionModal,
        notifications,
        clearNotifications,
        refreshData,
        resetToDemo,
        loadSampleData,
        clearAllData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
