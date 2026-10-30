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
  ShieldAlert,
  Sparkles,
  LayoutGrid,
  GitCompare,
  Terminal,
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
    isInsightsOpen,
    smellsResult,
    loadRepo,
    setColorMode,
    togglePresentationMode,
    toggleLeftPanel,
    toggleInsights,
    openModelCard,
    toggleOnboarding,
    toggleScatterPlot,
    toggleTerminalLog,
    toggleRepoComparison,
    isScatterPlotOpen,
    isTerminalLogOpen,
    isRepoComparisonOpen,
    theme,
    toggleTheme,
  } = useCityStore();

  const colorModes: Array<{ id: ColorMode; label: string; icon: any; key: string }> = [
    { id: 'risk', label: 'Risk', icon: Activity, key: '1' },
    { id: 'complexity', label: 'Complexity', icon: Layers, key: '2' },
    { id: 'churn', label: 'Churn', icon: Flame, key: '3' },
    { id: 'age', label: 'Age', icon: Clock, key: '4' },
    { id: 'impact', label: 'Impact', icon: Zap, key: '5' },
    { id: 'contagion', label: 'Contagion', icon: ShieldAlert, key: '6' },
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

      {/* 3. Right: Action Controls (Insights, Matrix, Compare, Terminal, Exhibition, Model Card, Settings, Dark Theme) */}
      <div className="flex items-center space-x-2">
        {/* Insights Dock Toggle Button */}
        <button
          id="nav-insights-btn"
          onClick={() => {
            soundFx.playClick();
            toggleInsights();
          }}
          onMouseEnter={soundFx.playHoverTick}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            isInsightsOpen
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-glow-cyan'
              : 'bg-slate-900/80 text-slate-300 border-white/15 hover:border-cyan-500/40 hover:text-white'
          }`}
          title="Open Intelligence & Impact Dock"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-sans">Insights</span>
          {smellsResult && smellsResult.total_smells > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/30 text-rose-300 font-mono">
              {smellsResult.total_smells}
            </span>
          )}
        </button>

        {/* Hotspot Scatter Matrix Toggle */}
        <button
          id="nav-matrix-btn"
          onClick={() => {
            soundFx.playClick();
            toggleScatterPlot();
          }}
          onMouseEnter={soundFx.playHoverTick}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            isScatterPlotOpen
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-glow-cyan'
              : 'bg-slate-900/80 text-slate-300 border-white/15 hover:border-cyan-500/40 hover:text-white'
          }`}
          title="2D Complexity vs Churn Hotspot Scatter Matrix"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-sans hidden md:inline">Matrix</span>
        </button>

        {/* Dual Repo Comparison */}
        <button
          id="nav-compare-btn"
          onClick={() => {
            soundFx.playClick();
            toggleRepoComparison();
          }}
          onMouseEnter={soundFx.playHoverTick}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            isRepoComparisonOpen
              ? 'bg-violet-500/20 text-violet-300 border-violet-400/60 shadow-[0_0_12px_rgba(167,139,250,0.5)]'
              : 'bg-slate-900/80 text-slate-300 border border-white/15 hover:border-violet-500/40 hover:text-white'
          }`}
          title="Compare with another repository"
        >
          <GitCompare className="w-3.5 h-3.5 text-violet-400" />
          <span className="font-sans hidden md:inline">Compare</span>
        </button>

        {/* Live Analysis Terminal */}
        <button
          id="nav-terminal-btn"
          onClick={() => {
            soundFx.playClick();
            toggleTerminalLog();
          }}
          onMouseEnter={soundFx.playHoverTick}
          className={`p-2 rounded-xl text-xs font-medium border transition-all ${
            isTerminalLogOpen
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-white/15 hover:border-emerald-500/40'
          }`}
          title="Toggle Deterministic Analysis Terminal"
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
        </button>

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
          id="nav-settings-btn"
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
          id="nav-theme-btn"
          onClick={() => {
            soundFx.playClick();
            toggleTheme();
          }}
          onMouseEnter={soundFx.playHoverTick}
          className={`p-2 rounded-xl transition-all border ${
            theme === 'neon'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
              : 'bg-slate-900/80 text-slate-400 hover:text-cyan-400 border-white/10 hover:border-cyan-500/30'
          }`}
          title={theme === 'neon' ? 'Switch to Cyber Midnight Theme' : 'Switch to High-Contrast Neon Theme'}
        >
          {theme === 'neon' ? <Zap className="w-4 h-4 text-cyan-300 animate-pulse" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
