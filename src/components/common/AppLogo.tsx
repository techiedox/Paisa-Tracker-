import React from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 36,
  className = '',
  showText = false,
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Modern Gradient Icon Mark */}
      <div
        className="relative shrink-0 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/25 flex items-center justify-center overflow-hidden"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          {/* Subtle geometric background grid */}
          <rect width="40" height="40" rx="10" fill="transparent" />
          
          {/* Stylized Modern Finance 'P' + Rising Trend Wave */}
          <path
            d="M12 28V12H21C23.7614 12 26 14.2386 26 17C26 19.7614 23.7614 22 21 22H12"
            stroke="white"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Cross slash */}
          <path
            d="M10 17H25"
            stroke="white"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          {/* Ascending Trend Spark */}
          <path
            d="M21 27L25 23L29 27L33 21"
            stroke="#A7F3D0"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="33" cy="21" r="1.5" fill="#A7F3D0" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">
            PaisaTrack
          </span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium tracking-wide uppercase mt-0.5">
            Expense Tracker
          </span>
        </div>
      )}
    </div>
  );
};
