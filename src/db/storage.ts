import {
  Transaction,
  Category,
  Budget,
  SavingsGoal,
  SavingsContribution,
  UserSettings,
  CashFlowPeriodSummary,
} from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS, getInitialSeedData, getSampleDemoData } from './seedData';

const STORAGE_KEYS = {
  TRANSACTIONS: 'paisatrack_transactions_v2',
  CATEGORIES: 'paisatrack_categories_v2',
  BUDGETS: 'paisatrack_budgets_v2',
  SAVINGS_GOALS: 'paisatrack_savings_goals_v2',
  SETTINGS: 'paisatrack_settings_v2',
  INITIALIZED: 'paisatrack_initialized_v2',
};

class StorageRepository {
  private isBrowser(): boolean {
    try {
      return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined' && window.localStorage !== null;
    } catch {
      return false;
    }
  }

  constructor() {
    this.ensureInitialized();
  }

  public ensureInitialized(): void {
    if (!this.isBrowser()) return;

    try {
      const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!isInitialized) {
        // Clean up legacy v1 demo data if present
        localStorage.removeItem('paisatrack_transactions_v1');
        localStorage.removeItem('paisatrack_budgets_v1');
        localStorage.removeItem('paisatrack_savings_goals_v1');
        localStorage.removeItem('paisatrack_initialized_v1');

        // Initialize with default categories and EMPTY transactions/budgets (clean slate)
        const { transactions, budgets, savingsGoals } = getInitialSeedData();
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions)); // []
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets)); // []
        localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(savingsGoals)); // []
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      }
    } catch (e) {
      console.error('Storage initialization failed', e);
    }
  }

  // --- SETTINGS ---
  public getSettings(): UserSettings {
    if (!this.isBrowser()) return DEFAULT_SETTINGS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public saveSettings(settings: Partial<UserSettings>): UserSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    }
    return updated;
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    if (!this.isBrowser()) return DEFAULT_CATEGORIES;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  }

  public saveCategory(category: Category): Category[] {
    const categories = this.getCategories();
    const index = categories.findIndex((c) => c.id === category.id);
    let updated: Category[];
    if (index >= 0) {
      updated = [...categories];
      updated[index] = category;
    } else {
      updated = [...categories, category];
    }
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    }
    return updated;
  }

  public deleteCategory(id: string): { success: boolean; error?: string } {
    const transactions = this.getTransactions();
    const isUsed = transactions.some((t) => t.categoryId === id);
    if (isUsed) {
      return { success: false, error: 'Cannot delete category that has existing transactions.' };
    }

    const categories = this.getCategories().filter((c) => c.id !== id);
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    }
    return { success: true };
  }

  // --- TRANSACTIONS ---
  public getTransactions(): Transaction[] {
    if (!this.isBrowser()) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const list: Transaction[] = data ? JSON.parse(data) : [];
      return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch {
      return [];
    }
  }

  public saveTransaction(tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> & { id?: string; createdAt?: string }): Transaction {
    const transactions = this.getTransactions();
    const now = new Date().toISOString();
    const id = tx.id || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const existingIndex = transactions.findIndex((t) => t.id === id);
    let finalTx: Transaction;

    if (existingIndex >= 0) {
      finalTx = {
        ...transactions[existingIndex],
        ...tx,
        id,
        updatedAt: now,
        synced: false,
      };
      transactions[existingIndex] = finalTx;
    } else {
      finalTx = {
        ...tx,
        id,
        createdAt: tx.createdAt || now,
        updatedAt: now,
        synced: false,
      };
      transactions.unshift(finalTx);
    }

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    }
    return finalTx;
  }

  public deleteTransaction(id: string): boolean {
    const transactions = this.getTransactions().filter((t) => t.id !== id);
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    }
    return true;
  }

  // --- BUDGETS ---
  public getBudgets(month?: string): Budget[] {
    if (!this.isBrowser()) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      const list: Budget[] = data ? JSON.parse(data) : [];
      if (month) {
        return list.filter((b) => b.month === month);
      }
      return list;
    } catch {
      return [];
    }
  }

  public saveBudget(budget: Omit<Budget, 'id'> & { id?: string }): Budget {
    const budgets = this.getBudgets();
    const id = budget.id || `b-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const finalBudget: Budget = { ...budget, id };

    const index = budgets.findIndex((b) => b.id === id || (b.categoryId === budget.categoryId && b.month === budget.month));
    let updated: Budget[];
    if (index >= 0) {
      updated = [...budgets];
      updated[index] = finalBudget;
    } else {
      updated = [...budgets, finalBudget];
    }

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(updated));
    }
    return finalBudget;
  }

  public deleteBudget(id: string): boolean {
    const budgets = this.getBudgets().filter((b) => b.id !== id);
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    }
    return true;
  }

  // --- SAVINGS GOALS ---
  public getSavingsGoals(): SavingsGoal[] {
    if (!this.isBrowser()) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveSavingsGoal(goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'contributions'> & { id?: string; contributions?: SavingsContribution[] }): SavingsGoal {
    const goals = this.getSavingsGoals();
    const id = goal.id || `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const index = goals.findIndex((g) => g.id === id);
    let finalGoal: SavingsGoal;

    if (index >= 0) {
      finalGoal = {
        ...goals[index],
        ...goal,
        id,
      };
      goals[index] = finalGoal;
    } else {
      finalGoal = {
        ...goal,
        id,
        createdAt: now,
        contributions: goal.contributions || [],
        currentAmount: goal.currentAmount || 0,
      };
      goals.push(finalGoal);
    }

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals));
    }
    return finalGoal;
  }

  public recordSavingsActivity(
    goalId: string,
    amount: number,
    type: 'contribution' | 'withdrawal',
    date: string,
    note?: string
  ): SavingsGoal | null {
    const goals = this.getSavingsGoals();
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return null;

    const activity: SavingsContribution = {
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      goalId,
      amount,
      type,
      date,
      note,
    };

    if (type === 'contribution') {
      goal.currentAmount += amount;
    } else {
      goal.currentAmount = Math.max(0, goal.currentAmount - amount);
    }

    goal.contributions = [activity, ...(goal.contributions || [])];

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals));
    }
    return goal;
  }

  public deleteSavingsGoal(id: string): boolean {
    const goals = this.getSavingsGoals().filter((g) => g.id !== id);
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals));
    }
    return true;
  }

  // --- CALCULATION UTILITIES ---

  public calculateTotalBalance(transactions?: Transaction[]): number {
    const list = transactions || this.getTransactions();
    return list.reduce((acc, t) => {
      if (t.type === 'income') return acc + t.amount;
      if (t.type === 'expense') return acc - t.amount;
      return acc;
    }, 0);
  }

  public calculateMonthSummary(monthStr: string, transactions?: Transaction[]): CashFlowPeriodSummary {
    const list = transactions || this.getTransactions();
    const monthTx = list.filter((t) => t.date.startsWith(monthStr));

    let totalIncome = 0;
    let totalExpense = 0;

    for (const t of monthTx) {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else if (t.type === 'expense') {
        totalExpense += t.amount;
      }
    }

    const netCashFlow = totalIncome - totalExpense;
    const totalBalance = this.calculateTotalBalance(list);

    return {
      totalIncome,
      totalExpense,
      netCashFlow,
      totalBalance,
      transactionCount: monthTx.length,
    };
  }

  // --- FULL DATA BACKUP & RESTORE ---
  public exportAllData(): string {
    const data = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      categories: this.getCategories(),
      transactions: this.getTransactions(),
      budgets: this.getBudgets(),
      savingsGoals: this.getSavingsGoals(),
    };
    return JSON.stringify(data, null, 2);
  }

  public importAllData(jsonString: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.transactions || !Array.isArray(data.transactions)) {
        return { success: false, error: 'Invalid backup file format: missing transactions.' };
      }

      if (this.isBrowser()) {
        if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
        if (data.categories) localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
        if (data.transactions) localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
        if (data.budgets) localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(data.budgets));
        if (data.savingsGoals) localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(data.savingsGoals));
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Failed to parse JSON backup file.' };
    }
  }

  public clearAllData(): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
  }

  public loadSampleData(): void {
    if (!this.isBrowser()) return;
    const { transactions, budgets, savingsGoals } = getSampleDemoData();
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(savingsGoals));
  }
}

export const storage = new StorageRepository();
