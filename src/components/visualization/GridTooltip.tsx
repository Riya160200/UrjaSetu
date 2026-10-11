import type { HoveredEntity } from '../../types/grid';
import { StatusIndicator } from '../common/StatusIndicator';

interface GridTooltipProps {
  hovered: HoveredEntity | null;
}

export const GridTooltip = ({ hovered }: GridTooltipProps) => {
  if (!hovered) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2"
      style={{
        left: `${hovered.x}px`,
        top: `${hovered.y - 10}px`,
      }}
    >
      <div className="px-2.5 py-1.5 rounded-md bg-[#07111F]/90 backdrop-blur-md border border-[#1A385E] shadow-[0_6px_20px_rgba(0,0,0,0.6)] text-xs font-sans max-w-[220px] pointer-events-none animate-in fade-in zoom-in-95 duration-75">
        <div className="flex items-center gap-1.5">
          <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-[#0D223A] text-[#B8FF65] border border-[#193B61]">
            {hovered.region}
          </span>
          <span className="font-semibold text-slate-100 text-[11px] truncate">
            {hovered.title}
          </span>
          <div className="ml-auto pl-1">
            <StatusIndicator status={hovered.status} size="sm" pulse={false} />
          </div>
        </div>

        {hovered.metrics.length > 0 && (
          <div className="mt-1 flex items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
            <span className="text-slate-500">{hovered.metrics[0].label}:</span>
            <span className="text-[#38BDF8] font-medium">{hovered.metrics[0].value}</span>
          </div>
        )}

        <div className="mt-1 text-[8px] font-mono text-slate-500 flex items-center justify-between">
          <span>{hovered.type === 'node' ? 'GRID NODE' : 'STATE BOUNDARY'}</span>
          <span className="text-[#38BDF8]">CLICK TO INSPECT</span>
        </div>
      </div>
    </div>
  );
};
