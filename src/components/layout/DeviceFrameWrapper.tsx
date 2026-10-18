import React, { useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface DeviceFrameWrapperProps {
  children: React.ReactNode;
}

export const DeviceFrameWrapper: React.FC<DeviceFrameWrapperProps> = ({ children }) => {
  const { settings, updateSettings } = useFinance();
  const [deviceModel, setDeviceModel] = useState<'iphone' | 'android'>('iphone');

  // If in responsive / fluid mode
  if (settings.viewMode === 'responsive') {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
        <div className="w-full max-w-xl mx-auto flex-1 flex flex-col shadow-xs bg-white dark:bg-zinc-900 border-x border-zinc-200/60 dark:border-zinc-800/60 min-h-screen">
          {children}
        </div>
      </div>
    );
  }

  // Mobile Device Simulated Frame (Great on desktop; seamlessly responsive on mobile)
  return (
    <div className="min-h-screen bg-zinc-100/90 dark:bg-zinc-950/90 py-0 sm:py-6 px-0 sm:px-4 flex flex-col items-center justify-center transition-colors">
      {/* Top Toggle Toolbar on desktop only */}
      <div className="hidden sm:flex mb-3 items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-3.5 py-1.5 rounded-full border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <Smartphone size={14} className="text-emerald-500" />
        <span className="font-medium text-zinc-700 dark:text-zinc-300">Preview:</span>
        <button
          onClick={() => setDeviceModel('iphone')}
          className={`px-2.5 py-0.5 rounded-md cursor-pointer transition-colors ${
            deviceModel === 'iphone'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
              : 'hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          iOS (iPhone)
        </button>
        <span className="text-zinc-300 dark:text-zinc-700">•</span>
        <button
          onClick={() => setDeviceModel('android')}
          className={`px-2.5 py-0.5 rounded-md cursor-pointer transition-colors ${
            deviceModel === 'android'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
              : 'hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Android (Pixel)
        </button>
        <span className="text-zinc-300 dark:text-zinc-700">•</span>
        <button
          onClick={() => updateSettings({ viewMode: 'responsive' })}
          className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer flex items-center gap-1"
        >
          <Monitor size={13} /> Full Screen
        </button>
      </div>

      {/* Screen Container: On mobile phones fills 100%; on desktop acts as a sleek mock frame */}
      <div className="w-full sm:max-w-[420px] h-screen sm:h-[840px] bg-white dark:bg-zinc-900 sm:rounded-[40px] sm:shadow-2xl sm:border sm:border-zinc-200/80 dark:sm:border-zinc-800 flex flex-col overflow-hidden relative transition-all">
        {/* iOS Dynamic Island / Notch on desktop simulator */}
        <div className="hidden sm:flex absolute top-3 left-1/2 -translate-x-1/2 z-50 items-center justify-center pointer-events-none">
          {deviceModel === 'iphone' ? (
            <div className="w-24 h-5 bg-black rounded-full flex items-center justify-between px-2.5">
              <div className="w-2 h-2 rounded-full bg-zinc-900 ring-1 ring-zinc-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
            </div>
          ) : (
            <div className="w-3 h-3 rounded-full bg-black ring-1 ring-zinc-800" />
          )}
        </div>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto flex flex-col relative w-full pt-1 sm:pt-4">
          {children}
        </div>
      </div>
    </div>
  );
};
