import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ShieldCheck, Smartphone, Sparkles, ArrowRight } from 'lucide-react';
import { Modal } from '../common/Modal';

import { AppLogo } from '../common/AppLogo';

export const WelcomeOnboardingModal: React.FC = () => {
  const { settings, updateSettings } = useFinance();
  const [isOpen, setIsOpen] = useState(!settings.onboardingCompleted);

  if (settings.onboardingCompleted && !isOpen) return null;

  const handleStartGuest = () => {
    updateSettings({ onboardingCompleted: true });
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => handleStartGuest()}
      title="Welcome to PaisaTrack"
      subtitle="Simple, private & fast expense tracker"
      maxWidth="max-w-md"
    >
      <div className="space-y-4 text-center py-2">
        {/* Brand Logo */}
        <div className="flex justify-center">
          <AppLogo size={56} />
        </div>

        <div>
          <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Simple, Private Expense Tracking
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
            Track daily expenses, set monthly spending limits, and own 100% of your financial data.
          </p>
        </div>

        {/* Value props */}
        <div className="space-y-2.5 text-left bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck size={14} />
            </div>
            <div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                100% On-Device Storage
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Your data stays exclusively in your local device browser. No tracking or sign-up needed.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <Smartphone size={14} />
            </div>
            <div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                Cross-Platform & Offline Ready
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Optimized for Android, iOS, and desktop with instant offline performance.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles size={14} />
            </div>
            <div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                Effortless Quick Add
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Log purchases in under 3 seconds with category chips and quick amount shortcuts.
              </span>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <button
            onClick={handleStartGuest}
            className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Start Tracking Now</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </Modal>
  );
};
