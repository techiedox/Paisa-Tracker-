import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Paisa Tracker caught an unhandled error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.removeItem('paisatrack_settings_v2');
      localStorage.removeItem('paisatrack_initialized_v2');
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-900 text-white font-sans">
          <div className="max-w-md w-full bg-zinc-800 border border-zinc-700 p-6 rounded-3xl text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <AlertTriangle size={28} />
            </div>
            
            <div>
              <h2 className="text-lg font-bold text-white">Something went wrong</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Paisa Tracker encountered an unexpected display issue. Your saved data is safe.
              </p>
            </div>

            {this.state.error && (
              <pre className="text-[10px] text-zinc-400 bg-zinc-950 p-3 rounded-xl overflow-x-auto text-left max-h-24 font-mono">
                {this.state.error.message}
              </pre>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={14} /> Reload App
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Safe Reset
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
