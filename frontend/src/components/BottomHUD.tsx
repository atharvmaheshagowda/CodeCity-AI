import React, { useState, useMemo } from 'react';
import {
  Activity,
  Layers,
  Flame,
  Clock,
  Zap,
  Target,
  Maximize2,
  Leaf,
  ShieldAlert,
  Sparkles,
  Radio,
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { ColorMode } from '../types';
import { soundFx } from '../utils/soundEffects';
import { LayersMenu } from './HUD/LayersMenu';
import { computeCityLayout, getBuildingColorHex } from '../utils/cityLayout';

export const BottomHUD: React.FC = () => {
  const {
    currentRepo,
    selectedFile,
    colorMode,
    lowPowerMode,
    presentationMode,
    selectFile,
    setColorMode,
    triggerCameraReset,
    toggleLowPowerMode,
    toggleInsights,
  } = useCityStore();

  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [minimapHovered, setMinimapHovered] = useState<string | null>(null);

  const colorModes: Array<{ id: ColorMode; label: string; icon: any }> = [
    { id: 'risk', label: 'Risk', icon: Activity },
    { id: 'complexity', label: 'Complexity', icon: Layers },
    { id: 'churn', label: 'Churn', icon: Flame },
    { id: 'age', label: 'Age', icon: Clock },
    { id: 'impact', label: 'Impact', icon: Zap },
    { id: 'contagion', label: 'Contagion', icon: ShieldAlert },
  ];

  // Live real city layout projection for the Radar Minimap
  const { buildings, districts, bounds } = useMemo(() => {
    return computeCityLayout(currentRepo?.files || []);
  }, [currentRepo]);

  const { spanX, spanZ, minX, minZ } = useMemo(() => {
    const sX = Math.max(16, bounds.maxX - bounds.minX);
    const sZ = Math.max(16, bounds.maxZ - bounds.minZ);
    return { spanX: sX, spanZ: sZ, minX: bounds.minX, minZ: bounds.minZ };
  }, [bounds]);

  if (presentationMode || !currentRepo) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 flex items-end justify-between px-4 md:px-6 z-20 select-none">
      {/* 1. Bottom-Left: Live Synchronized Radar Minimap */}
      <div className="pointer-events-auto glass-panel p-2.5 rounded-2xl border border-white/10 shadow-glass-panel backdrop-blur-2xl bg-slate-950/90 w-52">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 pb-1.5 px-0.5 border-b border-white/5 mb-1.5">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Radar Minimap</span>
          </span>
          <span className="text-[9px] text-slate-500 font-mono">
            {buildings.length} files
          </span>
        </div>

        {/* Real Live Projected 2D Radar Canvas */}
        <div className="relative w-full h-28 rounded-xl overflow-hidden bg-[#02050e] border border-cyan-500/20 relative group">
          {/* Circular Radar Range Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-24 h-24 rounded-full border border-cyan-500/15" />
            <div className="w-14 h-14 rounded-full border border-cyan-500/20" />
            <div className="w-5 h-5 rounded-full border border-cyan-500/30" />
            <div className="absolute w-full h-px bg-cyan-500/15" />
            <div className="absolute h-full w-px bg-cyan-500/15" />
          </div>

          {/* Sweeping Radar Scanner Line */}
          {!lowPowerMode && (
            <div
              className="absolute inset-0 pointer-events-none opacity-40 animate-spin"
              style={{
                animationDuration: '6s',
                background: 'conic-gradient(from 0deg at 50% 50%, rgba(6,182,212,0.3) 0deg, transparent 60deg, transparent 360deg)',
              }}
            />
          )}

          {/* District Boundary Outlines */}
          {districts.map((d) => {
            const left = Math.max(4, Math.min(92, 10 + ((d.x - d.width * 0.5 - minX) / spanX) * 80));
            const top = Math.max(4, Math.min(92, 10 + ((d.z - d.depth * 0.5 - minZ) / spanZ) * 80));
            const width = Math.max(12, Math.min(88, (d.width / spanX) * 80));
            const height = Math.max(12, Math.min(88, (d.depth / spanZ) * 80));

            return (
              <div
                key={`minimap-dist-${d.path}`}
                className="absolute border border-cyan-500/15 rounded bg-cyan-500/5 pointer-events-none"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                }}
              />
            );
          })}

          {/* Real Building Dots */}
          {buildings.map((b) => {
            const bx = b.x ?? 0;
            const bz = b.z ?? 0;
            const left = Math.max(6, Math.min(94, 10 + ((bx - minX) / spanX) * 80));
            const top = Math.max(6, Math.min(94, 10 + ((bz - minZ) / spanZ) * 80));

            const isSelected = selectedFile && (b.id === selectedFile.id || b.path === selectedFile.path);
            const isHovered = minimapHovered === b.id;
            const dotColor = getBuildingColorHex(b, colorMode);

            return (
              <div
                key={`minimap-dot-${b.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playClick();
                  selectFile(isSelected ? null : b);
                }}
                onMouseEnter={() => setMinimapHovered(b.id)}
                onMouseLeave={() => setMinimapHovered(null)}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-transform"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                }}
                title={`${b.filename} (${(b.risk_probability * 100).toFixed(0)}% risk)`}
              >
                {/* Active Selection Target Ring */}
                {isSelected && (
                  <div
                    className="absolute -inset-1.5 rounded-full border border-rose-400 animate-ping opacity-75"
                    style={{ borderColor: b.risk_probability >= 0.5 ? '#f43f5e' : '#38bdf8' }}
                  />
                )}

                {/* Building Dot */}
                <div
                  className={`rounded-full transition-all ${
                    isSelected
                      ? 'w-2.5 h-2.5 shadow-[0_0_8px_rgba(56,189,248,1)] border border-white'
                      : isHovered
                      ? 'w-2 h-2 scale-125'
                      : 'w-1.5 h-1.5'
                  }`}
                  style={{
                    backgroundColor: dotColor,
                    boxShadow: isSelected ? '0 0 8px currentColor' : undefined,
                  }}
                />
              </div>
            );
          })}

          {/* Hover Tooltip Overlay */}
          {minimapHovered && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-950/90 border border-cyan-500/40 text-[9px] font-mono text-cyan-300 pointer-events-none truncate max-w-[90%]">
              {buildings.find((b) => b.id === minimapHovered)?.filename}
            </div>
          )}
        </div>
      </div>

      {/* 2. Bottom-Center: Color Mode Switcher & Continuous Gradient Legend */}
      <div className="pointer-events-auto glass-panel px-4 py-2 rounded-2xl border border-white/10 flex flex-col items-center space-y-1.5 shadow-glass-panel backdrop-blur-2xl bg-slate-950/90">
        {/* Mode Selector Buttons */}
        <div className="flex items-center space-x-1">
          {colorModes.map(({ id, label, icon: Icon }) => {
            const isActive = colorMode === id;
            return (
              <button
                key={id}
                onClick={() => {
                  soundFx.playClick();
                  setColorMode(id);
                }}
                onMouseEnter={soundFx.playHoverTick}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-mono transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Continuous Horizontal Risk Gradient Legend */}
        <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400 w-full max-w-sm pt-0.5">
          <span className="shrink-0 text-slate-400">Lower Risk</span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-800 shadow-inner">
            <div
              className="w-full h-full rounded-full"
              style={{
                background:
                  'linear-gradient(to right, #10b981 0%, #34d399 25%, #facc15 50%, #f97316 75%, #ef4444 100%)',
              }}
            />
          </div>
          <span className="shrink-0 text-slate-400">Higher Risk</span>
        </div>
      </div>

      {/* 3. Bottom-Right: Quick Action Icons & Low Power Toggle */}
      <div className="pointer-events-auto flex flex-col items-end space-y-2">
        <div className="glass-panel p-1.5 rounded-2xl border border-white/10 flex items-center space-x-1 shadow-glass-panel backdrop-blur-2xl bg-slate-950/85">
          {/* Target / Focus Button */}
          <button
            onClick={() => {
              soundFx.playWhoosh();
              triggerCameraReset();
            }}
            onMouseEnter={soundFx.playHoverTick}
            className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/5 border border-transparent hover:border-cyan-500/30 transition-all"
            title="Focus & Center City View"
          >
            <Target className="w-4 h-4" />
          </button>

          {/* Insights Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              toggleInsights();
            }}
            onMouseEnter={soundFx.playHoverTick}
            className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/5 border border-transparent hover:border-cyan-500/30 transition-all"
            title="Open CodeCity Insights Dock"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Layers Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              setIsLayersOpen(!isLayersOpen);
            }}
            onMouseEnter={soundFx.playHoverTick}
            className={`p-2 rounded-xl transition-all border ${
              isLayersOpen
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-glow-cyan'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-white/5 border-transparent hover:border-cyan-500/30'
            }`}
            title="Toggle City Layers"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen?.();
              } else {
                document.exitFullscreen?.();
              }
            }}
            onMouseEnter={soundFx.playHoverTick}
            className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/5 border border-transparent hover:border-cyan-500/30 transition-all"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Low Power Mode Toggle Pill */}
        <button
          onClick={() => {
            soundFx.playClick();
            toggleLowPowerMode();
          }}
          onMouseEnter={soundFx.playHoverTick}
          className={`glass-panel px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center space-x-1.5 transition-all shadow-glass-panel backdrop-blur-2xl ${
            lowPowerMode
              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
              : 'bg-slate-950/85 text-slate-400 hover:text-slate-200 border-white/10'
          }`}
          title="Toggle Low Power Mode"
        >
          <Leaf className={`w-3.5 h-3.5 ${lowPowerMode ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span>Low Power</span>
        </button>

        {/* Floating Layers Dropdown Menu */}
        <LayersMenu isOpen={isLayersOpen} onClose={() => setIsLayersOpen(false)} />
      </div>
    </div>
  );
};
