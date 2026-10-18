import React from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 38,
  className = '',
  showText = false,
}) => {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* SVG Icon matching exact uploaded logo design */}
      <div
        className="relative shrink-0 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-contain"
        >
          {/* 1. Indian Rupee Symbol (Green) */}
          <path
            d="M20 38H68M20 56H52M20 74H40"
            stroke="#206B43"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <path
            d="M36 38V126"
            stroke="#206B43"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <path
            d="M36 38H56C68 38 76 46 76 56C76 66 68 74 56 74H36"
            stroke="#206B43"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M50 74L24 126"
            stroke="#206B43"
            strokeWidth="11"
            strokeLinecap="round"
          />

          {/* 2. Gold Card protruding from wallet */}
          <path
            d="M92 78C92 70 98 64 106 64H122C130 64 136 70 136 78V84H92V78Z"
            fill="#C99E58"
          />

          {/* 3. Navy Blue Wallet */}
          <rect
            x="64"
            y="80"
            width="82"
            height="54"
            rx="12"
            fill="#1E2C44"
          />
          {/* Wallet fold line */}
          <path
            d="M64 92H146"
            stroke="#152134"
            strokeWidth="2.5"
          />
          {/* Wallet Clasp / Button */}
          <rect
            x="118"
            y="94"
            width="22"
            height="18"
            rx="6"
            fill="#2B3D5E"
          />
          <circle
            cx="127"
            cy="103"
            r="3"
            fill="#FFFFFF"
          />

          {/* 4. Rising Green & Navy Growth Arrow */}
          <path
            d="M58 106L80 78L96 94L132 50"
            stroke="#206B43"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Arrowhead */}
          <path
            d="M112 48H134V70"
            stroke="#206B43"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-extrabold text-lg tracking-tight text-[#C99E58] dark:text-[#E0B870] font-sans">
            Paisa
          </span>
          <span className="font-black text-lg tracking-tight text-[#1E2C44] dark:text-zinc-100 font-sans -mt-0.5">
            Tracker
          </span>
        </div>
      )}
    </div>
  );
};
