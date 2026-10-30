import React, { useState, useEffect } from 'react';
import {
  Clock,
  Users,
  CheckSquare,
  Square,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';
import { soundFx } from '../../utils/soundEffects';
import { PlannedFile } from '../../types';

export const PlanTab: React.FC = () => {
  const {
    currentRepo,
    plannerResult,
    plannerHours,
    plannerReviewers,
    fetchPlanner,
    selectFile,
  } = useCityStore();

  const [hours, setHours] = useState(plannerHours || 12.0);
  const [reviewers, setReviewers] = useState(plannerReviewers || 2);
  const [completedFiles, setCompletedFiles] = useState<Set<string>>(new Set());
  const [isComputing, setIsComputing] = useState(false);

  useEffect(() => {
    if (!plannerResult && currentRepo) {
      fetchPlanner(hours, reviewers);
    }
  }, [currentRepo]);

  const handleRunPlanner = async () => {
    setIsComputing(true);
    soundFx.playClick();
    try {
      await fetchPlanner(hours, reviewers);
      soundFx.playWhoosh();
    } finally {
      setIsComputing(false);
    }
  };

  const toggleCheck = (path: string) => {
    soundFx.playHoverTick();
    setCompletedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const handleSelectBuilding = (item: PlannedFile) => {
    const found = currentRepo?.files.find((f) => f.path === item.path || f.filename === item.filename);
    if (found) {
      soundFx.playClick();
      selectFile(found);
    }
  };

  return (
    <div className="space-y-6 text-xs text-slate-200">
      {/* 1. Header & Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Review Budget Optimizer</h3>
              <p className="text-[11px] text-slate-400">
                Greedy knapsack scheduling maximizing defect risk mitigated given available review hours.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunPlanner}
            disabled={isComputing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono transition-all disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isComputing ? 'Optimizing...' : 'Calculate Plan'}</span>
          </button>
        </div>

        {/* Sliders and Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
          {/* Hours Available */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Total Review Time:</span>
              <span className="font-mono text-emerald-400 font-bold">{hours} Hours</span>
            </div>
            <input
              type="range"
              min="2"
              max="40"
              step="1"
              value={hours}
              onChange={(e) => setHours(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>2 hrs (Quick sprint)</span>
              <span>20 hrs</span>
              <span>40 hrs (Full release)</span>
            </div>
          </div>

          {/* Reviewers Count */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Team Reviewers:</span>
              <span className="font-mono text-cyan-400 font-bold">{reviewers} Engineers</span>
            </div>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((count) => (
                <button
                  key={count}
                  onClick={() => {
                    soundFx.playHoverTick();
                    setReviewers(count);
                  }}
                  className={`flex-1 py-1 rounded-lg font-mono text-xs border transition-all ${
                    reviewers === count
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
                      : 'bg-slate-800/40 text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Effort split: ~{(hours / Math.max(1, reviewers)).toFixed(1)} hrs/reviewer
            </div>
          </div>
        </div>
      </div>

      {/* 2. Optimization Summary KPI Cards */}
      {plannerResult && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/10 space-y-1">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Risk Coverage</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {(plannerResult.coverage_percent ?? plannerResult.risk_coverage_percentage ?? 0).toFixed(1)}%
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, plannerResult.coverage_percent ?? plannerResult.risk_coverage_percentage ?? 0)}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/10 space-y-1">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Allocated Hours</span>
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-bold font-mono text-cyan-400">
              {(plannerResult.planned_hours ?? plannerResult.allocated_hours ?? 0).toFixed(1)}{' '}
              <span className="text-xs text-slate-400 font-normal">/ {plannerResult.total_hours ?? hours} hrs</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              {(plannerResult.selected_files || []).length} priority files selected
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/10 space-y-1">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Total Risk Mitigated</span>
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-xl font-bold font-mono text-purple-300">
              {(plannerResult.total_risk_mitigated ?? 0).toFixed(1)} pts
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Speed model: ~140 LOC / hour
            </p>
          </div>
        </div>
      )}

      {/* 3. Recommended Review Allocation Checklist */}
      {plannerResult && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold text-white">
              Optimal Review Queue ({completedFiles.size} / {plannerResult.selected_files.length} complete)
            </span>
            <span className="font-mono text-[11px]">
              {plannerResult.unselected_count} low-ROI files deferred
            </span>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 font-mono">
            {plannerResult.selected_files.map((file, idx) => {
              const isChecked = completedFiles.has(file.path);
              return (
                <div
                  key={file.path}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                    isChecked
                      ? 'bg-slate-950/40 border-white/5 opacity-60'
                      : 'bg-slate-900/60 border-white/10 hover:border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      onClick={() => toggleCheck(file.path)}
                      className="text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    <div className="truncate">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-slate-500">#{idx + 1}</span>
                        <span className={`font-semibold text-xs ${isChecked ? 'line-through text-slate-500' : 'text-white'}`}>
                          {file.filename}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {file.loc} LOC
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {file.primary_driver}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-sm mt-0.5">
                        {file.path}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-right">
                    <div>
                      <div className="font-bold text-emerald-400 text-xs">
                        {file.estimated_hours}h
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ROI: {file.efficiency_roi}x
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectBuilding(file)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-400 transition-all border border-transparent hover:border-emerald-500/30"
                      title="Focus building in 3D"
                    >
                      <Layers className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
