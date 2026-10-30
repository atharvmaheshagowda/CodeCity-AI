import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  AlertTriangle,
  FileCode,
  Eye,
  GitBranch,
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { soundFx } from '../utils/soundEffects';

export const RightDrawer: React.FC = () => {
  const {
    currentRepo,
    selectedFile,
    selectFile,
    triggerCameraReset,
  } = useCityStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'shap' | 'metrics' | 'dependents'>('overview');

  if (!selectedFile) return null;

  const riskPct = Math.round(selectedFile.risk_probability * 100);
  const isHighRisk = riskPct >= 50;

  // Circular Gauge SVG parameters
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (riskPct / 100) * circumference;

  // Dependent files
  const dependentsList = [
    { name: 'models.py', score: 0.3 },
    { name: 'schemas.py', score: 0.1 },
    { name: 'test.py', score: 0.1 },
  ];

  return (
    <motion.aside
      initial={{ x: 360, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 360, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      className="w-80 md:w-84 h-[calc(100vh-4rem)] glass-panel border-l border-white/10 flex flex-col z-20 select-none overflow-hidden shadow-glass-panel backdrop-blur-2xl bg-slate-950/90"
    >
      {/* 1. Header with Breadcrumb & Filename */}
      <div className="p-3.5 border-b border-white/10 flex items-start justify-between bg-slate-900/30">
        <div className="truncate pr-2">
          <div className="text-[10px] font-mono text-slate-400 mb-0.5">
            {selectedFile.directory || 'root'} /
          </div>
          <div className="flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
            <h2 className="text-base font-bold font-mono text-white truncate" title={selectedFile.filename}>
              {selectedFile.filename}
            </h2>
          </div>
        </div>
        <button
          onClick={() => {
            soundFx.playClick();
            selectFile(null);
          }}
          onMouseEnter={soundFx.playHoverTick}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          title="Deselect file (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Sub-Tabs (Overview | SHAP | Metrics | Dependents) */}
      <div className="flex items-center px-3.5 border-b border-white/10 text-xs font-mono bg-slate-900/20">
        {(['overview', 'shap', 'metrics', 'dependents'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(tab);
              }}
              className={`py-2 px-3 border-b-2 font-medium capitalize transition-all ${
                isActive
                  ? 'border-cyan-400 text-cyan-300 shadow-[0_2px_8px_rgba(56,189,248,0.4)]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'overview' ? 'Overview' : tab === 'shap' ? 'SHAP' : tab === 'metrics' ? 'Metrics' : 'Dependents'}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {/* 3. Circular Gauge & Quick Stats Card */}
        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 flex items-center justify-between">
          {/* Animated Circular Gauge */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-24 h-24 -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke={isHighRisk ? '#f43f5e' : '#10b981'}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  filter: isHighRisk
                    ? 'drop-shadow(0 0 10px rgba(244, 63, 94, 0.85))'
                    : 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.75))',
                }}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold font-mono text-white">{riskPct}%</span>
              <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">
                Defect Risk
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="space-y-2 font-mono text-right flex-1 pl-4">
            <div>
              <div className="text-[10px] text-slate-400">Impact Score</div>
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm font-bold text-slate-200">{selectedFile.impact_score.toFixed(1)}</span>
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-4/5 h-full bg-rose-500 rounded-full shadow-[0_0_6px_rgba(244,63,94,0.7)]" />
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400">Lines of Code</div>
              <div className="flex items-center justify-end gap-2 text-xs">
                <span className="text-slate-500 text-[10px]">{selectedFile.loc} LOC</span>
                <span className="text-slate-200 font-bold">{selectedFile.loc}</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400">Last Change</div>
              <div className="text-xs font-bold text-slate-200">
                {selectedFile.days_since_last_change.toFixed(0)} days ago
              </div>
            </div>
          </div>
        </div>

        {/* 4. High Risk Alert Callout Card */}
        {isHighRisk && (
          <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs shadow-[0_0_12px_rgba(244,63,94,0.15)]">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-rose-400 mb-1">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>High risk file</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              This file is likely to contain a bug in the next 90 days and is widely depended upon.
            </p>
          </div>
        )}

        {/* 5. "Why this file is risky?" Section */}
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-slate-200 font-sans">Why this file is risky?</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {selectedFile.shap?.explanation_text ||
              'This file has high cyclomatic complexity, frequent recent changes, and is imported by multiple other files. Similar files in the training data have a higher chance of requiring bug fixes.'}
          </p>
        </div>

        {/* 6. "Top contributing factors" (SHAP) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="font-semibold text-slate-300 font-sans">Top contributing factors</span>
            <span className="text-[10px] text-slate-500">SHAP value</span>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            {/* Factor 1: Complexity */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-300 text-[11px] truncate flex-1">Complexity (cyclomatic)</span>
              <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden flex items-center">
                <div className="w-[85%] h-full bg-rose-500 rounded-full shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
              </div>
              <span className="text-rose-400 font-bold text-[11px] w-9 text-right">+0.42</span>
            </div>

            {/* Factor 2: Recent changes */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-300 text-[11px] truncate flex-1">Recent changes (90 days)</span>
              <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden flex items-center">
                <div className="w-[60%] h-full bg-rose-500 rounded-full shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
              </div>
              <span className="text-rose-400 font-bold text-[11px] w-9 text-right">+0.28</span>
            </div>

            {/* Factor 3: Lines of code */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-300 text-[11px] truncate flex-1">Lines of code</span>
              <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden flex items-center">
                <div className="w-[45%] h-full bg-rose-500 rounded-full shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
              </div>
              <span className="text-rose-400 font-bold text-[11px] w-9 text-right">+0.17</span>
            </div>

            {/* Factor 4: Number of dependents */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-300 text-[11px] truncate flex-1">Number of dependents</span>
              <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden flex items-center">
                <div className="w-[30%] h-full bg-rose-500 rounded-full shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
              </div>
              <span className="text-rose-400 font-bold text-[11px] w-9 text-right">+0.11</span>
            </div>

            {/* Factor 5: File age (mitigator) */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-300 text-[11px] truncate flex-1">File age</span>
              <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden flex items-center">
                <div className="w-[20%] h-full bg-blue-500 rounded-full shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
              </div>
              <span className="text-blue-400 font-bold text-[11px] w-9 text-right">-0.06</span>
            </div>

            {/* Factor 6: Number of authors */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-300 text-[11px] truncate flex-1">Number of authors</span>
              <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden flex items-center">
                <div className="w-[25%] h-full bg-blue-500 rounded-full shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
              </div>
              <span className="text-blue-400 font-bold text-[11px] w-9 text-right">-0.08</span>
            </div>
          </div>
        </div>

        {/* 7. "Dependent files (3)" Section */}
        <div className="space-y-2 pt-1 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 font-sans">
              Dependent files ({dependentsList.length})
            </span>
            <button
              onClick={() => soundFx.playWhoosh()}
              className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 font-mono bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-cyan-500/30"
            >
              <Eye className="w-3 h-3 text-cyan-400" />
              <span>View in graph</span>
            </button>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            {dependentsList.map((dep) => (
              <div
                key={dep.name}
                onClick={() => {
                  soundFx.playClick();
                  const target = currentRepo?.files.find((f) => f.filename === dep.name);
                  if (target) selectFile(target);
                }}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/40 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-200 text-[11px]">{dep.name}</span>
                </div>
                <span className="text-slate-400 text-[11px] font-bold">{dep.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 8. Bottom Action Button: Show Blast Radius */}
      <div className="p-3.5 border-t border-white/10 bg-slate-900/40">
        <button
          onClick={() => {
            soundFx.playBlastWave();
            triggerCameraReset();
          }}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs font-mono flex items-center justify-center gap-2 shadow-glow-cyan transition-all border border-cyan-400/50"
        >
          <GitBranch className="w-4 h-4 text-white" />
          <span>Show Blast Radius (3 files)</span>
        </button>
      </div>
    </motion.aside>
  );
};
