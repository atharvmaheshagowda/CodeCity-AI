import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Sliders,
  AlertTriangle,
  GitBranch,
  ShieldAlert,
  BarChart2,
  Loader2,
  Radar,
  Flame,
  FileCode,
  Zap,
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { FileNode } from '../types';
import { soundFx } from '../utils/soundEffects';

export const LeftPanel: React.FC = () => {
  const {
    currentRepo,
    selectedFile,
    searchQuery,
    riskThreshold,
    selectedDirectory,
    isAnalyzing,
    analysisProgress,
    analysisMessage,
    analysisError,
    isLeftPanelCollapsed,
    setSearchQuery,
    setRiskThreshold,
    setSelectedDirectory,
    selectFile,
    setHoveredFile,
    analyzeRepository,
  } = useCityStore();

  const [repoUrlInput, setRepoUrlInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleAnalyzeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrlInput.trim()) return;
    soundFx.playClick();
    analyzeRepository(repoUrlInput.trim());
    setRepoUrlInput('');
  };

  // Directories list for filter dropdown
  const directories = useMemo(() => {
    if (!currentRepo) return [];
    const dirs = new Set<string>();
    currentRepo.files.forEach((f) => {
      if (f.directory) dirs.add(f.directory);
    });
    return Array.from(dirs).sort();
  }, [currentRepo]);

  // Ranked Top-Risk Files (sorted by risk_probability descending)
  const topRiskFiles = useMemo(() => {
    if (!currentRepo) return [];
    return [...currentRepo.files]
      .sort((a, b) => b.risk_probability - a.risk_probability)
      .slice(0, 16);
  }, [currentRepo]);

  if (isLeftPanelCollapsed) return null;

  return (
    <motion.aside
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -320, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="w-80 h-[calc(100vh-3.5rem)] glass-panel border-r border-white/10 flex flex-col z-20 select-none overflow-hidden shadow-glass-panel backdrop-blur-2xl bg-slate-950/85"
    >
      {/* 1. Repository Analysis Input Bar */}
      <div className="p-3.5 border-b border-white/10 bg-slate-900/40">
        <label className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-1.5 mb-1.5 font-mono">
          <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
          <span>Analyze Python Repository</span>
        </label>
        <form onSubmit={handleAnalyzeSubmit} className="flex gap-1.5">
          <input
            type="text"
            placeholder="https://github.com/org/repo"
            value={repoUrlInput}
            onChange={(e) => setRepoUrlInput(e.target.value)}
            disabled={isAnalyzing}
            className="flex-1 bg-slate-900/90 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500/50"
          />
          <button
            type="submit"
            disabled={isAnalyzing || !repoUrlInput.trim()}
            className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-medium transition-all shadow-glow-cyan flex items-center gap-1"
          >
            {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Scan</span>}
          </button>
        </form>

        {/* Live Analysis Progress Feedback */}
        {isAnalyzing && (
          <div className="mt-2.5 p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs">
            <div className="flex items-center justify-between text-[10px] text-cyan-300 font-mono mb-1">
              <span className="flex items-center gap-1.5">
                <Radar className="w-3 h-3 animate-spin text-cyan-400" />
                <span className="truncate max-w-[180px]">{analysisMessage || 'Processing repository...'}</span>
              </span>
              <span>{(analysisProgress * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full h-1 bg-cyan-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                style={{ width: `${Math.max(5, analysisProgress * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {analysisError && (
          <div className="mt-2 p-2 rounded-xl bg-rose-950/60 border border-rose-500/40 text-[10px] text-rose-300 flex items-start gap-1.5">
            <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
            <span>{analysisError}</span>
          </div>
        )}
      </div>

      {/* 2. Repository KPI Metrics Cards with Sparklines */}
      {currentRepo && (
        <div className="p-3 border-b border-white/10 grid grid-cols-2 gap-2 bg-slate-900/30">
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-white/5 relative overflow-hidden">
            <div className="text-[9px] text-slate-400 font-mono uppercase">Total Files</div>
            <div className="text-base font-bold text-slate-100 mt-0.5 font-mono">
              {currentRepo.summary.total_files}
              <span className="text-[9px] text-slate-500 font-normal ml-1">({currentRepo.summary.total_loc} LOC)</span>
            </div>
            {/* Ambient SVG Sparkline */}
            <svg className="w-full h-4 mt-1 opacity-35" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,15 Q25,5 50,12 T100,6" fill="none" stroke="#38bdf8" strokeWidth="2" />
            </svg>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-white/5 relative overflow-hidden">
            <div className="text-[9px] text-slate-400 font-mono uppercase">Avg Defect Risk</div>
            <div className={`text-base font-bold mt-0.5 font-mono ${currentRepo.summary.avg_risk >= 0.4 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {(currentRepo.summary.avg_risk * 100).toFixed(1)}%
            </div>
            {/* Ambient SVG Sparkline */}
            <svg className="w-full h-4 mt-1 opacity-35" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,18 Q30,14 60,6 T100,10" fill="none" stroke="#fb7185" strokeWidth="2" />
            </svg>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-white/5">
            <div className="text-[9px] text-slate-400 font-mono uppercase">Critical Impact</div>
            <div className="text-base font-bold text-amber-400 mt-0.5 flex items-center gap-1 font-mono">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentRepo.summary.critical_files_count}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-white/5">
            <div className="text-[9px] text-slate-400 font-mono uppercase">Model ROC-AUC</div>
            <div className="text-base font-bold text-cyan-400 mt-0.5 flex items-center gap-1 font-mono">
              <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentRepo.summary.model_roc_auc.toFixed(3)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Search and Quick Filters */}
      <div className="p-3 border-b border-white/10 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            id="city-search-input"
            type="text"
            placeholder="Search files... (Press 'F')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-[10px] text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={() => {
              soundFx.playHoverTick();
              setShowFilters(!showFilters);
            }}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <Sliders className="w-3 h-3" />
            <span>{showFilters ? 'Hide Filters' : 'Filter by Risk & Directory'}</span>
          </button>
          {riskThreshold > 0 && (
            <span className="text-[10px] font-mono text-rose-400">
              Min: {(riskThreshold * 100).toFixed(0)}%
            </span>
          )}
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 pt-2 border-t border-white/5"
          >
            {/* Risk Threshold Slider */}
            <div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>Risk Threshold</span>
                <span>{(riskThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.9"
                step="0.05"
                value={riskThreshold}
                onChange={(e) => setRiskThreshold(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Folder Dropdown */}
            {directories.length > 0 && (
              <div>
                <label className="text-[9px] font-mono text-slate-400 block mb-1">Directory</label>
                <select
                  value={selectedDirectory || ''}
                  onChange={(e) => setSelectedDirectory(e.target.value || null)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none font-mono"
                >
                  <option value="">All Directories</option>
                  {directories.map((dir) => (
                    <option key={dir} value={dir}>{dir}</option>
                  ))}
                </select>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* 4. Ranked Top-Risk Files List with 3D Hover & Click Synchronization */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        <div className="text-[10px] font-semibold uppercase font-mono tracking-wider text-slate-400 mb-2 flex items-center justify-between px-1">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>Ranked Hotspots</span>
          </span>
          <span className="text-[9px] text-slate-500">Click to focus</span>
        </div>

        {topRiskFiles.map((file, idx) => {
          const isSelected = selectedFile?.id === file.id || selectedFile?.path === file.path;
          const riskPct = (file.risk_probability * 100).toFixed(0);

          return (
            <motion.div
              key={file.id}
              id={`hotspot-item-${idx}`}
              data-testid={`hotspot-item-${idx}`}
              whileHover={{ y: -2 }}
              onClick={() => {
                soundFx.playClick();
                selectFile(isSelected ? null : file);
              }}
              onMouseEnter={() => {
                soundFx.playHoverTick();
                setHoveredFile(file);
              }}
              onMouseLeave={() => setHoveredFile(null)}
              className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                isSelected
                  ? 'bg-cyan-950/70 border-cyan-500/70 shadow-glow-cyan text-white'
                  : 'bg-slate-900/50 border-white/5 text-slate-300 hover:border-cyan-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-[9px] font-mono text-slate-500 w-3.5 shrink-0">{idx + 1}.</span>
                  <span className="font-mono text-slate-200 truncate font-semibold text-[11px]">
                    {file.filename}
                  </span>
                </div>

                {/* Risk Badge */}
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold shrink-0 ${
                    file.risk_probability >= 0.65
                      ? 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                      : file.risk_probability >= 0.35
                      ? 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {riskPct}%
                </span>
              </div>

              <div className="flex items-center justify-between mt-1.5 text-[9px] text-slate-400 font-mono">
                <span className="truncate text-slate-500 max-w-[120px]">{file.directory || 'root'}</span>
                <div className="flex items-center gap-2">
                  <span>Impact: <b className="text-slate-300">{file.impact_score.toFixed(1)}</b></span>
                  <span>Blast: <b className="text-cyan-400">{file.blast_radius?.total_count || 0}</b></span>
                </div>
              </div>

              {/* Micro Risk Bar */}
              <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    file.risk_probability >= 0.65
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                      : file.risk_probability >= 0.35
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                      : 'bg-gradient-to-r from-teal-500 to-emerald-500'
                  }`}
                  style={{ width: `${Math.max(4, file.risk_probability * 100)}%` }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.aside>
  );
};
