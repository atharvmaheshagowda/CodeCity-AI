import React from 'react';
import {
  Activity,
  Layers,
  Flame,
  Clock,
  Zap,
  Target,
  Maximize2,
  Minimize2,
  Leaf,
  X,
  Expand,
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { ColorMode } from '../types';
import { soundFx } from '../utils/soundEffects';

export const BottomHUD: React.FC = () => {
  const {
    currentRepo,
    colorMode,
    lowPowerMode,
    presentationMode,
    setColorMode,
    triggerCameraReset,
    toggleLowPowerMode,
    togglePresentationMode,
  } = useCityStore();

  const colorModes: Array<{ id: ColorMode; label: string; icon: any }> = [
    { id: 'risk', label: 'Risk', icon: Activity },
    { id: 'complexity', label: 'Complexity', icon: Layers },
    { id: 'churn', label: 'Churn', icon: Flame },
    { id: 'age', label: 'Age', icon: Clock },
    { id: 'impact', label: 'Impact', icon: Zap },
  ];

  if (presentationMode || !currentRepo) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 flex items-end justify-between px-6 z-20 select-none">
      {/* 1. Bottom-Left: Floating "City Overview" Diorama Thumbnail Panel */}
      <div className="pointer-events-auto glass-panel p-2.5 rounded-2xl border border-white/10 shadow-glass-panel backdrop-blur-2xl bg-slate-950/85 w-48">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 pb-1.5 px-0.5">
          <span className="font-semibold text-slate-200">City Overview</span>
          <Expand className="w-3 h-3 text-slate-400 cursor-pointer hover:text-white" />
        </div>

        {/* Isometric Diorama Mini-Preview */}
        <div className="relative w-full h-24 rounded-xl overflow-hidden bg-[#030712] border border-white/5 flex items-center justify-center">
          {/* Stylized 3D perspective grid representation */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(56,189,248,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(56,189,248,0.2) 1px, transparent 1px)',
              backgroundSize: '14px 14px',
              transform: 'perspective(180px) rotateX(45deg) scale(1.4)',
            }}
          />

          {/* Central Glowing Red Building */}
          <div className="absolute w-5 h-9 bg-rose-500 rounded-sm shadow-[0_0_15px_rgba(244,63,94,0.9)] z-10 animate-pulse border border-rose-300/60" />

          {/* Surrounding Cyan and Amber Buildings */}
          <div className="absolute -left-6 bottom-4 w-4 h-6 bg-cyan-500/80 rounded-sm shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
          <div className="absolute left-6 top-3 w-4 h-7 bg-cyan-600/70 rounded-sm shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
          <div className="absolute -right-5 bottom-5 w-4 h-5 bg-teal-500/70 rounded-sm shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
          <div className="absolute -left-3 top-2 w-3 h-5 bg-amber-500/70 rounded-sm shadow-[0_0_8px_rgba(245,158,11,0.5)]" />

          {/* Glowing Cyan Connecting Conduits */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 80">
            <path d="M 50 40 Q 25 35 25 55" fill="none" stroke="#38bdf8" strokeWidth="1.5" className="opacity-80" />
            <path d="M 50 40 Q 75 35 75 55" fill="none" stroke="#38bdf8" strokeWidth="1.5" className="opacity-80" />
            <path d="M 50 40 Q 70 20 70 25" fill="none" stroke="#38bdf8" strokeWidth="1.5" className="opacity-80" />
          </svg>
        </div>
      </div>

      {/* 2. Bottom-Center: Color Mode Switcher & Continuous Gradient Legend */}
      <div className="pointer-events-auto glass-panel px-4 py-2.5 rounded-2xl border border-white/10 flex flex-col items-center space-y-2 shadow-glass-panel backdrop-blur-2xl bg-slate-950/90">
        {/* Mode Selector Buttons */}
        <div className="flex items-center space-x-1.5">
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
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-mono transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Continuous Horizontal Risk Gradient Legend */}
        <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400 w-full max-w-md pt-1">
          <span className="shrink-0 text-slate-400">Lower Risk</span>
          <div className="flex-1 h-2 rounded-full overflow-hidden bg-slate-800 shadow-inner">
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
        {/* 3 Square Action Buttons */}
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

          {/* Layers Button */}
          <button
            onClick={() => soundFx.playHoverTick()}
            className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/5 border border-transparent hover:border-cyan-500/30 transition-all"
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
          <span>Low Power Mode</span>
        </button>
      </div>
    </div>
  );
};
