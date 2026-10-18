import { Category, Transaction, Budget, SavingsGoal, UserSettings } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: '#F97316', isDefault: true },
  { id: 'cat-groceries', name: 'Groceries', type: 'expense', icon: 'ShoppingCart', color: '#10B981', isDefault: true },
  { id: 'cat-transport', name: 'Transport & Fuel', type: 'expense', icon: 'Car', color: '#0EA5E9', isDefault: true },
  { id: 'cat-shopping', name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#EC4899', isDefault: true },
  { id: 'cat-bills', name: 'Bills & Utilities', type: 'expense', icon: 'Receipt', color: '#EAB308', isDefault: true },
  { id: 'cat-health', name: 'Healthcare', type: 'expense', icon: 'HeartPulse', color: '#EF4444', isDefault: true },
  { id: 'cat-education', name: 'Education', type: 'expense', icon: 'GraduationCap', color: '#8B5CF6', isDefault: true },
  { id: 'cat-entertainment', name: 'Entertainment', type: 'expense', icon: 'Film', color: '#6366F1', isDefault: true },
  { id: 'cat-rent', name: 'Rent & Housing', type: 'expense', icon: 'Home', color: '#14B8A6', isDefault: true },
  { id: 'cat-travel', name: 'Travel & Vacations', type: 'expense', icon: 'Plane', color: '#06B6D4', isDefault: true },
  { id: 'cat-salary', name: 'Salary', type: 'income', icon: 'Briefcase', color: '#10B981', isDefault: true },
  { id: 'cat-freelance', name: 'Freelance & Consulting', type: 'income', icon: 'Laptop', color: '#3B82F6', isDefault: true },
  { id: 'cat-investments', name: 'Investments & Returns', type: 'income', icon: 'TrendingUp', color: '#84CC16', isDefault: true },
  { id: 'cat-other-income', name: 'Other Income', type: 'income', icon: 'ArrowDownLeft', color: '#22C55E', isDefault: true },
  { id: 'cat-other-expense', name: 'Other Expense', type: 'expense', icon: 'ArrowUpRight', color: '#6B7280', isDefault: true },
];

export const DEFAULT_SETTINGS: UserSettings = {
  currency: 'INR',
  currencySymbol: '₹',
  numberFormat: 'in',
  dateFormat: 'DD/MM/YYYY',
  theme: 'light',
  notificationsEnabled: true,
  budgetAlerts: true,
  dailyReminder: true,
  dailyReminderTime: '20:30',
  onboardingCompleted: true,
  syncEnabled: false,
  viewMode: 'mobile',
};

/**
 * Returns clean empty slate with NO dummy transactions or budgets.
 * User starts completely fresh.
 */
export function getInitialSeedData(): {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
} {
  return {
    transactions: [],
    budgets: [],
    savingsGoals: [],
  };
}

/**
 * Optional sample data generator for testing purposes (accessible from Settings)
 */
export function getSampleDemoData(): {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
} {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const currentMonthStr = `${year}-${month}`;

  const createDate = (day: number) => {
    const d = String(day).padStart(2, '0');
    return `${year}-${month}-${d}`;
  };

  const transactions: Transaction[] = [
    {
      id: 'tx-demo-1',
      type: 'income',
      amount: 7500000, // ₹75,000.00
      categoryId: 'cat-salary',
      date: createDate(1),
      note: 'Monthly Salary Credit',
      paymentMethod: 'net_banking',
      createdAt: new Date(year, now.getMonth(), 1, 10, 0).toISOString(),
      updatedAt: new Date(year, now.getMonth(), 1, 10, 0).toISOString(),
    },
    {
      id: 'tx-demo-2',
      type: 'expense',
      amount: 1800000, // ₹18,000.00
      categoryId: 'cat-rent',
      date: createDate(2),
      note: 'House Rent',
      paymentMethod: 'upi',
      createdAt: new Date(year, now.getMonth(), 2, 11, 30).toISOString(),
      updatedAt: new Date(year, now.getMonth(), 2, 11, 30).toISOString(),
    },
    {
      id: 'tx-demo-3',
      type: 'expense',
      amount: 350000, // ₹3,500.00
      categoryId: 'cat-groceries',
      date: createDate(4),
      note: 'Supermarket weekly grocery',
      paymentMethod: 'upi',
      createdAt: new Date(year, now.getMonth(), 4, 18, 20).toISOString(),
      updatedAt: new Date(year, now.getMonth(), 4, 18, 20).toISOString(),
    },
    {
      id: 'tx-demo-4',
      type: 'expense',
      amount: 120000, // ₹1,200.00
      categoryId: 'cat-bills',
      date: createDate(5),
      note: 'Electricity & Internet',
      paymentMethod: 'credit_card',
      createdAt: new Date(year, now.getMonth(), 5, 9, 15).toISOString(),
      updatedAt: new Date(year, now.getMonth(), 5, 9, 15).toISOString(),
    },
    {
      id: 'tx-demo-5',
      type: 'expense',
      amount: 85000, // ₹850.00
      categoryId: 'cat-food',
      date: createDate(8),
      note: 'Lunch at cafe',
      paymentMethod: 'cash',
      createdAt: new Date(year, now.getMonth(), 8, 13, 10).toISOString(),
      updatedAt: new Date(year, now.getMonth(), 8, 13, 10).toISOString(),
    },
  ];

  const budgets: Budget[] = [
    {
      id: 'b-overall-demo',
      categoryId: 'overall',
      amount: 4000000, // ₹40,000 limit
      month: currentMonthStr,
      alertThreshold: 80,
    },
  ];

  return { transactions, budgets, savingsGoals: [] };
}
