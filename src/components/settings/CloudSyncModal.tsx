import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../common/Modal';
import { syncService } from '../../services/supabaseSync';
import { Cloud, CheckCircle2, AlertCircle, RefreshCw, Key, Link } from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, refreshData } = useFinance();
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings.supabaseAnonKey || '');
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      setStatusMessage({ text: 'Please enter both Supabase URL and Anon Key.', isError: true });
      return;
    }

    setTesting(true);
    setStatusMessage(null);

    const testRes = await syncService.testConnection(supabaseUrl.trim(), supabaseAnonKey.trim());
    setTesting(false);

    if (testRes.success) {
      updateSettings({
        supabaseUrl: supabaseUrl.trim(),
        supabaseAnonKey: supabaseAnonKey.trim(),
        syncEnabled: true,
      });
      syncService.initialize(supabaseUrl.trim(), supabaseAnonKey.trim());
      setStatusMessage({ text: 'Connected successfully! Saved configuration.', isError: false });
    } else {
      setStatusMessage({ text: testRes.message, isError: true });
    }
  };

  const handleTriggerSync = async () => {
    setSyncing(true);
    setStatusMessage(null);
    const res = await syncService.syncData();
    setSyncing(false);
    if (res.success) {
      refreshData();
      setStatusMessage({ text: 'Cloud Synchronization completed successfully!', isError: false });
    } else {
      setStatusMessage({ text: res.error || 'Sync failed.', isError: true });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supabase Cloud Synchronization"
      subtitle="Optional cross-device cloud sync with local-first priority"
    >
      <div className="space-y-4">
        {/* Architecture Note */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300">
          <p className="font-semibold flex items-center gap-1.5 mb-1">
            <Cloud size={14} /> Offline-First Guarantee
          </p>
          <p className="leading-relaxed text-[11px]">
            Your local storage is always the source of truth. When cloud credentials are provided,
            PaisaTrack synchronizes your categories and transactions safely without overwriting
            newer offline edits.
          </p>
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
              statusMessage.isError
                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400'
                : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {statusMessage.isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleTestAndSave} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 mb-1">
              <Link size={13} className="text-zinc-400" /> Supabase Project URL
            </label>
            <input
              type="url"
              placeholder="https://xyzcompany.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full text-xs py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 mb-1">
              <Key size={13} className="text-zinc-400" /> Supabase Anon Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              className="w-full text-xs py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={testing}
              className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {testing ? <RefreshCw size={14} className="animate-spin" /> : null}
              <span>{testing ? 'Testing Connection...' : 'Save & Connect'}</span>
            </button>

            {settings.syncEnabled && (
              <button
                type="button"
                onClick={handleTriggerSync}
                disabled={syncing}
                className="py-2.5 px-3 rounded-xl border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                <span>Sync Now</span>
              </button>
            )}
          </div>
        </form>

        {settings.lastSyncTime && (
          <p className="text-[10px] text-zinc-400 text-center">
            Last synced: {new Date(settings.lastSyncTime).toLocaleString()}
          </p>
        )}
      </div>
    </Modal>
  );
};
