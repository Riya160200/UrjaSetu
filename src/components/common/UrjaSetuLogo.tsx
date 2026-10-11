import React from 'react';

interface UrjaSetuLogoProps {
  size?: 'compact' | 'sm' | 'md' | 'lg';
  showDescriptor?: boolean;
  className?: string;
  onClick?: () => void;
}

export const UrjaSetuLogo: React.FC<UrjaSetuLogoProps> = ({
  size = 'md',
  showDescriptor = false,
  className = '',
  onClick,
}) => {
  // Minimal geometric symbol: Interconnected grid nodes forming an energy bridge (Setu)
  const renderGlyph = () => {
    const glyphSizes = {
      compact: 'w-8 h-8',
      sm: 'w-7 h-7',
      md: 'w-8 h-8',
      lg: 'w-10 h-10',
    };

    return (
      <div
        className={`relative flex items-center justify-center rounded-lg bg-[#071324] border border-[#142B47] shrink-0 shadow-[0_0_15px_rgba(56,189,248,0.12)] group-hover:border-[#38BDF8]/60 transition-colors ${glyphSizes[size]}`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5/6 h-5/6"
          aria-hidden="true"
        >
          {/* Bridge arch connecting regional grid clusters */}
          <path
            d="M5 22C10.5 13.5 21.5 13.5 27 22"
            stroke="#38BDF8"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Lower ground synchronization axis */}
          <path
            d="M7 23.5H25"
            stroke="#1E3A8A"
            strokeWidth="1.4"
            strokeDasharray="2 2"
          />
          {/* Western node */}
          <circle cx="8" cy="19" r="2.2" fill="#B8FF65" />
          {/* Central Federated Intelligence Coordinator node */}
          <circle cx="16" cy="14" r="2.8" fill="#38BDF8" />
          <circle cx="16" cy="14" r="4.5" stroke="#38BDF8" strokeWidth="0.8" strokeOpacity="0.4" />
          {/* Eastern node */}
          <circle cx="24" cy="19" r="2.2" fill="#B8FF65" />
          {/* Privacy uplink beam */}
          <path
            d="M16 6V11.2"
            stroke="#38BDF8"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="16" cy="5" r="1.4" fill="#38BDF8" />
        </svg>
      </div>
    );
  };

  if (size === 'compact') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`group flex items-center justify-center p-1 rounded-md transition-all text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#38BDF8] ${className}`}
        title="UrjaSetu (ऊर्जाSetu) — India's Federated Grid Intelligence"
        aria-label="UrjaSetu Logo"
      >
        {renderGlyph()}
      </button>
    );
  }

  const textSizes = {
    sm: {
      hindi: 'text-xs',
      english: 'text-sm tracking-tight',
      desc: 'text-[9px]',
    },
    md: {
      hindi: 'text-sm',
      english: 'text-base tracking-tight',
      desc: 'text-[10px]',
    },
    lg: {
      hindi: 'text-base sm:text-lg',
      english: 'text-xl sm:text-2xl tracking-tight',
      desc: 'text-xs',
    },
  };

  const currentTextSize = textSizes[size];

  const content = (
    <div className="flex items-center gap-2.5 overflow-hidden">
      {renderGlyph()}
      <div className="flex flex-col min-w-0">
        <div className="flex items-baseline gap-1 leading-none">
          {/* Hindi logo accent */}
          <span
            className={`font-devanagari font-bold text-[#38BDF8] select-none ${currentTextSize.hindi}`}
            style={{ letterSpacing: '0.02em' }}
          >
            ऊर्जा
          </span>
          {/* English modern wordmark */}
          <span
            className={`font-display font-semibold text-white tracking-wide select-none ${currentTextSize.english}`}
          >
            Setu
          </span>
        </div>
        {showDescriptor && (
          <span
            className={`font-mono text-slate-400 font-medium tracking-wider uppercase mt-1 select-none truncate ${currentTextSize.desc}`}
          >
            India's Federated Grid Intelligence
          </span>
        )}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`group flex items-center transition-all text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#38BDF8] rounded-md ${className}`}
        aria-label="UrjaSetu — Return to home"
      >
        {content}
      </button>
    );
  }

  return <div className={`flex items-center ${className}`}>{content}</div>;
};
