import React from 'react';
import {
  Boxes,
  Play,
  Pause,
  Award,
  FolderGit2,
  Activity,
  Layers,
  Flame,
  Clock,
  Zap,
  Settings,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { ColorMode } from '../types';
import { soundFx } from '../utils/soundEffects';

export const Navbar: React.FC = () => {
  const {
    repos,
    currentRepo,
    colorMode,
    presentationMode,
    isLeftPanelCollapsed,
    loadRepo,
    setColorMode,
    togglePresentationMode,
    toggleLeftPanel,
    openModelCard,
    toggleOnboarding,
  } = useCityStore();

  const colorModes: Array<{ id: ColorMode; label: string; icon: any; key: string }> = [
    { id: 'risk', label: 'Risk', icon: Activity, key: '1' },
    { id: 'complexity', label: 'Complexity', icon: Layers, key: '2' },
    { id: 'churn', label: 'Churn', icon: Flame, key: '3' },
    { id: 'age', label: 'Age', icon: Clock, key: '4' },
    { id: 'impact', label: 'Impact', icon: Zap, key: '5' },
  ];

  return (
    <header className="h-16 glass-panel border-b border-white/10 px-4 md:px-5 flex items-center justify-between z-30 select-none shadow-glass-panel backdrop-blur-2xl bg-slate-950/90">
      {/* 1. Left: Brand Identity with Logo, Version, Status, and Tagline Subtitle */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => {
            soundFx.playClick();
            toggleLeftPanel();
          }}
          onMouseEnter={soundFx.playHoverTick}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all"
          title={isLeftPanelCollapsed ? 'Expand Panel' : 'Collapse Panel'}
        >
          {isLeftPanelCollapsed ? <PanelLeftOpen className="w-4 h-4 text-cyan-400" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        <div className="flex items-center space-x-2.5">
          {/* Hexagonal Cyber Glowing Icon */}
          <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center shadow-glow-cyan">
            <Boxes className="w-4 h-4 text-cyan-400" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1 font-display">
                CodeCity <span className="text-cyan-400 font-mono font-bold">AI</span>
              </h1>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-1.5 py-0.2 rounded border border-white/10">
                v1.0
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-900/60 px-2 py-0.2 rounded-full border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Offline Ready</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400/80 font-sans tracking-tight hidden md:block">
              See where your code will break next, and what breaks with it.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Center: Repository Selector & Inline Color Modes */}
      <div className="flex items-center space-x-3">
        {/* Repo Selector Pill */}
        <div className="flex items-center space-x-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-white/10 text-xs shadow-inner">
          <FolderGit2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <select
            id="nav-repo-select"
            value={currentRepo?.repo_id || ''}
            onChange={(e) => {
              soundFx.playClick();
              loadRepo(e.target.value);
            }}
            className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none cursor-pointer max-w-[190px] sm:max-w-[270px] truncate"
          >
            {repos.map((r) => (
              <option key={r.id} value={r.id} className="bg-slate-950 text-slate-200 font-mono">
                {r.name} ({r.summary?.total_files || 0} files)
              </option>
            ))}
          </select>
        </div>

        {/* Inline Color Modes Switcher */}
        <div className="hidden lg:flex items-center space-x-1 bg-slate-900/70 p-1 rounded-xl border border-white/10 text-xs">
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
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Right: Action Controls (Exhibition, Model Card, Settings, Dark Theme) */}
      <div className="flex items-center space-x-2">
        {/* Exhibition Mode Toggle */}
        <button
          id="nav-exhibition-btn"
          onClick={() => {
            soundFx.playClick();
            togglePresentationMode();
          }}
          onMouseEnter={soundFx.playHoverTick}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            presentationMode
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-glow-rose'
              : 'bg-slate-900/80 text-slate-300 border-white/15 hover:border-cyan-500/40 hover:text-white'
          }`}
          title="Toggle Exhibition Mode"
        >
          {presentationMode ? <Pause className="w-3.5 h-3.5 text-rose-400" /> : <Play className="w-3.5 h-3.5 text-cyan-400" />}
          <span className="font-sans">Exhibition</span>
        </button>

        {/* Model Card Modal */}
        <button
          id="nav-model-card-btn"
          onClick={() => {
            soundFx.playClick();
            openModelCard();
          }}
          onMouseEnter={soundFx.playHoverTick}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900/80 text-slate-300 border border-white/15 hover:border-cyan-500/40 hover:text-white transition-all"
          title="View Model Card & Zero-Leakage Benchmark"
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-sans">Model Card</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            toggleOnboarding();
          }}
          onMouseEnter={soundFx.playHoverTick}
          className="p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-white/10 hover:border-white/20 transition-all"
          title="Settings & Shortcuts"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Theme / Moon Button */}
        <button
          onClick={() => soundFx.playHoverTick()}
          className="p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-cyan-400 border border-white/10 hover:border-cyan-500/30 transition-all"
          title="Theme Toggle"
        >
          <Moon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
