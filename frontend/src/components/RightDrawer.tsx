import React from 'react';
import { motion } from 'motion/react';
import {
  X,
  ShieldAlert,
  Flame,
  Activity,
  GitCommit,
  Users,
  Clock,
  ArrowRight,
  Info,
  FileCode,
  Layers,
  Zap,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { soundFx } from '../utils/soundEffects';

export const RightDrawer: React.FC = () => {
  const {
    currentRepo,
    selectedFile,
    maxHopDepth,
    selectFile,
    setMaxHopDepth,
  } = useCityStore();

  if (!selectedFile) return null;

  const riskPct = Math.round(selectedFile.risk_probability * 100);
  const brHops = selectedFile.blast_radius?.hops || { 1: [], 2: [], 3: [] };

  // Circular Gauge SVG parameters
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (riskPct / 100) * circumference;

  const gaugeColor =
    riskPct >= 65 ? '#fb7185' : riskPct >= 35 ? '#fbbf24' : '#34d399';

  return (
    <motion.aside
      initial={{ x: 340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 340, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      className="w-80 md:w-88 h-[calc(100vh-3.5rem)] glass-panel border-l border-white/10 flex flex-col z-20 select-none overflow-hidden shadow-glass-panel backdrop-blur-2xl bg-slate-950/85"
    >
      {/* 1. Header with file details */}
      <div className="p-3.5 border-b border-white/10 flex items-start justify-between bg-slate-900/40">
        <div className="truncate pr-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mb-1">
            <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{selectedFile.directory || 'root'}</span>
          </div>
          <h2 className="text-sm font-bold font-mono text-white truncate" title={selectedFile.filename}>
            {selectedFile.filename}
          </h2>
        </div>
        <button
          onClick={() => {
            soundFx.playClick();
            selectFile(null);
          }}
          onMouseEnter={soundFx.playHoverTick}
          className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          title="Deselect file (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* 2. Risk Gauge & Impact Score Hero Card */}
        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 flex items-center justify-between">
          {/* Animated Circular Gauge */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-20 h-20 -rotate-90">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke={gaugeColor}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  filter:
                    riskPct >= 65
                      ? 'drop-shadow(0 0 8px rgba(251, 113, 133, 0.75))'
                      : riskPct >= 35
                      ? 'drop-shadow(0 0 7px rgba(251, 191, 36, 0.7))'
                      : 'drop-shadow(0 0 6px rgba(52, 211, 153, 0.6))',
                }}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-lg font-bold font-mono text-white">{riskPct}%</span>
              <span className="text-[8px] uppercase font-mono tracking-wider text-slate-400">Risk</span>
            </div>
          </div>

          {/* Impact Score & Ranking */}
          <div className="space-y-1.5 text-right font-mono">
            <div>
              <div className="text-[9px] uppercase text-slate-400">Architectural Impact</div>
              <div className="text-lg font-bold text-amber-400">
                {selectedFile.impact_score.toFixed(2)}
              </div>
            </div>
            <div className="text-[10px] text-slate-400">
              Risk Rank: <b className="text-slate-200">#{selectedFile.risk_rank || '-'}</b> of {currentRepo?.files.length}
            </div>
            <div className="text-[10px] text-slate-400">
              Blast Radius: <b className="text-cyan-400">{selectedFile.blast_radius?.total_count || 0} files</b>
            </div>
          </div>
        </div>

        {/* 3. Plain-English SHAP Narrative Explanation */}
        <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/25 text-xs">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-cyan-400 mb-1.5 uppercase tracking-wide">
            <Info className="w-3.5 h-3.5" />
            <span>AI Defect Diagnosis</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            {selectedFile.shap?.explanation_text || 'Standard metric profile with nominal defect exposure.'}
          </p>
        </div>

        {/* 4. SHAP Feature Contribution Bars */}
        {selectedFile.shap?.top_impacts && selectedFile.shap.top_impacts.length > 0 && (
          <div>
            <div className="text-[10px] font-semibold uppercase font-mono tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Feature Contribution (SHAP)</span>
              <span className="text-[9px] text-slate-500 font-normal">Impact on Risk</span>
            </div>

            <div className="space-y-1.5">
              {selectedFile.shap.top_impacts.map((driver, idx) => {
                const isPositive = driver.direction === 'increases_risk';
                const maxAbsShap = 2.0;
                const barWidthPct = Math.min(100, Math.max(12, (Math.abs(driver.shap_value) / maxAbsShap) * 100));

                return (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-[11px]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-300 font-medium flex items-center gap-1 font-sans">
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3 text-rose-400" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-emerald-400" />
                        )}
                        <span>{driver.label}</span>
                      </span>
                      <span className={`font-mono font-bold text-[10px] ${isPositive ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isPositive ? '+' : ''}{driver.shap_value.toFixed(2)}
                      </span>
                    </div>

                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden flex items-center">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isPositive ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-teal-500 to-emerald-400'
                        }`}
                        style={{ width: `${barWidthPct}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                      <span>Val: {driver.feature_value}</span>
                      <span>{isPositive ? 'Increases defect likelihood' : 'Mitigates defect likelihood'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. Blast Radius & Dependent Modules */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-semibold uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
              <span>Blast Radius Trajectory</span>
            </div>
            {/* Hop Depth Selector */}
            <div className="flex items-center space-x-1 bg-slate-900 px-2 py-0.5 rounded-xl border border-white/10 text-[9px] font-mono">
              <span className="text-slate-400">Depth:</span>
              {[1, 2, 3].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    soundFx.playBlastWave();
                    setMaxHopDepth(d);
                  }}
                  className={`px-1.5 py-0.2 rounded ${
                    maxHopDepth === d ? 'bg-cyan-400 text-black font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10">
            <div className="text-[11px] text-slate-400 mb-2.5">
              If this file fails, <b className="text-cyan-400">{selectedFile.blast_radius?.total_count || 0} dependent modules</b> may break directly or transitively.
            </div>

            {/* Hop Groups */}
            <div className="space-y-2.5">
              {[1, 2, 3].map((hop) => {
                const hopFiles = (brHops as any)[hop] || [];
                if (hopFiles.length === 0) return null;

                const hopColor =
                  hop === 1
                    ? 'border-sky-500/40 text-sky-400'
                    : hop === 2
                    ? 'border-purple-500/40 text-purple-400'
                    : 'border-rose-500/40 text-rose-400';

                return (
                  <div key={hop} className="space-y-1">
                    <div className="text-[9px] font-mono uppercase text-slate-500 flex items-center justify-between">
                      <span>Hop {hop} ({hop === 1 ? 'Direct Importers' : hop === 2 ? 'Indirect Callers' : 'Transitive Depth 3'})</span>
                      <span>{hopFiles.length} files</span>
                    </div>

                    <div className="space-y-1">
                      {hopFiles.slice(0, 5).map((depPath: string) => (
                        <div
                          key={depPath}
                          onClick={() => {
                            soundFx.playClick();
                            const node = currentRepo?.files.find((f) => f.path === depPath);
                            if (node) selectFile(node);
                          }}
                          onMouseEnter={soundFx.playHoverTick}
                          className={`px-2 py-1 rounded-xl bg-slate-900 border text-[10px] font-mono flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all ${hopColor}`}
                        >
                          <span className="truncate">{depPath}</span>
                          <ArrowRight className="w-3 h-3 shrink-0 ml-1 opacity-70" />
                        </div>
                      ))}
                      {hopFiles.length > 5 && (
                        <div className="text-[9px] font-mono text-slate-500 text-right">
                          +{hopFiles.length - 5} more files
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {(!selectedFile.blast_radius || selectedFile.blast_radius.total_count === 0) && (
                <div className="text-[10px] text-slate-500 italic text-center py-2 font-mono">
                  No downstream modules import this file. Blast radius is isolated.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 6. Raw Architectural Metrics Grid */}
        <div>
          <div className="text-[10px] font-semibold uppercase font-mono tracking-wider text-slate-400 mb-2">
            Raw Architectural Metrics
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div className="p-2 rounded-xl bg-slate-900/40 border border-white/5">
              <span className="text-[9px] text-slate-500 block font-mono">Lines of Code</span>
              <span className="font-mono text-slate-200 font-bold">{selectedFile.loc}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/40 border border-white/5">
              <span className="text-[9px] text-slate-500 block font-mono">Max Complexity</span>
              <span className="font-mono text-slate-200 font-bold">{selectedFile.max_complexity.toFixed(1)}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/40 border border-white/5">
              <span className="text-[9px] text-slate-500 block font-mono">90-Day Churn</span>
              <span className="font-mono text-slate-200 font-bold">{selectedFile.churn_90d} lines</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/40 border border-white/5">
              <span className="text-[9px] text-slate-500 block font-mono">Total Churn</span>
              <span className="font-mono text-slate-200 font-bold">{selectedFile.total_churn} lines</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/40 border border-white/5">
              <span className="text-[9px] text-slate-500 block font-mono">Past Bug Fixes</span>
              <span className="font-mono text-slate-200 font-bold">{selectedFile.past_bug_fixes}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/40 border border-white/5">
              <span className="text-[9px] text-slate-500 block font-mono">Authors</span>
              <span className="font-mono text-slate-200 font-bold">{selectedFile.distinct_authors}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/40 border border-white/5">
              <span className="text-[9px] text-slate-500 block font-mono">Days Since Edit</span>
              <span className="font-mono text-slate-200 font-bold">{selectedFile.days_since_last_change.toFixed(0)}d</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/40 border border-white/5">
              <span className="text-[9px] text-slate-500 block font-mono">File Age</span>
              <span className="font-mono text-slate-200 font-bold">{selectedFile.file_age_days.toFixed(0)}d</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/40 border border-white/5">
              <span className="text-[9px] text-slate-500 block font-mono">Fan-In (Dependents)</span>
              <span className="font-mono text-slate-200 font-bold">{selectedFile.fan_in}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/40 border border-white/5">
              <span className="text-[9px] text-slate-500 block font-mono">Fan-Out (Imports)</span>
              <span className="font-mono text-slate-200 font-bold">{selectedFile.fan_out}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};
