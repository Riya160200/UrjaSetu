interface StatusIndicatorProps {
  status: 'optimal' | 'syncing' | 'warning' | 'alert' | 'standby';
  label?: string;
  sublabel?: string;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusIndicator = ({
  status,
  label,
  sublabel,
  pulse = true,
  size = 'md',
}: StatusIndicatorProps) => {
  const getColors = () => {
    switch (status) {
      case 'optimal':
        return {
          dot: 'bg-[#B8FF65]',
          glow: 'shadow-[0_0_8px_rgba(184,255,101,0.6)]',
          text: 'text-[#B8FF65]',
          bg: 'bg-[#B8FF65]/10',
          border: 'border-[#B8FF65]/30',
        };
      case 'syncing':
        return {
          dot: 'bg-[#38BDF8]',
          glow: 'shadow-[0_0_8px_rgba(56,189,248,0.6)]',
          text: 'text-[#38BDF8]',
          bg: 'bg-[#38BDF8]/10',
          border: 'border-[#38BDF8]/30',
        };
      case 'warning':
        return {
          dot: 'bg-[#F59E0B]',
          glow: 'shadow-[0_0_8px_rgba(245,158,11,0.6)]',
          text: 'text-[#F59E0B]',
          bg: 'bg-[#F59E0B]/10',
          border: 'border-[#F59E0B]/30',
        };
      case 'alert':
        return {
          dot: 'bg-[#EF4444]',
          glow: 'shadow-[0_0_8px_rgba(239,68,68,0.6)]',
          text: 'text-[#EF4444]',
          bg: 'bg-[#EF4444]/10',
          border: 'border-[#EF4444]/30',
        };
      case 'standby':
      default:
        return {
          dot: 'bg-slate-400',
          glow: '',
          text: 'text-slate-400',
          bg: 'bg-slate-800/40',
          border: 'border-slate-700/50',
        };
    }
  };

  const colors = getColors();
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span className="relative flex items-center justify-center">
        {pulse && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${colors.dot}`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full ${sizeClasses[size]} ${colors.dot} ${colors.glow}`}
        />
      </span>
      {label && (
        <span className="text-xs font-medium tracking-wide text-slate-200">
          {label}
        </span>
      )}
      {sublabel && (
        <span className="text-[11px] font-mono text-slate-400">
          {sublabel}
        </span>
      )}
    </div>
  );
};
