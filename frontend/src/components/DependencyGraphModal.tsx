import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, GitBranch, ArrowRight, ShieldAlert, Sparkles, Navigation, AlertOctagon, Layers, FileCode, Package } from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { soundFx } from '../utils/soundEffects';
import { getBuildingColorHex } from '../utils/cityLayout';
import { FileNode } from '../types';

export const DependencyGraphModal: React.FC = () => {
  const {
    isDependencyGraphOpen,
    closeDependencyGraph,
    selectedFile,
    currentRepo,
    selectFile,
    toggleLayer,
    activeLayers,
    simulateFailure,
  } = useCityStore();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDependencyGraphOpen) {
        soundFx.playClick();
        closeDependencyGraph();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDependencyGraphOpen, closeDependencyGraph]);

  const files = currentRepo?.files || [];

  // Upstream callers (files that import this file, i.e., blast radius victims)
  const callers = useMemo(() => {
    if (!selectedFile) return [];
    const hop1 = selectedFile.blast_radius?.hops?.['1'] || [];
    return hop1
      .map((path) => files.find((f) => f.path === path || f.filename === path))
      .filter(Boolean) as FileNode[];
  }, [selectedFile, files]);

  // Downstream imports (files imported by this file)
  const dependencies = useMemo(() => {
    if (!selectedFile || !currentRepo?.graph_edges) return [];
    const edgeTargets = currentRepo.graph_edges
      .filter((e) => e.source === selectedFile.id || e.source === selectedFile.path)
      .map((e) => e.target);
    return edgeTargets
      .map((t) => files.find((f) => f.id === t || f.path === t || f.filename === t))
      .filter(Boolean) as FileNode[];
  }, [selectedFile, currentRepo, files]);

  // External packages and standard library modules (not existing as repo building files)
  const externalDependencies = useMemo(() => {
    if (!selectedFile || !currentRepo?.graph_edges) return [];
    const edgeTargets = currentRepo.graph_edges
      .filter((e) => e.source === selectedFile.id || e.source === selectedFile.path)
      .map((e) => e.target);
    const external = edgeTargets.filter(
      (t) => !files.some((f) => f.id === t || f.path === t || f.filename === t)
    );
    return Array.from(new Set(external));
  }, [selectedFile, currentRepo, files]);

  if (!isDependencyGraphOpen || !selectedFile) return null;

  const riskPct = Math.round(selectedFile.risk_probability * 100);
  const isHighRisk = riskPct >= 50;

  const handleFlyTo3D = () => {
    soundFx.playBlastWave();
    if (!activeLayers.skybridges) {
      toggleLayer('skybridges');
    }
    closeDependencyGraph();
  };

  const handleSimulateCascade = () => {
    soundFx.playBlastWave();
    simulateFailure(selectedFile);
    if (!activeLayers.skybridges) {
      toggleLayer('skybridges');
    }
    closeDependencyGraph();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl select-none"
        onClick={() => {
          soundFx.playClick();
          closeDependencyGraph();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative w-full max-w-4xl glass-panel rounded-2xl border border-cyan-500/30 p-6 shadow-2xl overflow-hidden flex flex-col backdrop-blur-2xl bg-slate-950/95 max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white font-sans">
                    Architecture Dependency & Blast Radius Graph
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    AST AST-Conduits
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Visualizing direct callers and downstream dependents for{' '}
                  <span className="text-cyan-300 font-bold">{selectedFile.filename}</span>
                </p>
              </div>
            </div>

            <button
              id="close-dep-graph-btn"
              onClick={() => {
                soundFx.playClick();
                closeDependencyGraph();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close graph (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-3 py-3 font-mono text-xs border-b border-white/10">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-[10px] text-slate-400 block">TARGET MODULE</span>
              <span className="text-sm font-bold text-white truncate block">{selectedFile.filename}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-[10px] text-slate-400 block">DEFECT RISK</span>
              <span className={`text-sm font-bold ${isHighRisk ? 'text-rose-400' : 'text-emerald-400'}`}>
                {riskPct}% {isHighRisk ? '• CRITICAL' : '• STABLE'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-[10px] text-slate-400 block">IMPACT BLAST RADIUS</span>
              <span className="text-sm font-bold text-cyan-300">
                {selectedFile.blast_radius?.total_count || callers.length} Files Affected
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-[10px] text-slate-400 block">CODE COMPLEXITY</span>
              <span className="text-sm font-bold text-amber-300">
                CC {selectedFile.max_complexity.toFixed(1)} • {selectedFile.loc} LOC
              </span>
            </div>
          </div>

          {/* Visual Interactive Graph Stage */}
          <div className="flex-1 min-h-[320px] py-4 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Left Column: Direct Callers (Blast Radius Victims) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-rose-500/30">
                  <span className="text-xs font-bold text-rose-300 font-sans flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    Incoming Callers ({callers.length})
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Hop 1</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  These files import the target module. If this module breaks, these files fail immediately:
                </p>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {callers.length === 0 ? (
                    <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 text-slate-500 text-xs italic">
                      No incoming callers detected (isolated or top-level entrypoint).
                    </div>
                  ) : (
                    callers.map((dep) => (
                      <div
                        key={dep.id}
                        onClick={() => {
                          soundFx.playClick();
                          selectFile(dep);
                        }}
                        className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 hover:border-rose-400/80 hover:bg-rose-900/40 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                          <div>
                            <span className="text-xs font-bold text-slate-200 block">{dep.filename}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {dep.loc} LOC • CC {dep.max_complexity.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                          {Math.round(dep.risk_probability * 100)}% Risk
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Center Column: The Target Module */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/80 border-2 border-cyan-400/50 shadow-[0_0_24px_rgba(6,182,212,0.25)] text-center relative">
                <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold uppercase tracking-wider font-mono">
                  ACTIVE FOCUS
                </div>

                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg border-2 ${
                    isHighRisk
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-rose-500/30'
                      : 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-cyan-500/30'
                  }`}
                >
                  <FileCode className="w-8 h-8" />
                </div>

                <h3 className="text-base font-bold text-white font-sans">{selectedFile.filename}</h3>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5">{selectedFile.path}</span>

                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                      isHighRisk
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {riskPct}% Bug Risk
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Impact: {selectedFile.impact_score.toFixed(1)}
                  </span>
                </div>

                {selectedFile.line_failure && (
                  <div className="mt-4 p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-left w-full text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-1">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      <span>{selectedFile.line_failure.failure_type}</span>
                    </div>
                    <span className="text-slate-300 block line-clamp-2">
                      Line {selectedFile.line_failure.line} in {selectedFile.line_failure.function_name}():{' '}
                      {selectedFile.line_failure.why_it_fails}
                    </span>
                  </div>
                )}
              </div>

              {/* Right Column: Downstream Dependencies */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-cyan-500/30">
                  <span className="text-xs font-bold text-cyan-300 font-sans flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    Outgoing Dependencies ({dependencies.length})
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Imports</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Modules imported by {selectedFile.filename} to carry out its operations:
                </p>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {dependencies.length === 0 ? (
                    <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 text-slate-500 text-xs italic">
                      No internal project dependencies imported (relies only on stdlib/third-party).
                    </div>
                  ) : (
                    dependencies.map((dep) => (
                      <div
                        key={dep.id}
                        onClick={() => {
                          soundFx.playClick();
                          selectFile(dep);
                        }}
                        className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 hover:border-cyan-400/80 hover:bg-cyan-900/40 cursor-pointer transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                          <div>
                            <span className="text-xs font-bold text-slate-200 block">{dep.filename}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {dep.loc} LOC • CC {dep.max_complexity.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                          {Math.round(dep.risk_probability * 100)}% Risk
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Graceful External Package Handling (Standard Library / Third-Party) */}
                {externalDependencies.length > 0 && (
                  <div className="pt-3 border-t border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="flex items-center gap-1.5 font-bold text-slate-300 font-sans">
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        External Packages ({externalDependencies.length})
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Not in 3D City</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                      {externalDependencies.map((pkg) => (
                        <span
                          key={pkg}
                          className="px-2 py-0.5 rounded-lg bg-slate-900/90 border border-white/10 text-slate-400 font-mono text-[10px]"
                          title="External third-party or standard library module (no corresponding 3D building in workspace)"
                        >
                          {pkg}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10 font-mono text-xs">
            <div className="text-slate-400 text-[11px]">
              Tip: Click any connected node in this graph to switch focus and re-trace dependencies.
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulateCascade}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 hover:border-rose-400 transition-all font-medium"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                <span>Simulate Cascade Wave</span>
              </button>

              <button
                onClick={handleFlyTo3D}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-all shadow-glow-cyan"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Fly Camera in 3D City</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
