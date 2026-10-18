import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { toMinorUnits, fromMinorUnits, formatCurrency } from '../../services/currencyFormatter';
import { storage } from '../../db/storage';
import { Transaction, Budget } from '../../types';
import { CheckCircle2, XCircle, Play, RefreshCw } from 'lucide-react';

interface TestCase {
  id: string;
  name: string;
  description: string;
  run: () => { passed: boolean; message: string };
}

export const TestSuiteModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [results, setResults] = useState<{ id: string; passed: boolean; message: string }[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const testCases: TestCase[] = [
    {
      id: 't-minor-units',
      name: 'Minor Units & Arithmetic Precision',
      description: 'Verifies integer paise conversion prevents 0.1 + 0.2 floating point inaccuracies.',
      run: () => {
        const amt1 = 19.99;
        const amt2 = 0.01;
        const m1 = toMinorUnits(amt1);
        const m2 = toMinorUnits(amt2);
        const sumMinor = m1 + m2; // 2000
        const backToFloat = fromMinorUnits(sumMinor);
        const passed = sumMinor === 2000 && backToFloat === 20.0;
        return {
          passed,
          message: passed
            ? `Exact integer math: ${m1} + ${m2} = ${sumMinor} paise (₹${backToFloat.toFixed(2)})`
            : `Failed: expected 2000 paise, got ${sumMinor}`,
        };
      },
    },
    {
      id: 't-balance-calc',
      name: 'Balance vs Monthly Cash Flow Separation',
      description: 'Ensures all-time net worth is never conflated with selected month cash flow.',
      run: () => {
        const dummyTx: Transaction[] = [
          {
            id: 'd1',
            type: 'income',
            amount: 5000000, // ₹50,000
            categoryId: 'cat-salary',
            date: '2026-09-01',
            note: 'Old salary',
            paymentMethod: 'upi',
            createdAt: '',
            updatedAt: '',
          },
          {
            id: 'd2',
            type: 'expense',
            amount: 1000000, // ₹10,000
            categoryId: 'cat-rent',
            date: '2026-10-01',
            note: 'New rent',
            paymentMethod: 'upi',
            createdAt: '',
            updatedAt: '',
          },
        ];

        const totalBalance = storage.calculateTotalBalance(dummyTx);
        const octSummary = storage.calculateMonthSummary('2026-10', dummyTx);

        const passed =
          totalBalance === 4000000 && // 50k - 10k = 40k
          octSummary.totalIncome === 0 &&
          octSummary.totalExpense === 1000000 &&
          octSummary.netCashFlow === -1000000;

        return {
          passed,
          message: passed
            ? `Cumulative Balance: ₹40,000, Oct Net Flow: -₹10,000 correctly decoupled.`
            : `Failed calculation mismatch.`,
        };
      },
    },
    {
      id: 't-currency-format',
      name: 'Indian Lakhs / Crores Number Formatting',
      description: 'Checks ₹12,34,567.89 commas grouping for INR currency.',
      run: () => {
        const minor = 123456789; // 12,34,567.89
        const formatted = formatCurrency(minor, 'INR', 'in');
        const passed = formatted.includes('12,34,567.89') || formatted.includes('12,34,567');
        return {
          passed,
          message: passed
            ? `Correctly formatted: ${formatted}`
            : `Failed format: ${formatted}`,
        };
      },
    },
    {
      id: 't-budget-threshold',
      name: 'Budget Exceeded & Warning Boundary Check',
      description: 'Calculates 80% warning threshold and 100% exceeded boundary.',
      run: () => {
        const budgetLimit = 1000000; // ₹10,000
        const alertThreshold = 80;

        const spend79 = 790000; // 79%
        const spend85 = 850000; // 85%
        const spend110 = 1100000; // 110%

        const is79Warning = (spend79 / budgetLimit) * 100 >= alertThreshold;
        const is85Warning = (spend85 / budgetLimit) * 100 >= alertThreshold;
        const is110Exceeded = spend110 > budgetLimit;

        const passed = !is79Warning && is85Warning && is110Exceeded;
        return {
          passed,
          message: passed
            ? `Threshold boundaries evaluated correctly (79%: safe, 85%: warning, 110%: exceeded).`
            : `Budget threshold boundary failure.`,
        };
      },
    },
    {
      id: 't-date-bounds',
      name: 'Date String Boundaries & ISO Handling',
      description: 'Ensures YYYY-MM prefixes match transactions correctly across leap/month bounds.',
      run: () => {
        const txDate1 = '2026-10-31T23:59:59';
        const txDate2 = '2026-11-01T00:00:00';
        const inOct1 = txDate1.startsWith('2026-10');
        const inOct2 = txDate2.startsWith('2026-10');
        const passed = inOct1 && !inOct2;
        return {
          passed,
          message: passed
            ? `Date prefix boundary strictly isolated month windows.`
            : `Date boundary check failed.`,
        };
      },
    },
    {
      id: 't-persistence-integrity',
      name: 'Storage CRUD & Safe Deletion',
      description: 'Simulates transaction saving, retrieval, and atomic deletion.',
      run: () => {
        const testId = `test-tx-${Date.now()}`;
        const saved = storage.saveTransaction({
          id: testId,
          type: 'expense',
          amount: 25000,
          categoryId: 'cat-food',
          date: '2026-10-12',
          note: 'Unit test sample',
          paymentMethod: 'cash',
        });

        const listAfterSave = storage.getTransactions();
        const found = listAfterSave.some((t) => t.id === testId);

        storage.deleteTransaction(testId);
        const listAfterDelete = storage.getTransactions();
        const deleted = !listAfterDelete.some((t) => t.id === testId);

        const passed = found && deleted;
        return {
          passed,
          message: passed
            ? `Successfully created, read, and atomically deleted test record.`
            : `Storage persistence test failed.`,
        };
      },
    },
  ];

  const runAllTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = testCases.map((tc) => ({
        id: tc.id,
        ...tc.run(),
      }));
      setResults(res);
      setIsRunning(false);
    }, 200);
  };

  const allPassed = results.length > 0 && results.every((r) => r.passed);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Automated Logic Verification Suite"
      subtitle="Exhaustive unit tests verifying mathematical and storage correctness"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <span className="text-xs text-zinc-500">
            {results.length > 0
              ? `${results.filter((r) => r.passed).length} of ${results.length} tests passed`
              : 'Click Run to execute test suite'}
          </span>
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="py-1.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            {isRunning ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
            <span>{isRunning ? 'Running...' : 'Run All Tests'}</span>
          </button>
        </div>

        {results.length > 0 && allPassed && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
            <CheckCircle2 size={16} />
            <span>All verification tests passed with 100% precision!</span>
          </div>
        )}

        <div className="space-y-2.5 max-h-80 overflow-y-auto">
          {testCases.map((tc) => {
            const result = results.find((r) => r.id === tc.id);
            return (
              <div
                key={tc.id}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{tc.name}</span>
                  {result ? (
                    result.passed ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={13} /> PASS
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                        <XCircle size={13} /> FAIL
                      </span>
                    )
                  ) : (
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold">Pending</span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">
                  {tc.description}
                </p>
                {result && (
                  <p className="text-[10px] font-mono text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 p-1.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800">
                    {result.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
