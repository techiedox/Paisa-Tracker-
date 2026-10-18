import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Transaction, Category, Budget, SavingsGoal, UserSettings } from '../types';
import { storage } from '../db/storage';

export interface SyncStatus {
  isConfigured: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;
  pendingCount: number;
}

class SupabaseSyncService {
  private client: SupabaseClient | null = null;
  private syncing: boolean = false;

  public initialize(supabaseUrl?: string, supabaseAnonKey?: string): boolean {
    if (!supabaseUrl || !supabaseAnonKey) {
      this.client = null;
      return false;
    }

    try {
      this.client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return true;
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      this.client = null;
      return false;
    }
  }

  public getClient(): SupabaseClient | null {
    if (!this.client) {
      const settings = storage.getSettings();
      if (settings.supabaseUrl && settings.supabaseAnonKey) {
        this.initialize(settings.supabaseUrl, settings.supabaseAnonKey);
      }
    }
    return this.client;
  }

  public async testConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
    try {
      const testClient = createClient(url, key);
      const { error } = await testClient.from('categories').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116') {
        // Even if table is empty or requires auth, check error type
        if (error.message.includes('FetchError') || error.message.includes('Failed to fetch')) {
          return { success: false, message: 'Could not connect to Supabase URL. Check network or URL format.' };
        }
      }
      return { success: true, message: 'Successfully connected to Supabase project!' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Connection test failed.' };
    }
  }

  public async syncData(): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!client) {
      return { success: false, error: 'Supabase credentials not configured.' };
    }

    if (this.syncing) {
      return { success: false, error: 'Sync already in progress.' };
    }

    this.syncing = true;

    try {
      const localTransactions = storage.getTransactions();
      const localCategories = storage.getCategories();
      const localBudgets = storage.getBudgets();
      const localSavingsGoals = storage.getSavingsGoals();

      // 1. Sync Categories
      // Pull remote categories
      const { data: remoteCategories, error: catError } = await client
        .from('categories')
        .select('*');

      if (!catError && remoteCategories) {
        for (const rem of remoteCategories) {
          const exists = localCategories.find((l) => l.id === rem.id);
          if (!exists) {
            storage.saveCategory({
              id: rem.id,
              name: rem.name,
              type: rem.type,
              icon: rem.icon,
              color: rem.color,
              isDefault: rem.is_default === 1 || rem.is_default === true,
            });
          }
        }
      }

      // Push custom local categories
      const customLocalCategories = localCategories.filter((c) => !c.isDefault);
      if (customLocalCategories.length > 0) {
        await client.from('categories').upsert(
          customLocalCategories.map((c) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            icon: c.icon,
            color: c.color,
            is_default: c.isDefault ? 1 : 0,
            updated_at: new Date().toISOString(),
          }))
        );
      }

      // 2. Sync Transactions (Conflict Resolution by updatedAt)
      const { data: remoteTransactions, error: txError } = await client
        .from('transactions')
        .select('*');

      if (!txError && remoteTransactions) {
        for (const rem of remoteTransactions) {
          const localTx = localTransactions.find((l) => l.id === rem.id);
          const remUpdatedAt = rem.updated_at ? new Date(rem.updated_at).getTime() : 0;
          const localUpdatedAt = localTx?.updatedAt ? new Date(localTx.updatedAt).getTime() : 0;

          // If remote is newer or not present locally, update local
          if (!localTx || remUpdatedAt > localUpdatedAt) {
            storage.saveTransaction({
              id: rem.id,
              type: rem.type,
              amount: rem.amount,
              categoryId: rem.category_id,
              date: rem.date,
              note: rem.note || '',
              paymentMethod: rem.payment_method,
              createdAt: rem.created_at,
            });
          }
        }
      }

      // Push un-synced or newer local transactions to remote
      const txToPush = storage.getTransactions().map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        category_id: t.categoryId,
        date: t.date,
        note: t.note,
        payment_method: t.paymentMethod,
        created_at: t.createdAt,
        updated_at: t.updatedAt,
      }));

      if (txToPush.length > 0) {
        await client.from('transactions').upsert(txToPush, { onConflict: 'id' });
      }

      // Update last sync time
      const nowStr = new Date().toISOString();
      storage.saveSettings({ lastSyncTime: nowStr });

      this.syncing = false;
      return { success: true };
    } catch (err: any) {
      this.syncing = false;
      return { success: false, error: err?.message || 'Sync failed.' };
    }
  }
}

export const syncService = new SupabaseSyncService();
