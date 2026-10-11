import { X, ShieldAlert, Filter } from 'lucide-react';
import type { GridRegionCode } from '../../types/grid';
import { GRID_REGIONS_CONFIG } from '../../constants/gridData';
import { StatusIndicator } from '../common/StatusIndicator';

export interface SelectedStateData {
  stateName: string;
  region: GridRegionCode;
  status: 'optimal' | 'warning' | 'alert' | 'syncing';
}

interface StateDetailCardProps {
  stateData: SelectedStateData | null;
  onClose: () => void;
  onFilterRegion: (region: GridRegionCode) => void;
  currentFilter: GridRegionCode | 'ALL';
}

export const StateDetailCard = ({
  stateData,
  onClose,
  onFilterRegion,
  currentFilter,
}: StateDetailCardProps) => {
  if (!stateData) return null;

  const regionConfig = GRID_REGIONS_CONFIG[stateData.region] || {
    name: 'National Grid',
    label: stateData.region,
    color: '#38BDF8',
    center: [82.5, 22.0] as const,
  };

  const isFiltered = currentFilter === stateData.region;

  return (
    <div className="absolute bottom-4 left-4 z-20 max-w-[310px] w-full p-3.5 rounded-lg bg-[#07111F]/95 backdrop-blur-md border border-[#1A385E] shadow-2xl text-xs font-sans pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="flex items-start justify-between pb-2 border-b border-[#14263D]">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#0D223A] text-[#B8FF65] border border-[#193B61]">
              {stateData.region}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {regionConfig.name}
            </span>
          </div>
          <h3 className="text-sm font-bold text-white mt-1 leading-snug">
            {stateData.stateName}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#0E2036] transition-colors"
          title="Close state inspector"
          aria-label="Close state inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="py-2.5 space-y-1.5 border-b border-[#14263D] font-mono text-[10px]">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Grid Status:</span>
          <StatusIndicator status={stateData.status} label={stateData.status.toUpperCase()} size="sm" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Synchronous Grid:</span>
          <span className="text-[#38BDF8] font-medium">{regionConfig.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Telemetry Stream:</span>
          <span className="text-slate-200">
            {stateData.status === 'alert' ? 'SIMULATED OUTAGE' : 'STABLE (SIMULATED)'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">DP Privacy Budget:</span>
          <span className="text-[#B8FF65]">ε ≤ 1.30 (δ=10⁻⁵)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Security Model:</span>
          <span className="text-slate-200">Federated Consensus</span>
        </div>
      </div>

      <div className="pt-2.5 flex items-center justify-between gap-2">
        <button
          onClick={() => onFilterRegion(stateData.region)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono transition-colors ${
            isFiltered
              ? 'bg-[#B8FF65]/20 text-[#B8FF65] border border-[#B8FF65]/40'
              : 'bg-[#0E2036] text-slate-300 hover:text-white border border-[#1B3554]'
          }`}
        >
          <Filter className="w-3 h-3" />
          <span>{isFiltered ? 'FILTER ACTIVE' : `FOCUS ${stateData.region} GRID`}</span>
        </button>

        <div className="flex items-center gap-1 text-[9px] font-mono text-slate-500">
          <ShieldAlert className="w-3 h-3 text-[#B8FF65]" />
          <span>SIMULATED</span>
        </div>
      </div>
    </div>
  );
};
