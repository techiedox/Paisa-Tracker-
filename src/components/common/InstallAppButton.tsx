import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share, PlusSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { Modal } from './Modal';

export const InstallAppButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showInstallGuide, setShowInstallGuide] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone / installed PWA mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Capture PWA install prompt (Chrome, Edge, Android, desktop PWA)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        setShowInstallGuide(true);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  // If already running inside standalone installed app, don't show prompt
  if (isInstalled) return null;

  return (
    <>
      {/* Floating 1-Click Download Web App Button at Right Bottom Corner */}
      <aside
        aria-label="Download web app"
        className="absolute bottom-20 right-3.5 z-40 animate-fade-in select-none pointer-events-auto"
      >
        <button
          onClick={handleInstallClick}
          className="group flex items-center gap-1.5 bg-gradient-to-r from-[#1E2C44] to-[#2B3D5E] hover:from-[#152134] hover:to-[#1E2C44] text-white pl-2.5 pr-3.5 py-2 rounded-full shadow-lg shadow-slate-900/40 hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-[#C99E58]/50 ring-2 ring-white/20 dark:ring-zinc-800"
          title="Download & Install Paisa Tracker to your device"
          aria-label="Download App"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <Download size={13} strokeWidth={2.5} className="animate-pulse" />
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span className="text-[11px] font-black tracking-tight text-white flex items-center gap-1">
              Download App
            </span>
            <span className="text-[9px] text-[#C99E58] font-bold">1-Click Install</span>
          </div>
        </button>
      </aside>

      {/* 1-Click Install / Add to Screen Guide Modal */}
      <Modal
        isOpen={showInstallGuide}
        onClose={() => setShowInstallGuide(false)}
        title="Download Paisa Tracker"
        subtitle="Install directly to your device home screen with 100% offline storage"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 py-2 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1E2C44] text-white mx-auto flex items-center justify-center shadow-lg border border-[#C99E58]/40">
            <Smartphone size={32} className="text-[#C99E58]" />
          </div>

          <div>
            <h4 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
              Install Directly on Your Device
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Paisa Tracker is an offline Progressive Web App. No app store login or download file needed — it runs directly from your home screen like a native mobile app!
            </p>
          </div>

          {/* Device Specific Steps */}
          {isIos ? (
            <div className="text-left space-y-2 bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-[11px]">
                  1
                </div>
                <div className="text-[12px] text-zinc-700 dark:text-zinc-300">
                  Tap the <span className="font-bold inline-flex items-center gap-1 bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-[11px]"><Share size={11} /> Share</span> icon at the bottom of Safari.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-[11px]">
                  2
                </div>
                <div className="text-[12px] text-zinc-700 dark:text-zinc-300">
                  Select <span className="font-bold inline-flex items-center gap-1 bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-[11px]"><PlusSquare size={11} /> Add to Home Screen</span>.
                </div>
              </div>
            </div>
          ) : (
            <div className="text-left space-y-2 bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-[11px]">
                  1
                </div>
                <div className="text-[12px] text-zinc-700 dark:text-zinc-300">
                  Click the install icon in your browser address bar or tap menu <span className="font-bold">⋮</span>.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-[11px]">
                  2
                </div>
                <div className="text-[12px] text-zinc-700 dark:text-zinc-300">
                  Choose <span className="font-bold">"Install App"</span> or <span className="font-bold">"Add to Home screen"</span>.
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-left flex items-start gap-2 text-[11px] text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>Once installed, it opens full-screen without any browser address bar and works 100% offline.</span>
          </div>

          <button
            onClick={() => setShowInstallGuide(false)}
            className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </Modal>
    </>
  );
};
