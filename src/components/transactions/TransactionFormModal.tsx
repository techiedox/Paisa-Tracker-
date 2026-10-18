import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Calendar,
  CreditCard,
  FileText,
  Tag,
  Check,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { TransactionType, PaymentMethod } from '../../types';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { CategoryIcon } from '../common/CategoryIcon';
import { toMinorUnits, fromMinorUnits } from '../../services/currencyFormatter';

const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'upi', label: 'UPI' },
  { id: 'cash', label: 'Cash' },
  { id: 'credit_card', label: 'Credit Card' },
  { id: 'debit_card', label: 'Debit Card' },
  { id: 'net_banking', label: 'Net Banking' },
  { id: 'other', label: 'Other' },
];

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export const TransactionFormModal: React.FC = () => {
  const {
    isTransactionModalOpen,
    closeTransactionModal,
    editingTransaction,
    transactionModalDefaultType,
    categories,
    saveTransaction,
    deleteTransaction,
    settings,
  } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [error, setError] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmountStr(fromMinorUnits(editingTransaction.amount).toString());
      setCategoryId(editingTransaction.categoryId);
      const [dPart, tPart] = editingTransaction.date.split('T');
      setDate(dPart || new Date().toISOString().split('T')[0]);
      setTime(tPart ? tPart.substring(0, 5) : '');
      setNote(editingTransaction.note || '');
      setPaymentMethod(editingTransaction.paymentMethod || 'upi');
    } else {
      setType(transactionModalDefaultType);
      setAmountStr('');
      const today = new Date();
      setDate(today.toISOString().split('T')[0]);
      const hours = String(today.getHours()).padStart(2, '0');
      const minutes = String(today.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);
      setNote('');
      setPaymentMethod('upi');

      // Pick first matching category
      const availableCategories = categories.filter(
        (c) => c.type === transactionModalDefaultType || c.type === 'both'
      );
      if (availableCategories.length > 0) {
        setCategoryId(availableCategories[0].id);
      }
    }
    setError('');
  }, [editingTransaction, transactionModalDefaultType, isTransactionModalOpen, categories]);

  // Filter categories by type
  const availableCategories = categories.filter((c) => c.type === type || c.type === 'both');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    if (!date) {
      setError('Please choose a transaction date.');
      return;
    }

    const minorUnits = toMinorUnits(parsedAmount);
    const finalDateStr = time ? `${date}T${time}:00` : date;

    saveTransaction({
      id: editingTransaction ? editingTransaction.id : undefined,
      type,
      amount: minorUnits,
      categoryId,
      date: finalDateStr,
      note: note.trim(),
      paymentMethod,
    });

    closeTransactionModal();
  };

  const handleDelete = () => {
    if (editingTransaction) {
      deleteTransaction(editingTransaction.id);
      closeTransactionModal();
    }
  };

  const handleQuickAmount = (val: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr((current + val).toString());
  };

  return (
    <>
      <Modal
        isOpen={isTransactionModalOpen}
        onClose={closeTransactionModal}
        title={editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
        subtitle={editingTransaction ? 'Update entry details' : 'Enter transaction details'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Selector (Expense vs Income) */}
          <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const expCats = categories.filter((c) => c.type === 'expense' || c.type === 'both');
                if (expCats.length > 0) setCategoryId(expCats[0].id);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                const incCats = categories.filter((c) => c.type === 'income' || c.type === 'both');
                if (incCats.length > 0) setCategoryId(incCats[0].id);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount Input */}
          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-center">
            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
              Amount ({settings.currencySymbol})
            </label>
            <div className="flex items-center justify-center">
              <span className="text-2xl font-bold text-zinc-400 mr-1.5">{settings.currencySymbol}</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                autoFocus
                className="w-48 text-3xl font-extrabold font-mono text-center bg-transparent border-b-2 border-zinc-300 dark:border-zinc-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-hidden text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Quick Amount Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer"
                >
                  +{settings.currencySymbol}{val}
                </button>
              ))}
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 mb-2">
              <Tag size={13} className="text-zinc-400" /> Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/40">
              {availableCategories.map((c) => {
                const isSelected = categoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryId(c.id)}
                    className={`p-2 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-zinc-900 shadow-sm ring-2 ring-emerald-500'
                        : 'hover:bg-white/60 dark:hover:bg-zinc-800/60 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center mb-1"
                      style={{ backgroundColor: `${c.color}20`, color: c.color }}
                    >
                      <CategoryIcon name={c.icon} size={15} color={c.color} />
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-200 truncate w-full">
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 mb-1">
                <Calendar size={13} className="text-zinc-400" /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-xs py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 mb-1">
                <Clock size={13} className="text-zinc-400" /> Time (Optional)
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 mb-1.5">
              <CreditCard size={13} className="text-zinc-400" /> Payment Method
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`py-1.5 px-2 text-xs rounded-xl font-medium border text-center transition-all cursor-pointer ${
                    paymentMethod === pm.id
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                  }`}
                >
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 mb-1">
              <FileText size={13} className="text-zinc-400" /> Description / Note
            </label>
            <input
              type="text"
              placeholder="e.g. Dinner with friends, Uber to airport..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-xs py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Buttons: Submit & Delete */}
          <div className="flex gap-2 pt-2">
            {editingTransaction && (
              <button
                type="button"
                onClick={() => setIsDeleting(true)}
                className="py-2.5 px-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Delete Entry"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <Check size={16} />
              {editingTransaction ? 'Save Changes' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message="Are you sure you want to permanently delete this transaction entry? This will update your balances and reports immediately."
        confirmLabel="Yes, Delete"
      />
    </>
  );
};
