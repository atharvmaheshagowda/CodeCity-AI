import React, { useEffect, useState, useMemo } from 'react';
import {
  Play,
  Pause,
  ShieldAlert,
  Award,
  AlertTriangle,
  Flame,
  ArrowRight,
  Eye,
  X
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { FileNode } from '../types';

export const PresentationHUD: React.FC = () => {
  const {
    presentationMode,
    currentRepo,
    selectedFile,
    selectFile,
    togglePresentationMode,
    openModelCard,
    recordUserActivity,
    lastUserActivity,
  } = useCityStore();

  const [activeHotspotIndex, setActiveHotspotIndex] = useState(0);

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

    // Immediately select first hotspot
    selectFile(topHotspots[activeHotspotIndex]);

    const cycleTimer = setInterval(() => {
      setActiveHotspotIndex((prev) => {
        const nextIdx = (prev + 1) % topHotspots.length;
        selectFile(topHotspots[nextIdx]);
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
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-accent-cyan uppercase tracking-wider mb-1">
                <AlertTriangle className="w-4 h-4 text-accent-rose" />
                <span>Critical Hotspot #{activeHotspotIndex + 1} of {topHotspots.length}</span>
              </div>
              <h3 className="text-lg font-bold font-mono text-white truncate max-w-md">
                {activeNode.filename}
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

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-accent-cyan" />
              <span>
                Blast Radius: <b className="text-accent-cyan font-bold">{activeNode.blast_radius?.total_count || 0} dependent files</b>
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Auto-cycling • Touch or move mouse to interact
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
