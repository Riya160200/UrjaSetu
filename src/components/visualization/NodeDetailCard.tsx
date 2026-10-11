import type { GridNode } from '../../types/grid';
import { StatusIndicator } from '../common/StatusIndicator';
import { X, ShieldAlert, Cpu } from 'lucide-react';

interface NodeDetailCardProps {
  node: GridNode | null;
  onClose: () => void;
}

export const NodeDetailCard = ({ node, onClose }: NodeDetailCardProps) => {
  if (!node) return null;

  return (
    <div className="absolute bottom-4 left-4 z-20 max-w-[310px] w-full p-3.5 rounded-lg bg-[#07111F]/95 backdrop-blur-md border border-[#1A385E] shadow-2xl text-xs font-sans pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="flex items-start justify-between pb-2 border-b border-[#14263D]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0D223A] text-[#B8FF65] border border-[#193B61]">
              {node.region}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {node.code}
            </span>
          </div>
          <h3 className="text-sm font-bold text-white mt-1 leading-snug">
            {node.name}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#0E2036] transition-colors"
          title="Close node inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="py-2.5 space-y-2 border-b border-[#14263D] font-mono text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Node Status:</span>
          <StatusIndicator status={node.simulatedRisk} label={node.simulatedRisk.toUpperCase()} size="sm" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Sub-grid Voltage:</span>
          <span className="text-[#38BDF8] font-semibold">{node.voltageKV} kV AC/DC</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Simulated Load:</span>
          <span className="text-slate-100 font-semibold">{node.simulatedLoadGW} GW</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Active DISCOM Clients:</span>
          <span className="text-[#B8FF65] font-semibold">{node.activeDiscoms} Edge Nodes</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">DP Budget (ε expended):</span>
          <span className="text-slate-200">ε = {node.dpEpsilon.toFixed(2)} (δ=10⁻⁵)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Anomaly Anomaly Index:</span>
          <span className={node.anomalyScore > 0.2 ? 'text-[#EF4444] font-semibold' : 'text-[#B8FF65]'}>
            {(node.anomalyScore * 100).toFixed(1)}% ({node.anomalyScore > 0.2 ? 'ELEVATED' : 'NOMINAL'})
          </span>
        </div>
      </div>

      <p className="py-2 text-[11px] text-slate-300 font-sans leading-relaxed">
        {node.details}
      </p>

      <div className="pt-2 border-t border-[#14263D] flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-1">
          <Cpu className="w-3 h-3 text-[#38BDF8]" />
          <span>FEDERATED CLIENT</span>
        </div>
        <div className="flex items-center gap-1 text-[#B8FF65]">
          <ShieldAlert className="w-3 h-3" />
          <span>ZERO RAW LEAK</span>
        </div>
      </div>
    </div>
  );
};
