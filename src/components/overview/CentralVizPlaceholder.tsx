import {
  Globe,
  Compass,
  Layers,
  Zap,
  Shield,
  Maximize2,
  Crosshair,
  Radio,
} from 'lucide-react';

export const CentralVizPlaceholder = () => {
  return (
    <div className="relative flex-1 min-h-[460px] lg:min-h-[520px] rounded-lg border border-[#14263D] bg-[#07111E] overflow-hidden flex flex-col justify-between group shadow-2xl">
      {/* Background technical grid pattern with subtle cyan/lime radial vignette */}
      <div className="absolute inset-0 grid-mesh-bg opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,35,60,0.6)_0%,rgba(5,11,20,0.95)_80%)] pointer-events-none" />

      {/* Top Overlay Bar inside viewport */}
      <div className="relative z-10 flex items-center justify-between p-4 border-b border-[#14243A]/80 bg-[#060E1A]/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0A1828] border border-[#1A3350]">
            <Radio className="w-3.5 h-3.5 text-[#B8FF65] animate-pulse" />
            <span className="text-[11px] font-mono font-medium text-slate-200">
              NATIONAL SYNCHRONOUS MESH
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            PROJECTION: WGS84 ORTHO • VIEWPORT: SUB-CONTINENTAL
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span className="px-2 py-0.5 rounded bg-[#0B1A2C] border border-[#1A304C] text-[#38BDF8]">
            CAMERA: 22.5°N, 82.0°E
          </span>
          <button
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#0F2238] transition-colors"
            title="Expand Viewport"
            aria-label="Expand Viewport"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Centerpiece Stage: Placeholder Graphics with Technical HUD */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
        {/* Subtle decorative concentric HUD radar rings */}
        <div className="relative flex items-center justify-center mb-6">
          {/* Outer ring */}
          <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-full border border-dashed border-[#1B3554]/60 flex items-center justify-center animate-[spin_60s_linear_infinite]" />
          
          {/* Middle ring */}
          <div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-[#214268]/50 flex items-center justify-center" />
          
          {/* Inner ring */}
          <div className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-[#B8FF65]/20 bg-[#0A182B]/60 flex items-center justify-center glow-lime-sm" />
          
          {/* Crosshairs */}
          <div className="absolute w-52 sm:w-64 h-[1px] bg-gradient-to-r from-transparent via-[#38BDF8]/40 to-transparent" />
          <div className="absolute h-52 sm:h-64 w-[1px] bg-gradient-to-b from-transparent via-[#38BDF8]/40 to-transparent" />

          {/* Central Target Icon */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <Globe className="w-10 h-10 sm:w-12 sm:h-12 text-[#B8FF65] drop-shadow-[0_0_12px_rgba(184,255,101,0.5)]" />
            <Crosshair className="absolute w-6 h-6 text-[#38BDF8] animate-spin [animation-duration:15s]" />
          </div>
        </div>

        {/* Title and Step 2 Notice */}
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B8FF65]/10 border border-[#B8FF65]/30 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#B8FF65] animate-ping" />
            <span className="text-xs font-mono font-semibold tracking-wider text-[#B8FF65]">
              STEP 2 CANVAS RESERVATION
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            3D India Grid Visualization — Coming Next
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
            Reserved viewport for the interactive 3D sub-continental grid mesh. In the next step, this space will host the five synchronous regional grids (NR • WR • SR • ER • NER), high-voltage corridor routing, real-time edge node consensus, and privacy-preserving anomaly clustering.
          </p>
        </div>

        {/* Technical Specification Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0A1828] border border-[#162E4A] text-slate-300">
            <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>GEO-CENTER: 20.59° N, 78.96° E</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0A1828] border border-[#162E4A] text-slate-300">
            <Layers className="w-3.5 h-3.5 text-[#B8FF65]" />
            <span>5 SYNCHRONOUS REGIONS</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0A1828] border border-[#162E4A] text-slate-300">
            <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>765kV / 400kV CORRIDORS</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0A1828] border border-[#162E4A] text-slate-300">
            <Shield className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>DP LOCAL MESH ENCLAVE</span>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar inside viewport */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 p-3 border-t border-[#14243A]/80 bg-[#060E1A]/80 backdrop-blur-sm font-mono text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8FF65]" />
            SHADER PIPELINE: IDLE
          </span>
          <span className="hidden md:inline text-slate-400">•</span>
          <span className="hidden md:inline text-slate-400">
            CLIENT PARTICIPATION: 18/18 DISCOMS ACTIVE
          </span>
        </div>

        <div className="text-slate-400 text-[10px] tracking-wide">
          [SIMULATION BENCHMARK DATASET — NO LIVE UTILITY SECRETS]
        </div>
      </div>

      {/* Corner Bracket Accents for aerospace/command center feel */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#1E3B60] pointer-events-none" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#1E3B60] pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#1E3B60] pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#1E3B60] pointer-events-none" />
    </div>
  );
};
