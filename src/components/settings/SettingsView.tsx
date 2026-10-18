import React, { useState, useRef } from 'react';
import {
  Coins,
  Calendar,
  Sun,
  Moon,
  Laptop,
  Download,
  Upload,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Sliders,
  FileSpreadsheet,
  HardDrive,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CurrencyCode, NumberFormatType, DateFormatType, ThemeMode } from '../../types';
import { CURRENCY_SYMBOLS, toMinorUnits, fromMinorUnits } from '../../services/currencyFormatter';
import { storage } from '../../db/storage';
import { downloadJSONBackup, exportTransactionsToCSV } from '../../services/exportService';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    toggleTheme,
    clearAllData,
    resetToDemo,
    loadSampleData,
    budgets,
    saveBudget,
    currentMonth,
    transactions,
    categories,
  } = useFinance();

  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const overallBudget = budgets.find(
    (b) => b.month === currentMonth && b.categoryId === 'overall'
  );
  const [budgetVal, setBudgetVal] = useState(
    overallBudget ? (fromMinorUnits(overallBudget.amount)).toString() : '50000'
  );

  const currencies: { code: CurrencyCode; label: string }[] = [
    { code: 'INR', label: 'INR (₹) - Indian Rupee' },
    { code: 'USD', label: 'USD ($) - US Dollar' },
    { code: 'EUR', label: 'EUR (€) - Euro' },
    { code: 'GBP', label: 'GBP (£) - British Pound' },
    { code: 'JPY', label: 'JPY (¥) - Japanese Yen' },
    { code: 'AED', label: 'AED (د.إ) - UAE Dirham' },
    { code: 'CAD', label: 'CAD (CA$) - Canadian Dollar' },
    { code: 'AUD', label: 'AUD (A$) - Australian Dollar' },
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCurrencyChange = (c: CurrencyCode) => {
    updateSettings({
      currency: c,
      currencySymbol: CURRENCY_SYMBOLS[c] || '₹',
    });
    showToast(`Currency changed to ${c}`);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(budgetVal);
    if (!isNaN(parsed) && parsed > 0) {
      saveBudget({
        id: overallBudget ? overallBudget.id : undefined,
        categoryId: 'overall',
        amount: toMinorUnits(parsed),
        month: currentMonth,
        alertThreshold: 80,
      });
      showToast('Monthly budget updated!');
    }
  };

  const handleBackupExport = () => {
    const json = storage.exportAllData();
    downloadJSONBackup(json);
    showToast('Backup JSON downloaded successfully!');
  };

  const handleCsvExport = () => {
    exportTransactionsToCSV(transactions, categories, settings);
    showToast('CSV report downloaded!');
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = storage.importAllData(content);
        if (res.success) {
          window.location.reload();
        } else {
          alert(res.error || 'Failed to restore backup file.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 px-4 py-3 animate-fade-in pb-24">
      {/* Header */}
      <div>
        <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Settings & Data
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Preferences & on-device storage management
        </p>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 rounded-2xl flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 animate-fade-in">
          <CheckCircle2 size={15} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 100% On-Device Local Storage Card */}
      <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-4 rounded-3xl border border-emerald-500/30 dark:border-emerald-500/20 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
          <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
          <span>100% Private & Stored Locally</span>
        </div>
        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
          All your transactions, categories, and budgets are kept exclusively on this device in your
          browser's local storage. No accounts, no telemetry, and no external servers.
        </p>
        <div className="flex items-center gap-2 pt-1 text-[10px] text-zinc-500 font-medium">
          <HardDrive size={12} />
          <span>{transactions.length} transactions saved on this device</span>
        </div>
      </div>

      {/* Currency & Formatting */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
          <Coins size={14} /> Currency & Formats
        </h3>

        <div>
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
            Currency
          </label>
          <select
            value={settings.currency}
            onChange={(e) => handleCurrencyChange(e.target.value as CurrencyCode)}
            className="w-full text-xs py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
              Numbers
            </label>
            <select
              value={settings.numberFormat}
              onChange={(e) =>
                updateSettings({ numberFormat: e.target.value as NumberFormatType })
              }
              className="w-full text-xs py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="in">Indian (1,00,000)</option>
              <option value="western">Western (100,000)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
              Date Format
            </label>
            <select
              value={settings.dateFormat}
              onChange={(e) =>
                updateSettings({ dateFormat: e.target.value as DateFormatType })
              }
              className="w-full text-xs py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Monthly Budget Goal */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
          <Sliders size={14} /> Monthly Spending Target
        </h3>

        <form onSubmit={handleSaveBudget} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">
              {settings.currencySymbol}
            </span>
            <input
              type="number"
              min="1"
              step="1"
              value={budgetVal}
              onChange={(e) => setBudgetVal(e.target.value)}
              placeholder="50000"
              className="w-full pl-8 pr-3 py-2 text-xs font-mono font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="py-2 px-3.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold transition-colors cursor-pointer"
          >
            Update
          </button>
        </form>
      </div>

      {/* Appearance / Theme */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
          <Sun size={14} /> Appearance
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Laptop },
          ].map((thm) => {
            const Icon = thm.icon;
            const isSelected = settings.theme === thm.id;
            return (
              <button
                key={thm.id}
                onClick={() => toggleTheme(thm.id as ThemeMode)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Icon size={14} />
                <span>{thm.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Backup, Restore & Data Operations */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
          <Download size={14} /> Backup & Export
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCsvExport}
            className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
          >
            <FileSpreadsheet size={14} className="text-emerald-500" /> Export CSV
          </button>

          <button
            onClick={handleBackupExport}
            className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
          >
            <Download size={14} className="text-blue-500" /> Backup JSON
          </button>
        </div>

        <div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
          >
            <Upload size={14} className="text-purple-500" /> Restore from JSON Backup
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileRestore}
            accept=".json"
            className="hidden"
          />
        </div>

        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex-1 py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center justify-center gap-1"
          >
            <RotateCcw size={12} /> Load Demo Data
          </button>

          <button
            onClick={() => setIsClearConfirmOpen(true)}
            className="flex-1 py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer flex items-center justify-center gap-1"
          >
            <Trash2 size={12} /> Clear All
          </button>
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={() => {
          clearAllData();
          showToast('All financial records cleared.');
        }}
        title="Clear All Financial Records"
        message="This will permanently erase all transactions and budgets from your device's local storage. Proceed?"
        confirmLabel="Erase Everything"
      />

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          loadSampleData();
          showToast('Sample demo data loaded successfully!');
        }}
        title="Load Sample Demo Data"
        message="This will populate starter transactions and a budget so you can test all features and charts."
        confirmLabel="Load Data"
        isDestructive={false}
      />
    </div>
  );
};
