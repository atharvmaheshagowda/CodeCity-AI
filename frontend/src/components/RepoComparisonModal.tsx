import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, GitCompare, ArrowRight, ShieldCheck, Layers, AlertTriangle, FileCode } from 'lucide-react';
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
                  Side-by-side KPI, risk profile, and architectural density benchmarking.
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

          {/* Side-by-Side Comparison Metrics Table */}
          {secondarySummary ? (
            <div className="py-4 space-y-3 font-mono text-xs overflow-y-auto">
              <div className="grid grid-cols-3 text-slate-400 font-semibold pb-2 border-b border-white/5 text-[11px]">
                <span>Intelligence Metric</span>
                <span className="text-cyan-400">{currentRepo.name.split('/').pop()}</span>
                <span className="text-violet-400">{compareRepo?.name.split('/').pop()}</span>
              </div>

              {/* Row: Total Files */}
              <div className="grid grid-cols-3 py-2 border-b border-white/5 items-center">
                <span className="text-slate-300">Total Code Modules</span>
                <span className="text-white font-bold">{primarySummary.total_files} files</span>
                <span className="text-white font-bold">{secondarySummary.total_files} files</span>
              </div>

              {/* Row: Total LOC */}
              <div className="grid grid-cols-3 py-2 border-b border-white/5 items-center">
                <span className="text-slate-300">Lines of Code (Volume)</span>
                <span className="text-white font-bold">{primarySummary.total_loc.toLocaleString()} LOC</span>
                <span className="text-white font-bold">{secondarySummary.total_loc.toLocaleString()} LOC</span>
              </div>

              {/* Row: Mean Defect Risk */}
              <div className="grid grid-cols-3 py-2 border-b border-white/5 items-center">
                <span className="text-slate-300">Mean Defect Risk</span>
                <span className={`font-bold ${primarySummary.avg_risk >= 0.3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {(primarySummary.avg_risk * 100).toFixed(1)}%
                </span>
                <span className={`font-bold ${secondarySummary.avg_risk >= 0.3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {(secondarySummary.avg_risk * 100).toFixed(1)}%
                </span>
              </div>

              {/* Row: Critical Hotspot Files */}
              <div className="grid grid-cols-3 py-2 border-b border-white/5 items-center">
                <span className="text-slate-300">Critical Hotspot Files</span>
                <span className="text-rose-400 font-bold">{primarySummary.critical_files_count} files</span>
                <span className="text-rose-400 font-bold">{secondarySummary.critical_files_count} files</span>
              </div>

              {/* Row: Total Dependencies */}
              <div className="grid grid-cols-3 py-2 border-b border-white/5 items-center">
                <span className="text-slate-300">AST Import Conduits</span>
                <span className="text-cyan-400 font-bold">{primarySummary.total_dependencies} edges</span>
                <span className="text-cyan-400 font-bold">{secondarySummary.total_dependencies} edges</span>
              </div>

              {/* Row: Model ROC-AUC */}
              <div className="grid grid-cols-3 py-2 border-b border-white/5 items-center">
                <span className="text-slate-300">ML ROC-AUC Score</span>
                <span className="text-emerald-400 font-bold">{primarySummary.model_roc_auc.toFixed(3)}</span>
                <span className="text-emerald-400 font-bold">{secondarySummary.model_roc_auc.toFixed(3)}</span>
              </div>
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
