import React, { useEffect, useState, useMemo } from 'react';
import {
  Pause,
  ShieldAlert,
  Award,
  AlertTriangle,
  ChevronRight,
  Flame,
  FileCode,
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { FileNode } from '../types';
import { soundFx } from '../utils/soundEffects';
import { getLineFailureDiagnostic } from '../utils/fileDiagnostics';

export const PresentationHUD: React.FC = () => {
  const {
    presentationMode,
    currentRepo,
    selectedFile,
    selectFile,
    togglePresentationMode,
    openModelCard,
    recordUserActivity,
  } = useCityStore();

  const [activeHotspotIndex, setActiveHotspotIndex] = useState(0);
  const [progressKey, setProgressKey] = useState(0);

  // Top critical files in the repository for exhibition cycling
  const topHotspots: FileNode[] = useMemo(() => {
    if (!currentRepo) return [];
    return [...currentRepo.files]
      .sort((a, b) => b.risk_probability - a.risk_probability)
      .slice(0, 5);
  }, [currentRepo]);

  // 1. Inactivity Attract Mode: automatically enter presentation mode after 45s of user inactivity
  useEffect(() => {
    const handleActivity = () => {
      recordUserActivity();
    };

    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('mousedown', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });

    const attractInterval = setInterval(() => {
      const idleTime = Date.now() - useCityStore.getState().lastUserActivity;
      // 45 seconds of total inactivity triggers attract mode
      if (idleTime > 45000 && !useCityStore.getState().presentationMode) {
        useCityStore.getState().togglePresentationMode();
      }
    }, 5000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      clearInterval(attractInterval);
    };
  }, [recordUserActivity]);

  // 2. Exhibition Cycling: Rotate through top hotspots every 7.5 seconds
  useEffect(() => {
    if (!presentationMode || topHotspots.length === 0) return;

    // Immediately select current hotspot
    selectFile(topHotspots[activeHotspotIndex]);
    setProgressKey((k) => k + 1);

    const cycleTimer = setInterval(() => {
      setActiveHotspotIndex((prev) => {
        const nextIdx = (prev + 1) % topHotspots.length;
        selectFile(topHotspots[nextIdx]);
        useCityStore.setState({ tourStep: nextIdx });
        setProgressKey((k) => k + 1);
        return nextIdx;
      });
    }, 7500);

    return () => clearInterval(cycleTimer);
  }, [presentationMode, topHotspots, selectFile]);

  if (!presentationMode || !currentRepo) return null;

  const activeNode = topHotspots[activeHotspotIndex] || selectedFile;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-between p-6 select-none animate-fade-in">
      {/* 1. Top Projector Banner */}
      <div className="flex items-center justify-between w-full">
        {/* Left: Product Title & Active Status */}
        <div className="pointer-events-auto glass-panel px-6 py-3.5 rounded-2xl border border-cyan-500/40 shadow-glow-cyan flex items-center space-x-4 text-white">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-accent-cyan" />
          </span>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-accent-cyan font-bold flex items-center gap-2">
              <span>CodeCity AI • Exhibition Mode</span>
              <span className="text-[9px] text-slate-400 px-1.5 py-0.2 rounded bg-white/10 font-normal">
                Continuous 3D Orbit
              </span>
            </div>
            <div className="text-base font-bold tracking-tight text-white mt-0.5">
              {currentRepo.name}
              <span className="font-mono text-xs text-slate-400 font-normal ml-2">
                ({currentRepo.summary.total_files} files • {currentRepo.summary.total_loc} LOC)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Controls & Exit */}
        <div className="pointer-events-auto flex items-center space-x-3">
          <button
            onClick={openModelCard}
            className="glass-panel px-4 py-2.5 rounded-xl border border-white/15 hover:border-cyan-500/50 text-slate-200 hover:text-white flex items-center gap-2 text-xs font-mono transition-all shadow-glass-panel"
          >
            <Award className="w-4 h-4 text-accent-amber" />
            <span>Model Card</span>
          </button>

          <button
            onClick={togglePresentationMode}
            className="glass-panel px-4 py-2.5 rounded-xl border border-rose-500/40 hover:bg-rose-500/20 text-rose-300 flex items-center gap-2 text-xs font-mono transition-all shadow-glow-rose"
          >
            <Pause className="w-4 h-4" />
            <span>Exit (Press P)</span>
          </button>
        </div>
      </div>

      {/* 2. Bottom Projector Callout: Spotlight on Active High-Risk Hotspot & Blast Radius */}
      {activeNode && (
        <div className="pointer-events-auto max-w-xl mx-auto glass-panel p-5 rounded-3xl border border-cyan-500/40 shadow-glow-cyan text-white animate-slide-down">
          {/* Tour Step Progress Indicator & Hotspot Selector Pills */}
          <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-white/10">
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span className="text-rose-300 font-bold">Tour of Riskiest Code Files</span>
            </div>

            <div className="flex items-center gap-1.5">
              {topHotspots.map((h, idx) => (
                <button
                  key={h.id}
                  onClick={() => {
                    soundFx.playClick();
                    setActiveHotspotIndex(idx);
                    selectFile(h);
                    useCityStore.setState({ tourStep: idx });
                    setProgressKey((k) => k + 1);
                  }}
                  className={`w-5 h-5 rounded-md text-[10px] font-mono flex items-center justify-center transition-all ${
                    idx === activeHotspotIndex
                      ? 'bg-rose-500 text-white font-bold shadow-[0_0_8px_rgba(244,63,94,0.7)]'
                      : 'bg-white/10 text-slate-400 hover:bg-white/20 hover:text-white'
                  }`}
                  title={h.filename}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-accent-cyan uppercase tracking-wider mb-1">
                <AlertTriangle className="w-4 h-4 text-accent-rose" />
                <span>High-Risk File #{activeHotspotIndex + 1} of {topHotspots.length}</span>
              </div>
              <h3 className="text-lg font-bold font-mono text-white truncate max-w-md flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span>{activeNode.filename}</span>
              </h3>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Path: {activeNode.path}
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="px-2.5 py-1 rounded-xl text-sm font-mono font-bold bg-rose-950/80 text-rose-400 border border-rose-500/40 shadow-glow-rose">
                {(activeNode.risk_probability * 100).toFixed(0)}% Defect Risk
              </span>
              <div className="text-[11px] text-slate-400 font-mono mt-1.5">
                Impact: <b className="text-accent-amber font-bold">{activeNode.impact_score.toFixed(2)}</b>
              </div>
            </div>
          </div>

          {/* Architectural Explanation Narration */}
          {(() => {
            const diag = getLineFailureDiagnostic(activeNode);
            return (
              <>
                <p className="mt-3 text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
                  Key risk file with <span className="text-amber-300 font-mono font-bold">{activeNode.max_complexity}</span> branching decisions, <span className="text-cyan-300 font-mono font-bold">{activeNode.loc}</span> lines of code, and <span className="text-rose-300 font-mono font-bold">{activeNode.churn_90d}</span> lines edited recently.
                </p>

                <div className="mt-2 text-[11px] font-mono text-rose-300 bg-rose-950/50 p-2 rounded-xl border border-rose-500/40 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Line {diag.line} in {diag.function_name}: {diag.failure_type}</span>
                  </span>
                  <span className="text-[10px] text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded border border-white/10">
                    Fix: {diag.suggested_fix}
                  </span>
                </div>
              </>
            );
          })()}

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-accent-cyan" />
              <span>
                Connected Files (Blast Radius): <b className="text-accent-cyan font-bold">{activeNode.blast_radius?.total_count || 0} dependent files</b>
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>Next in 7.5s</span>
              <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>

          {/* Animated 7.5s Progress Bar */}
          <div className="w-full h-1 bg-slate-800 rounded-full mt-2.5 overflow-hidden">
            <div
              key={progressKey}
              className="h-full bg-gradient-to-r from-cyan-400 to-rose-500 rounded-full animate-[progress_7.5s_linear]"
              style={{
                animationDuration: '7.5s',
                animationTimingFunction: 'linear',
                animationFillMode: 'forwards',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
