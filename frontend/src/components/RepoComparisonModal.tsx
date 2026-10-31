import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, GitCompare, ArrowRight, ShieldCheck, Layers, AlertTriangle, FileCode, CheckCircle, BarChart2 } from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { soundFx } from '../utils/soundEffects';

export const RepoComparisonModal: React.FC = () => {
  const {
    isRepoComparisonOpen,
    toggleRepoComparison,
    currentRepo,
    repos,
    compareRepo,
  } = useCityStore();

  const [selectedSecondaryId, setSelectedSecondaryId] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRepoComparisonOpen) {
        soundFx.playClick();
        toggleRepoComparison(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRepoComparisonOpen, toggleRepoComparison]);

  if (!isRepoComparisonOpen || !currentRepo) return null;

  const otherRepos = repos.filter((r) => r.id !== currentRepo.repo_id);

  const handleSelectCompare = (id: string) => {
    setSelectedSecondaryId(id);
    soundFx.playClick();
    toggleRepoComparison(id);
  };

  const primarySummary = currentRepo.summary;
  const secondarySummary = compareRepo?.summary;

  // Normalized ratios for scale-invariant comparison
  const primaryLocPerFile = Math.round(primarySummary.total_loc / Math.max(1, primarySummary.total_files));
  const secondaryLocPerFile = secondarySummary ? Math.round(secondarySummary.total_loc / Math.max(1, secondarySummary.total_files)) : 0;

  const primaryDepDensity = (primarySummary.total_dependencies / Math.max(1, primarySummary.total_files)).toFixed(2);
  const secondaryDepDensity = secondarySummary ? (secondarySummary.total_dependencies / Math.max(1, secondarySummary.total_files)).toFixed(2) : '0';

  const primaryHotspotPct = Math.round((primarySummary.critical_files_count / Math.max(1, primarySummary.total_files)) * 100);
  const secondaryHotspotPct = secondarySummary ? Math.round((secondarySummary.critical_files_count / Math.max(1, secondarySummary.total_files)) * 100) : 0;

  const primaryMaxCC = Math.max(1, ...currentRepo.files.map((f) => f.max_complexity || 1));
  const secondaryMaxCC = compareRepo ? Math.max(1, ...compareRepo.files.map((f) => f.max_complexity || 1)) : 1;

  const primaryAvgCC = (currentRepo.files.reduce((acc, f) => acc + (f.mean_complexity || 1), 0) / Math.max(1, currentRepo.files.length)).toFixed(2);
  const secondaryAvgCC = compareRepo ? (compareRepo.files.reduce((acc, f) => acc + (f.mean_complexity || 1), 0) / Math.max(1, compareRepo.files.length)).toFixed(2) : '0';

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl select-none"
        onClick={() => {
          soundFx.playClick();
          toggleRepoComparison(null);
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative w-full max-w-4xl glass-panel rounded-2xl border border-white/15 p-6 shadow-2xl overflow-hidden flex flex-col backdrop-blur-2xl bg-slate-950/95 max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400">
                <GitCompare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
                  <span>Repository Intelligence Comparison</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Dual Benchmark
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Scale-invariant comparison: raw volume, normalized ratios, and graph density.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                toggleRepoComparison(null);
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Repo Selectors */}
          <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-white/5">
            {/* Primary Repo */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-cyan-500/30">
              <span className="text-[10px] uppercase font-mono text-cyan-400 block mb-1">
                Active Primary Workspace
              </span>
              <div className="text-sm font-bold text-white truncate font-mono">
                {currentRepo.name}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {currentRepo.files.length} modules analyzed
              </div>
            </div>

            {/* Secondary Repo Picker */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">
                Select Benchmark Repository:
              </span>
              <select
                value={compareRepo?.repo_id || ''}
                onChange={(e) => handleSelectCompare(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-violet-400"
              >
                <option value="">-- Choose Repository --</option>
                {otherRepos.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.summary.total_files} files)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Content */}
          {secondarySummary ? (
            <div className="py-4 space-y-4 font-mono text-xs overflow-y-auto pr-1">
              {/* Column Header */}
              <div className="grid grid-cols-3 text-slate-400 font-semibold pb-2 border-b border-white/10 text-[11px]">
                <span>Intelligence Metric</span>
                <span className="text-cyan-400 font-bold">{currentRepo.name.split('/').pop()}</span>
                <span className="text-violet-400 font-bold">{compareRepo?.name.split('/').pop()}</span>
              </div>

              {/* 1. RAW VOLUME COUNTS */}
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">1. Raw Volume Counts</div>
                <div className="grid grid-cols-3 py-1.5 border-b border-white/5 items-center">
                  <span className="text-slate-300">Total Code Modules</span>
                  <span className="text-white font-bold">{primarySummary.total_files} files</span>
                  <span className="text-white font-bold">{secondarySummary.total_files} files</span>
                </div>
                <div className="grid grid-cols-3 py-1.5 border-b border-white/5 items-center">
                  <span className="text-slate-300">Total Lines of Code</span>
                  <span className="text-white font-bold">{primarySummary.total_loc.toLocaleString()} LOC</span>
                  <span className="text-white font-bold">{secondarySummary.total_loc.toLocaleString()} LOC</span>
                </div>
                <div className="grid grid-cols-3 py-1.5 border-b border-white/5 items-center">
                  <span className="text-slate-300">Total Dependency Edges</span>
                  <span className="text-cyan-300 font-bold">{primarySummary.total_dependencies} edges</span>
                  <span className="text-violet-300 font-bold">{secondarySummary.total_dependencies} edges</span>
                </div>
                <div className="grid grid-cols-3 py-1.5 border-b border-white/5 items-center">
                  <span className="text-slate-300">Critical Hotspot Files</span>
                  <span className="text-rose-400 font-bold">{primarySummary.critical_files_count} files</span>
                  <span className="text-rose-400 font-bold">{secondarySummary.critical_files_count} files</span>
                </div>
              </div>

              {/* 2. NORMALIZED SCALE-INVARIANT RATIOS */}
              <div className="space-y-1.5 pt-2">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">2. Normalized Architectural Ratios</div>
                <div className="grid grid-cols-3 py-1.5 border-b border-white/5 items-center">
                  <span className="text-slate-300">Average Module Size</span>
                  <span className="text-slate-200 font-bold">{primaryLocPerFile} LOC / file</span>
                  <span className="text-slate-200 font-bold">{secondaryLocPerFile} LOC / file</span>
                </div>
                <div className="grid grid-cols-3 py-1.5 border-b border-white/5 items-center">
                  <span className="text-slate-300">Dependency Density</span>
                  <span className="text-cyan-300 font-bold">{primaryDepDensity} links / module</span>
                  <span className="text-violet-300 font-bold">{secondaryDepDensity} links / module</span>
                </div>
                <div className="grid grid-cols-3 py-1.5 border-b border-white/5 items-center">
                  <span className="text-slate-300">Hotspot Exposure %</span>
                  <span className={`font-bold ${primaryHotspotPct >= 25 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {primaryHotspotPct}% of files
                  </span>
                  <span className={`font-bold ${secondaryHotspotPct >= 25 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {secondaryHotspotPct}% of files
                  </span>
                </div>
              </div>

              {/* 3. GRAPH & COMPLEXITY CHARACTERISTICS */}
              <div className="space-y-1.5 pt-2">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">3. Complexity & Structural Profile</div>
                <div className="grid grid-cols-3 py-1.5 border-b border-white/5 items-center">
                  <span className="text-slate-300">Average Branching (CC)</span>
                  <span className="text-slate-200 font-bold">{primaryAvgCC} mean CC</span>
                  <span className="text-slate-200 font-bold">{secondaryAvgCC} mean CC</span>
                </div>
                <div className="grid grid-cols-3 py-1.5 border-b border-white/5 items-center">
                  <span className="text-slate-300">Peak Branching (Max CC)</span>
                  <span className="text-amber-400 font-bold">{primaryMaxCC.toFixed(1)} max CC</span>
                  <span className="text-amber-400 font-bold">{secondaryMaxCC.toFixed(1)} max CC</span>
                </div>
              </div>

              {/* 4. MACHINE LEARNING VALIDATION */}
              <div className="space-y-1.5 pt-2">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">4. Machine Learning Model Metrics</div>
                <div className="grid grid-cols-3 py-1.5 border-b border-white/5 items-center">
                  <span className="text-slate-300">Mean Defect Likelihood</span>
                  <span className={`font-bold ${primarySummary.avg_risk >= 0.3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {(primarySummary.avg_risk * 100).toFixed(1)}%
                  </span>
                  <span className={`font-bold ${secondarySummary.avg_risk >= 0.3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {(secondarySummary.avg_risk * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="grid grid-cols-3 py-1.5 border-b border-white/5 items-center">
                  <span className="text-slate-300">Held-Out ROC-AUC</span>
                  <span className="text-emerald-400 font-bold">{primarySummary.model_roc_auc.toFixed(3)}</span>
                  <span className="text-emerald-400 font-bold">{secondarySummary.model_roc_auc.toFixed(3)}</span>
                </div>
              </div>

              {/* Methodological Transparency Note */}
              <p className="text-[10px] text-slate-400 font-sans leading-relaxed pt-3 border-t border-white/10">
                <strong className="text-slate-300">Methodological Note:</strong> Comparisons use actual computed AST and Git metrics normalized by file count and LOC volume. No unvalidated external industry benchmarks or synthetic targets are assumed.
              </p>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 font-mono text-xs">
              Select a repository from the dropdown above to view side-by-side benchmarking.
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
