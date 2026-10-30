import React, { useState, useEffect } from 'react';
import {
  Sliders,
  RotateCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { soundFx } from '../utils/soundEffects';

export const WhatIfPanel: React.FC = () => {
  const {
    selectedFile,
    whatIfResult,
    runWhatIf,
    resetWhatIf,
  } = useCityStore();

  if (!selectedFile) return null;

  const [complexity, setComplexity] = useState(selectedFile.max_complexity || 10);
  const [churn, setChurn] = useState(selectedFile.churn_90d || 100);
  const [loc, setLoc] = useState(selectedFile.loc || 200);
  const [bugFixes, setBugFixes] = useState(selectedFile.past_bug_fixes || 0);

  // Sync state if selected file changes
  useEffect(() => {
    setComplexity(selectedFile.max_complexity || 10);
    setChurn(selectedFile.churn_90d || 100);
    setLoc(selectedFile.loc || 200);
    setBugFixes(selectedFile.past_bug_fixes || 0);
    resetWhatIf();
  }, [selectedFile.path]);

  const handleSliderChange = (type: 'complexity' | 'churn' | 'loc' | 'fixes', val: number) => {
    let newComp = complexity;
    let newChurn = churn;
    let newLoc = loc;
    let newFixes = bugFixes;

    if (type === 'complexity') {
      newComp = val;
      setComplexity(val);
    } else if (type === 'churn') {
      newChurn = val;
      setChurn(val);
    } else if (type === 'loc') {
      newLoc = val;
      setLoc(val);
    } else if (type === 'fixes') {
      newFixes = val;
      setBugFixes(val);
    }

    soundFx.playHoverTick();
    runWhatIf(selectedFile.path, {
      max_complexity: newComp,
      churn_90d: newChurn,
      loc: newLoc,
      past_bug_fixes: newFixes,
    });
  };

  const handleReset = () => {
    soundFx.playClick();
    setComplexity(selectedFile.max_complexity || 10);
    setChurn(selectedFile.churn_90d || 100);
    setLoc(selectedFile.loc || 200);
    setBugFixes(selectedFile.past_bug_fixes || 0);
    resetWhatIf();
  };

  const origRiskPct = Math.round(selectedFile.risk_probability * 100);
  const newRiskPct = whatIfResult ? Math.round(whatIfResult.new_risk * 100) : origRiskPct;
  const deltaPct = whatIfResult ? Math.round(whatIfResult.delta_risk * 100) : 0;
  const isReduced = deltaPct < 0;

  return (
    <div className="space-y-4 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="font-semibold text-white">Interactive "What-If" Simulator</h3>
        </div>
        {whatIfResult && (
          <button
            onClick={handleReset}
            className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 hover:text-white bg-white/5 hover:bg-white/10"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <p className="text-[11px] text-slate-400 leading-normal">
        See how cleaning up or refactoring this file would lower its bug risk. Move the sliders to test ideas!
      </p>

      {/* Before / After Risk Card */}
      <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
        <div className="flex items-center justify-between font-mono">
          <div>
            <div className="text-[10px] text-slate-400">Baseline Risk</div>
            <div className="text-base font-bold text-slate-300">{origRiskPct}%</div>
          </div>

          <div className="text-center">
            <span className="text-slate-500 font-bold">&rarr;</span>
          </div>

          <div>
            <div className="text-[10px] text-slate-400">Predicted Risk</div>
            <div className={`text-base font-bold ${newRiskPct > origRiskPct ? 'text-rose-400' : 'text-emerald-400'}`}>
              {newRiskPct}%
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-400">Delta</div>
            <div
              className={`text-sm font-bold flex items-center justify-end gap-0.5 ${
                isReduced ? 'text-emerald-400' : deltaPct > 0 ? 'text-rose-400' : 'text-slate-400'
              }`}
            >
              {isReduced ? <TrendingDown className="w-3.5 h-3.5" /> : deltaPct > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : null}
              <span>{deltaPct > 0 ? `+${deltaPct}%` : `${deltaPct}%`}</span>
            </div>
          </div>
        </div>

        {whatIfResult && (
          <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>New Impact Score:</span>
            <span className="text-cyan-300 font-bold">{whatIfResult.new_impact.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Sliders Area */}
      <div className="space-y-3 font-mono">
        {/* 1. Cyclomatic Complexity */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300">Code Complexity (Branching Logic)</span>
            <span className="text-cyan-300 font-bold">{complexity}</span>
          </div>
          <input
            type="range"
            min="1"
            max="35"
            step="1"
            value={complexity}
            onChange={(e) => handleSliderChange('complexity', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>Clean (1)</span>
            <span>Measured: {selectedFile.max_complexity}</span>
            <span>Spaghetti (35)</span>
          </div>
        </div>

        {/* 2. 90-day Churn */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300">Recent Edits (90-Day Churn)</span>
            <span className="text-cyan-300 font-bold">{churn}</span>
          </div>
          <input
            type="range"
            min="0"
            max="800"
            step="10"
            value={churn}
            onChange={(e) => handleSliderChange('churn', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>Quiet (0)</span>
            <span>Measured: {selectedFile.churn_90d}</span>
            <span>High Churn (800)</span>
          </div>
        </div>

        {/* 3. Lines of Code */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300">File Length (Lines of Code)</span>
            <span className="text-cyan-300 font-bold">{loc}</span>
          </div>
          <input
            type="range"
            min="20"
            max="1200"
            step="20"
            value={loc}
            onChange={(e) => handleSliderChange('loc', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* 4. Past Bug Fixes */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300">Past Bug Fixes</span>
            <span className="text-cyan-300 font-bold">{bugFixes}</span>
          </div>
          <input
            type="range"
            min="0"
            max="8"
            step="1"
            value={bugFixes}
            onChange={(e) => handleSliderChange('fixes', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>

      {/* Dynamic Narrative from What-If */}
      {whatIfResult?.shap?.explanation_text && (
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
          <div className="text-[10px] font-mono text-cyan-400 font-semibold">Simulated Narrative:</div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            {whatIfResult.shap.explanation_text}
          </p>
        </div>
      )}
    </div>
  );
};

