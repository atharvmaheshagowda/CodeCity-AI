import React from 'react';
import {
  Boxes,
  Play,
  Pause,
  Award,
  FolderGit2,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  LayoutGrid,
  GitCompare,
  Terminal,
  Settings,
  Zap,
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { soundFx } from '../utils/soundEffects';

export const Navbar: React.FC = () => {
  const {
    repos,
    currentRepo,
    presentationMode,
    isLeftPanelCollapsed,
    isInsightsOpen,
    smellsResult,
    loadRepo,
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

  return (
    <header className="h-14 glass-panel border-b border-white/10 px-3 md:px-5 flex items-center justify-between z-30 select-none shadow-glass-panel backdrop-blur-2xl bg-slate-950/90 shrink-0">
      {/* 1. Left: Brand Identity with Logo, Version, Status & Tagline */}
      <div className="flex items-center space-x-2.5 shrink-0">
        <button
          onClick={() => {
            soundFx.playClick();
            toggleLeftPanel();
          }}
          onMouseEnter={soundFx.playHoverTick}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all"
          title={isLeftPanelCollapsed ? 'Expand Sidebar (Ctrl+B)' : 'Collapse Sidebar (Ctrl+B)'}
        >
          {isLeftPanelCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-cyan-400" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        <div className="flex items-center space-x-2">
          {/* Hexagonal Cyber Glowing Icon */}
          <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center shadow-glow-cyan shrink-0">
            <Boxes className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="flex items-center space-x-2">
            <h1 className="text-sm md:text-base font-bold tracking-tight text-white flex items-center gap-1 font-display">
              CodeCity <span className="text-cyan-400 font-mono font-bold">AI</span>
            </h1>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-1.5 py-0.2 rounded border border-white/10 hidden sm:inline">
              v1.0
            </span>
            <span className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-900/60 px-2 py-0.2 rounded-full border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Offline Ready</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Center: Repository Selector (Single authoritative center control) */}
      <div className="flex items-center justify-center flex-1 max-w-sm px-2">
        <div className="flex items-center space-x-2 bg-slate-900/90 px-3 py-1.2 rounded-xl border border-white/10 text-xs shadow-inner w-full max-w-[280px]">
          <FolderGit2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <select
            id="nav-repo-select"
            value={currentRepo?.repo_id || ''}
            onChange={(e) => {
              soundFx.playClick();
              loadRepo(e.target.value);
            }}
            className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none cursor-pointer w-full truncate"
          >
            {repos.map((r) => (
              <option key={r.id} value={r.id} className="bg-slate-950 text-slate-200 font-mono">
                {r.name} ({r.summary?.total_files || 0} files)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Right: Mission Control Actions */}
      <div className="flex items-center space-x-1.5 shrink-0">
        {/* Insights Dock Toggle Button */}
        <button
          id="nav-insights-btn"
          onClick={() => {
            soundFx.playClick();
            toggleInsights();
          }}
          onMouseEnter={soundFx.playHoverTick}
          className={`flex items-center space-x-1.5 px-2.5 py-1.2 rounded-xl text-xs font-medium border transition-all ${
            isInsightsOpen
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-glow-cyan'
              : 'bg-slate-900/80 text-slate-300 border-white/15 hover:border-cyan-500/40 hover:text-white'
          }`}
          title="Open Architecture Insights Dock"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-sans hidden sm:inline">Insights</span>
          {smellsResult && smellsResult.total_smells > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500/30 text-rose-300 font-mono">
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
          className={`flex items-center space-x-1.5 px-2.5 py-1.2 rounded-xl text-xs font-medium border transition-all ${
            isScatterPlotOpen
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-glow-cyan'
              : 'bg-slate-900/80 text-slate-300 border-white/15 hover:border-cyan-500/40 hover:text-white'
          }`}
          title="Complexity vs Churn 2D Hotspot Matrix"
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
          className={`flex items-center space-x-1.5 px-2.5 py-1.2 rounded-xl text-xs font-medium border transition-all ${
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
          className={`p-1.5 rounded-xl text-xs font-medium border transition-all ${
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
          className={`flex items-center space-x-1.5 px-2.5 py-1.2 rounded-xl text-xs font-medium border transition-all ${
            presentationMode
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-glow-rose'
              : 'bg-slate-900/80 text-slate-300 border-white/15 hover:border-cyan-500/40 hover:text-white'
          }`}
          title="Toggle Exhibition Tour Mode"
        >
          {presentationMode ? (
            <Pause className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <Play className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span className="font-sans hidden lg:inline">Exhibition</span>
        </button>

        {/* Model Card Modal */}
        <button
          id="nav-model-card-btn"
          onClick={() => {
            soundFx.playClick();
            openModelCard();
          }}
          onMouseEnter={soundFx.playHoverTick}
          className="flex items-center space-x-1.5 px-2.5 py-1.2 rounded-xl text-xs font-medium bg-slate-900/80 text-slate-300 border border-white/15 hover:border-cyan-500/40 hover:text-white transition-all"
          title="View Machine Learning Model Card & Benchmark"
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-sans hidden xl:inline">Model Card</span>
        </button>

        {/* Settings & Shortcuts */}
        <button
          id="nav-settings-btn"
          onClick={() => {
            soundFx.playClick();
            toggleOnboarding();
          }}
          onMouseEnter={soundFx.playHoverTick}
          className="p-1.5 rounded-xl bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-white/10 hover:border-white/20 transition-all"
          title="Shortcuts & System Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Theme Switcher */}
        <button
          id="nav-theme-btn"
          onClick={() => {
            soundFx.playClick();
            toggleTheme();
          }}
          onMouseEnter={soundFx.playHoverTick}
          className={`p-1.5 rounded-xl transition-all border ${
            theme === 'neon'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
              : 'bg-slate-900/80 text-slate-400 hover:text-cyan-400 border-white/10 hover:border-cyan-500/30'
          }`}
          title={theme === 'neon' ? 'Switch to Cyber Midnight Theme' : 'Switch to High-Contrast Neon Theme'}
        >
          {theme === 'neon' ? <Zap className="w-3.5 h-3.5 text-cyan-300 animate-pulse" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
