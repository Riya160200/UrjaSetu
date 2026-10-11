import React from 'react';
import type { NavItem } from '../../types';
import {
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';


interface SectionPlaceholderProps {
  item: NavItem;
  onBackToOverview: () => void;
}

export const SectionPlaceholder: React.FC<SectionPlaceholderProps> = ({
  item,
  onBackToOverview,
}) => {
  const Icon = item.icon;

  const renderModuleContent = () => {
    switch (item.id) {
      case 'grid-regions':
        return (
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { code: 'NR', name: 'Northern Grid', states: 'Delhi, Punjab, Haryana, UP, Rajasthan, J&K, Ladakh', discoms: 5, freq: '50.01 Hz', load: '68.2 GW', status: 'optimal' },
                { code: 'WR', name: 'Western Grid', states: 'Maharashtra, Gujarat, MP, Chhattisgarh, Goa', discoms: 4, freq: '49.98 Hz', load: '74.5 GW', status: 'optimal' },
                { code: 'SR', name: 'Southern Grid', states: 'Karnataka, Tamil Nadu, Andhra, Telangana, Kerala', discoms: 4, freq: '50.02 Hz', load: '58.9 GW', status: 'syncing' },
                { code: 'ER', name: 'Eastern Grid', states: 'West Bengal, Bihar, Jharkhand, Odisha', discoms: 3, freq: '50.00 Hz', load: '32.1 GW', status: 'optimal' },
                { code: 'NER', name: 'North-Eastern Grid', states: 'Assam, Meghalaya, Tripura, Manipur, Nagaland, Arunachal', discoms: 2, freq: '50.03 Hz', load: '4.8 GW', status: 'optimal' },
              ].map((r) => (
                <div key={r.code} className="p-4 rounded-xl bg-[#071324] border border-[#142842] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-bold text-[#38BDF8] px-2 py-0.5 rounded bg-[#38BDF8]/10 border border-[#38BDF8]/30">
                        {r.code}
                      </span>
                      <span className="text-[10px] font-mono text-[#B8FF65] uppercase">
                        {r.status === 'optimal' ? 'SYNCHRONIZED' : 'WEIGHT AGGREGATION'}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-white text-base mb-1">{r.name}</h3>
                    <p className="text-xs text-slate-400 font-sans mb-3 line-clamp-2">{r.states}</p>
                  </div>
                  <div className="pt-3 border-t border-[#122338] grid grid-cols-3 text-center text-[10px] font-mono text-slate-400">
                    <div>
                      <div className="text-slate-500">CLIENTS</div>
                      <div className="text-slate-200 font-semibold">{r.discoms} DISCOMs</div>
                    </div>
                    <div>
                      <div className="text-slate-500">FREQUENCY</div>
                      <div className="text-slate-200 font-semibold">{r.freq}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">SIM LOAD</div>
                      <div className="text-[#38BDF8] font-semibold">{r.load}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[#071324] border border-[#142842]">
              <h4 className="font-mono text-xs text-slate-400 uppercase tracking-wider mb-2">
                Simulated Grid Hierarchy Notice
              </h4>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Real administrative boundaries (DataMeet / Survey of India ADM1) define regional boundaries. Edge node clients represent simulated DISCOM distribution substations running local anomaly-detection models.
              </p>
            </div>
          </div>
        );

      case 'meter-intelligence':
        return (
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#071324] border border-[#142842]">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Simulated Smart Meters</div>
                <div className="text-2xl font-mono font-bold text-white mt-1">1,248,000</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">15-minute interval streaming</div>
              </div>
              <div className="p-4 rounded-xl bg-[#071324] border border-[#142842]">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Flagged Consumption Variances</div>
                <div className="text-2xl font-mono font-bold text-[#F59E0B] mt-1">42 Anomaly Events</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">Non-IID reconstruction threshold</div>
              </div>
              <div className="p-4 rounded-xl bg-[#071324] border border-[#142842]">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Data Quality Integrity</div>
                <div className="text-2xl font-mono font-bold text-[#B8FF65] mt-1">99.94%</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">Zero raw data transmitted</div>
              </div>
            </div>

            {/* Simulated Meter Inspection Table */}
            <div className="rounded-xl border border-[#142842] bg-[#071324] overflow-hidden">
              <div className="p-4 border-b border-[#14243A] flex items-center justify-between">
                <h3 className="font-display font-semibold text-white text-sm">
                  Active Anomaly Candidates (Simulated Feeder Streams)
                </h3>
                <span className="text-[10px] font-mono text-slate-400 bg-[#0A1A2E] px-2 py-0.5 rounded border border-[#142842]">
                  HUMAN REVIEW REQUIRED
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#050D18] text-[10px] font-mono text-slate-400 uppercase border-b border-[#14243A]">
                    <tr>
                      <th className="p-3">Feeder ID</th>
                      <th className="p-3">Region</th>
                      <th className="p-3">Discom Node</th>
                      <th className="p-3">Variance Type</th>
                      <th className="p-3">Local Risk Score</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#102238] text-slate-300 font-mono text-xs">
                    {[
                      { id: 'FDR-ND-402', reg: 'NR', discom: 'BRPL Delhi', type: 'Sudden Night Valley', score: '0.94', status: 'Investigating' },
                      { id: 'FDR-MH-118', reg: 'WR', discom: 'MSEDCL Pune', type: 'Continuous Baseline Drop', score: '0.88', status: 'Review Queued' },
                      { id: 'FDR-KA-305', reg: 'SR', discom: 'BESCOM Bangalore', type: 'Solar Net Inversion', score: '0.72', status: 'Flagged' },
                      { id: 'FDR-WB-092', reg: 'ER', discom: 'WBSEDCL Kolkata', type: 'Periodic Shunt Pattern', score: '0.81', status: 'Investigating' },
                    ].map((row) => (
                      <tr key={row.id} className="hover:bg-[#0A192C] transition-colors">
                        <td className="p-3 font-bold text-white">{row.id}</td>
                        <td className="p-3 text-[#38BDF8]">{row.reg}</td>
                        <td className="p-3 font-sans text-slate-400">{row.discom}</td>
                        <td className="p-3 font-sans text-slate-300">{row.type}</td>
                        <td className="p-3 text-[#F59E0B] font-bold">{row.score}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#050D18] border border-[#14263E] text-xs text-slate-400 font-sans leading-relaxed">
              <strong className="text-white">Fairness & Due Process Caveat: </strong>
              Algorithmic risk scores identify statistical consumption deviations and do not constitute legal proof of electricity theft or justify automated disconnection.
            </div>
          </div>
        );

      case 'fl-lab':
        return (
          <div className="space-y-6 text-left">
            <div className="p-5 rounded-xl bg-[#071324] border border-[#142842]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#14243A]">
                <div>
                  <div className="text-[10px] font-mono text-[#38BDF8] uppercase tracking-wider">
                    Orchestrator Protocol: DP-FedAvg
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white mt-0.5">
                    Federated Round Coordination (#48 / 100)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-[#B8FF65]/10 text-[#B8FF65] text-xs font-mono font-semibold border border-[#B8FF65]/30">
                    ROUND 48 RUNNING
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-5">
                <div className="p-3 rounded-lg bg-[#050D18] border border-[#122338]">
                  <div className="text-[10px] font-mono text-slate-400">PARTICIPATING CLIENTS</div>
                  <div className="text-xl font-mono font-bold text-white mt-1">18 / 18</div>
                  <div className="text-[10px] text-[#B8FF65] font-mono">100% QUORUM</div>
                </div>
                <div className="p-3 rounded-lg bg-[#050D18] border border-[#122338]">
                  <div className="text-[10px] font-mono text-slate-400">L2 CLIPPING NORM</div>
                  <div className="text-xl font-mono font-bold text-[#38BDF8] mt-1">C = 1.0</div>
                  <div className="text-[10px] text-slate-500 font-mono">BOUNDED GRADIENTS</div>
                </div>
                <div className="p-3 rounded-lg bg-[#050D18] border border-[#122338]">
                  <div className="text-[10px] font-mono text-slate-400">NOISE SCALE (σ)</div>
                  <div className="text-xl font-mono font-bold text-[#B8FF65] mt-1">0.85</div>
                  <div className="text-[10px] text-slate-500 font-mono">GAUSSIAN MECHANISM</div>
                </div>
                <div className="p-3 rounded-lg bg-[#050D18] border border-[#122338]">
                  <div className="text-[10px] font-mono text-slate-400">COMMUNICATION PAYLOAD</div>
                  <div className="text-xl font-mono font-bold text-white mt-1">2.4 MB</div>
                  <div className="text-[10px] text-slate-500 font-mono">PER CLIENT ROUND</div>
                </div>
              </div>

              {/* Aggregation Steps */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-mono text-slate-400 uppercase">Synchronous Round Lifecycle</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-sans">
                  <div className="p-2.5 rounded bg-[#0A1A2E] border border-[#162D4A] text-slate-300">
                    <span className="font-mono text-[#38BDF8] font-bold mr-1.5">1.</span>
                    Global Model Broadcast
                  </div>
                  <div className="p-2.5 rounded bg-[#0A1A2E] border border-[#162D4A] text-slate-300">
                    <span className="font-mono text-[#38BDF8] font-bold mr-1.5">2.</span>
                    Local SGD on Edge Discom
                  </div>
                  <div className="p-2.5 rounded bg-[#0A1A2E] border border-[#162D4A] text-slate-300">
                    <span className="font-mono text-[#B8FF65] font-bold mr-1.5">3.</span>
                    Differential Noise & Clip
                  </div>
                  <div className="p-2.5 rounded bg-[#0B223D] border border-[#38BDF8]/40 text-white font-medium">
                    <span className="font-mono text-[#38BDF8] font-bold mr-1.5">4.</span>
                    Federated Averaging
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'experiments':
        return (
          <div className="space-y-6 text-left">
            <div className="rounded-xl border border-[#142842] bg-[#071324] overflow-hidden">
              <div className="p-4 border-b border-[#14243A] flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold text-white text-sm">
                    Benchmarking Architecture: Centralized vs. Local vs. Federated
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Computed across synthetic non-IID electricity consumer benchmarks.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#38BDF8] bg-[#38BDF8]/10 px-2.5 py-1 rounded border border-[#38BDF8]/30">
                  REPRODUCIBLE RUNS
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#050D18] text-[10px] font-mono text-slate-400 uppercase border-b border-[#14243A]">
                    <tr>
                      <th className="p-3">Training Paradigm</th>
                      <th className="p-3">Privacy Guarantee</th>
                      <th className="p-3">F1 Score</th>
                      <th className="p-3">ROC-AUC</th>
                      <th className="p-3">Raw Data Exposure</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#102238] text-slate-300 font-mono text-xs">
                    <tr className="hover:bg-[#0A192C]">
                      <td className="p-3 font-bold text-white font-sans">Centralized Baseline</td>
                      <td className="p-3 text-slate-400">None (Full Ingestion)</td>
                      <td className="p-3 text-slate-200">0.952</td>
                      <td className="p-3 text-slate-200">0.978</td>
                      <td className="p-3 text-[#EF4444] font-bold">100% (High Leak Risk)</td>
                      <td className="p-3 text-slate-400">Theoretical Upper Bound</td>
                    </tr>
                    <tr className="hover:bg-[#0A192C]">
                      <td className="p-3 font-bold text-white font-sans">Isolated Local Training</td>
                      <td className="p-3 text-slate-400">High (Isolated)</td>
                      <td className="p-3 text-slate-200">0.764</td>
                      <td className="p-3 text-slate-200">0.812</td>
                      <td className="p-3 text-[#B8FF65]">0% (Local Only)</td>
                      <td className="p-3 text-slate-400">Severe Non-IID Bias</td>
                    </tr>
                    <tr className="hover:bg-[#0A192C] bg-[#0A1D33]/40">
                      <td className="p-3 font-bold text-[#38BDF8] font-sans">UrjaSetu FedAvg (Standard)</td>
                      <td className="p-3 text-slate-200">Gradients Only</td>
                      <td className="p-3 text-white font-bold">0.948</td>
                      <td className="p-3 text-white font-bold">0.969</td>
                      <td className="p-3 text-[#B8FF65] font-bold">0% (Zero Raw Telemetry)</td>
                      <td className="p-3 text-[#38BDF8]">Near Centralized Parity</td>
                    </tr>
                    <tr className="hover:bg-[#0A192C] bg-[#0A1D33]/70">
                      <td className="p-3 font-bold text-[#B8FF65] font-sans">UrjaSetu DP-FedAvg (Production)</td>
                      <td className="p-3 text-[#B8FF65] font-bold">ε = 1.28, δ = 10⁻⁵</td>
                      <td className="p-3 text-white font-bold">0.941</td>
                      <td className="p-3 text-white font-bold">0.962</td>
                      <td className="p-3 text-[#B8FF65] font-bold">0% (DP-Guaranteed)</td>
                      <td className="p-3 text-[#B8FF65] font-bold">Active Protocol</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 rounded-xl border border-[#142842] bg-[#071324] text-center max-w-2xl mx-auto w-full my-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0C1E34] border border-[#183658] flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
              <Icon className="w-7 h-7 text-[#38BDF8]" />
            </div>
            <h2 className="font-display text-lg font-bold text-white mb-2">
              {item.label} Module Initialized
            </h2>
            <p className="text-xs text-slate-400 font-sans max-w-md mb-6 leading-relaxed">
              {item.description}. Privacy-preserving cryptographic enclaves and simulated telemetry schemas are mapped for this operational view.
            </p>
            <div className="p-3 rounded-lg bg-[#050D18] border border-[#122338] text-[11px] font-mono text-slate-500 w-full flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-[#38BDF8]" />
                URJASETU PROTOCOL
              </span>
              <span className="text-[#B8FF65]">SIMULATED BENCHMARK MODE</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-5 sm:p-6 space-y-5 bg-[#050B14]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#14243A]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToOverview}
            className="p-2 rounded-lg bg-[#071324] border border-[#142842] text-slate-400 hover:text-white hover:border-[#1E3A60] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#38BDF8]"
            title="Return to National Overview"
            aria-label="Return to National Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
                {item.label}
              </h1>
              {item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-mono text-[#38BDF8] bg-[#38BDF8]/10 rounded border border-[#38BDF8]/30 font-semibold">
                  {item.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              {item.description}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 px-2.5 py-1 rounded-lg bg-[#071324] border border-[#142842]">
            ACADEMIC RESEARCH SANDBOX
          </span>
        </div>
      </div>

      {/* Dynamic Module Content */}
      <div className="flex-1 min-h-0">
        {renderModuleContent()}
      </div>
    </div>
  );
};
