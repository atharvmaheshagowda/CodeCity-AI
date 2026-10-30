import React, { useState } from 'react';
import {
  Boxes,
  Play,
  Pause,
  Award,
  HelpCircle,
  FolderGit2,
  BatteryCharging,
  Command,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { soundFx } from '../utils/soundEffects';

export const Navbar: React.FC = () => {
  const {
    repos,
    currentRepo,
    presentationMode,
    lowPowerMode,
    isLeftPanelCollapsed,
    loadRepo,
    togglePresentationMode,
    toggleLowPowerMode,
    toggleLeftPanel,
    openCommandPalette,
    openModelCard,
    toggleOnboarding,
    triggerCameraReset,
  } = useCityStore();

  const [isMuted, setIsMuted] = useState(soundFx.isMuted());

  const handleToggleSound = () => {
    const unmuted = soundFx.toggleMute();
    setIsMuted(!unmuted);
  };

  return (
    <header className="h-14 glass-panel border-b border-white/10 px-4 md:px-6 flex items-center justify-between z-30 select-none shadow-glass-panel backdrop-blur-2xl bg-slate-950/85">
      {/* 1. Left: Brand Identity & Intelligence Panel Collapse Trigger */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => {
            soundFx.playClick();
            toggleLeftPanel();
          }}
          onMouseEnter={soundFx.playHoverTick}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all"
          title={isLeftPanelCollapsed ? 'Expand Intelligence Panel' : 'Collapse Intelligence Panel (Maximize City)'}
        >
          {isLeftPanelCollapsed ? <PanelLeftOpen className="w-4 h-4 text-cyan-400" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-glow-cyan">
            <Boxes className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 font-display">
                CodeCity <span className="text-cyan-400 font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30">AI</span>
              </h1>
              <span className="text-[9px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded-full border border-white/5 hidden sm:inline">
                Offline
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Center: Compact Floating Repository Selector */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-white/10 text-xs shadow-inner">
          <FolderGit2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <select
            id="nav-repo-select"
            value={currentRepo?.repo_id || ''}
            onChange={(e) => {
              soundFx.playClick();
              loadRepo(e.target.value);
            }}
            className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none cursor-pointer max-w-[170px] sm:max-w-[280px] truncate"
          >
            {repos.map((r) => (
              <option key={r.id} value={r.id} className="bg-slate-950 text-slate-200 font-mono">
                {r.name} ({r.summary?.total_files || 0} files)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Right: Action Controls (Command Palette, Camera Reset, Audio, Low-Power, Exhibition, Model Card, Help) */}
      <div className="flex items-center space-x-2">
        {/* Command Palette Trigger */}
        <button
          id="nav-command-btn"
          onClick={() => {
            soundFx.playClick();
            openCommandPalette();
          }}
          onMouseEnter={soundFx.playHoverTick}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white border border-white/10 hover:border-cyan-500/40 text-xs font-mono transition-all"
          title="Search actions, color modes, and files (Ctrl+K or Cmd+K)"
        >
          <Command className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline text-[11px]">Command</span>
          <kbd className="hidden lg:inline text-[9px] text-slate-400 bg-black/40 px-1 py-0.2 rounded font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Camera Reset */}
        <button
          onClick={() => {
            soundFx.playWhoosh();
            triggerCameraReset();
          }}
          onMouseEnter={soundFx.playHoverTick}
          className="p-1.5 rounded-xl bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-white/10 transition-all"
          title="Reset Camera Framing"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* WebAudio Synthesizer Sound FX Toggle */}
        <button
          onClick={handleToggleSound}
          onMouseEnter={soundFx.playHoverTick}
          className={`p-1.5 rounded-xl border transition-all ${
            !isMuted
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-glow-cyan'
              : 'bg-slate-900/80 text-slate-500 border-white/10 hover:text-slate-300'
          }`}
          title={isMuted ? 'Enable Procedural Sound Effects (WebAudio)' : 'Mute Sound Effects'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Low-Power Mode Toggle */}
        <button
          id="nav-lowpower-btn"
          onClick={() => {
            soundFx.playClick();
            toggleLowPowerMode();
          }}
          onMouseEnter={soundFx.playHoverTick}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-mono border transition-all ${
            lowPowerMode
              ? 'bg-amber-950/60 text-amber-300 border-amber-500/40 shadow-glow-amber'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-white/10'
          }`}
          title="Toggle Low-Power Eco Mode"
        >
          <BatteryCharging className="w-3.5 h-3.5" />
          <span className="hidden xl:inline text-[11px]">{lowPowerMode ? 'Eco: ON' : 'Eco'}</span>
        </button>

        {/* Exhibition Mode Toggle */}
        <button
          id="nav-exhibition-btn"
          onClick={() => {
            soundFx.playClick();
            togglePresentationMode();
          }}
          onMouseEnter={soundFx.playHoverTick}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            presentationMode
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-glow-rose'
              : 'bg-slate-900/80 text-slate-300 border-white/10 hover:border-white/20'
          }`}
          title="Toggle Exhibition Mode (Key: P)"
        >
          {presentationMode ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">Exhibition</span>
        </button>

        {/* Model Card Modal Trigger */}
        <button
          id="nav-model-card-btn"
          onClick={() => {
            soundFx.playClick();
            openModelCard();
          }}
          onMouseEnter={soundFx.playHoverTick}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-900/80 text-slate-300 border border-white/10 hover:border-cyan-500/40 hover:text-cyan-300 transition-all"
          title="View Model Card (ROC curve & metrics)"
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Model Card</span>
        </button>

        {/* Onboarding Help */}
        <button
          id="nav-help-btn"
          onClick={() => {
            soundFx.playClick();
            toggleOnboarding();
          }}
          onMouseEnter={soundFx.playHoverTick}
          className="p-1.5 rounded-xl bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-white/10 transition-all"
          title="Controls Guide & Shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
