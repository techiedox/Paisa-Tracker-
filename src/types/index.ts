export type TransactionType = 'expense' | 'income';

export type PaymentMethod =
  | 'upi'
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'net_banking'
  | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // Stored in MINOR units (e.g. paise: 100 = ₹1.00) to prevent floating point inaccuracies
  categoryId: string;
  date: string; // ISO string or YYYY-MM-DD
  note: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  synced?: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income' | 'both';
  icon: string;
  color: string;
  isDefault?: boolean;
}

export interface Budget {
  id: string;
  categoryId: string; // 'overall' or category id
  amount: number; // in minor units
  month: string; // YYYY-MM
  alertThreshold: number; // percentage, e.g. 80
}

export interface SavingsContribution {
  id: string;
  goalId: string;
  amount: number; // in minor units
  type: 'contribution' | 'withdrawal';
  date: string;
  note?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number; // minor units
  currentAmount: number; // minor units
  targetDate?: string; // YYYY-MM-DD
  color: string;
  icon: string;
  notes?: string;
  createdAt: string;
  contributions: SavingsContribution[];
}

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AED' | 'CAD' | 'AUD';
export type NumberFormatType = 'in' | 'western'; // e.g. 1,00,000 vs 100,000
export type DateFormatType = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserSettings {
  currency: CurrencyCode;
  currencySymbol: string;
  numberFormat: NumberFormatType;
  dateFormat: DateFormatType;
  theme: ThemeMode;
  notificationsEnabled: boolean;
  budgetAlerts: boolean;
  dailyReminder: boolean;
  dailyReminderTime: string;
  onboardingCompleted: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  lastSyncTime?: string;
  syncEnabled: boolean;
  viewMode: 'mobile' | 'responsive';
}

export interface CashFlowPeriodSummary {
  totalIncome: number; // minor units
  totalExpense: number; // minor units
  netCashFlow: number; // minor units (income - expense)
  totalBalance: number; // minor units (cumulative total of all time)
  transactionCount: number;
}
