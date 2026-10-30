import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Sliders,
  AlertTriangle,
  FolderGit2,
  Link,
  ShieldAlert,
  BarChart2,
  Loader2,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { soundFx } from '../utils/soundEffects';

export const LeftPanel: React.FC = () => {
  const {
    currentRepo,
    selectedFile,
    searchQuery,
    isAnalyzing,
    isLeftPanelCollapsed,
    setSearchQuery,
    selectFile,
    setHoveredFile,
    analyzeRepository,
  } = useCityStore();

  const [activeTab, setActiveTab] = useState<'repo' | 'analyze'>('repo');
  const [repoUrlInput, setRepoUrlInput] = useState('https://github.com/user/repo');
  const [sortBy, setSortBy] = useState<'risk' | 'impact' | 'loc'>('risk');

  const handleAnalyzeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrlInput.trim()) return;
    soundFx.playClick();
    analyzeRepository(repoUrlInput.trim());
  };

  // Ranked Files list
  const rankedFiles = useMemo(() => {
    if (!currentRepo) return [];
    let list = [...currentRepo.files];

    // Filter by search query with C9 Rule-Based Syntax (risk:>0.8 loc:>200 cc:>10 ext:py)
    if (searchQuery.trim()) {
      const tokens = searchQuery.trim().split(/\s+/);
      list = list.filter((f) => {
        return tokens.every((token) => {
          // Rule: risk:>0.5 or risk:<0.3
          const riskMatch = token.match(/^risk:([><]=?)([\d.]+)/i);
          if (riskMatch) {
            const op = riskMatch[1];
            const val = parseFloat(riskMatch[2]);
            if (op === '>' || op === '>=') return f.risk_probability >= val;
            if (op === '<' || op === '<=') return f.risk_probability <= val;
          }
          // Rule: loc:>200 or loc:<50
          const locMatch = token.match(/^loc:([><]=?)(\d+)/i);
          if (locMatch) {
            const op = locMatch[1];
            const val = parseInt(locMatch[2]);
            if (op === '>' || op === '>=') return f.loc >= val;
            if (op === '<' || op === '<=') return f.loc <= val;
          }
          // Rule: cc:>10 or complexity:>5
          const ccMatch = token.match(/^(?:cc|complexity):([><]=?)(\d+)/i);
          if (ccMatch) {
            const op = ccMatch[1];
            const val = parseInt(ccMatch[2]);
            if (op === '>' || op === '>=') return f.max_complexity >= val;
            if (op === '<' || op === '<=') return f.max_complexity <= val;
          }
          // Rule: ext:py
          const extMatch = token.match(/^ext:(\w+)/i);
          if (extMatch) {
            return f.filename.toLowerCase().endsWith('.' + extMatch[1].toLowerCase());
          }
          // Substring match
          const q = token.toLowerCase();
          return f.path.toLowerCase().includes(q) || f.filename.toLowerCase().includes(q);
        });
      });
    }

    // Sort
    if (sortBy === 'risk') {
      list.sort((a, b) => b.risk_probability - a.risk_probability);
    } else if (sortBy === 'impact') {
      list.sort((a, b) => b.impact_score - a.impact_score);
    } else if (sortBy === 'loc') {
      list.sort((a, b) => b.loc - a.loc);
    }

    return list;
  }, [currentRepo, searchQuery, sortBy]);

  return (
    <motion.aside
      initial={{ x: -340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -340, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      className="w-76 md:w-80 h-[calc(100vh-3.5rem)] glass-panel border-r border-white/10 flex flex-col z-20 select-none overflow-hidden shadow-glass-panel backdrop-blur-2xl bg-slate-950/90"
    >
      {/* 1. Mode Tabs (Repository | Analyze URL) */}
      <div className="p-3 border-b border-white/10 flex items-center gap-2 bg-slate-900/30">
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('repo');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'repo'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/50 shadow-glow-cyan'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Repository</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('analyze');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'analyze'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/50 shadow-glow-cyan'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Link className="w-3.5 h-3.5 text-slate-400" />
          <span>Analyze URL</span>
        </button>
      </div>

      {/* 2. Repository URL Input Box */}
      <div className="p-3 border-b border-white/10 bg-slate-900/20">
        <form onSubmit={handleAnalyzeSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="https://github.com/user/repo"
            value={repoUrlInput}
            onChange={(e) => setRepoUrlInput(e.target.value)}
            disabled={isAnalyzing}
            className="flex-1 bg-slate-900/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500/50"
          />
          <button
            type="submit"
            disabled={isAnalyzing || !repoUrlInput.trim()}
            className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-medium transition-all shadow-glow-cyan flex items-center gap-1"
          >
            {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Scan</span>}
          </button>
        </form>
      </div>

      {/* 3. 2x2 KPI Metrics Cards with Sparklines */}
      {currentRepo && (
        <div className="p-3 border-b border-white/10 grid grid-cols-2 gap-2 bg-slate-900/40">
          {/* Card 1: Workspace Files */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 relative overflow-hidden" title="Total Python files in this workspace">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Total Files</div>
                <div className="text-lg font-bold text-slate-100 font-mono mt-0.5">
                  {currentRepo.summary.total_files}
                </div>
              </div>
              {/* Glowing Blue Sparkline */}
              <svg className="w-12 h-6 text-cyan-400" viewBox="0 0 50 20" fill="none">
                <path
                  d="M2,16 Q15,4 28,12 T48,6"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_4px_rgba(56,189,248,0.8)]"
                />
              </svg>
            </div>
          </div>

          {/* Card 2: Average Risk */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 relative overflow-hidden" title="Total Python files in this workspace">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Avg Defect Risk</div>
                <div className="text-lg font-bold text-cyan-400 font-mono mt-0.5">
                  {(currentRepo.summary.avg_risk * 100).toFixed(1)}%
                </div>
              </div>
              {/* Glowing Cyan Sparkline */}
              <svg className="w-12 h-6 text-teal-400" viewBox="0 0 50 20" fill="none">
                <path
                  d="M2,14 Q14,18 28,8 T48,10"
                  stroke="#2dd4bf"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_4px_rgba(45,212,191,0.8)]"
                />
              </svg>
            </div>
          </div>

          {/* Card 3: Critical Files */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10" title="Files with 50%+ risk of containing bugs">
            <div className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Critical Files</div>
            <div className="text-lg font-bold text-amber-400 font-mono mt-0.5 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>{currentRepo.summary.critical_files_count}</span>
            </div>
          </div>

          {/* Card 4: Model ROC-AUC */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10" title="Files with 50%+ risk of containing bugs">
            <div className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Model ROC-AUC</div>
            <div className="text-lg font-bold text-cyan-400 font-mono mt-0.5 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <span>{currentRepo.summary.model_roc_auc.toFixed(3)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Search Bar & Filter Button */}
      <div className="p-3 border-b border-white/10 space-y-2">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              id="city-search-input"
              type="text"
              placeholder='Search files... (Press "/")'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <button
            onClick={() => soundFx.playHoverTick()}
            className="p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-cyan-300 border border-white/10 transition-all"
            title="Filters"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sort by Row */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-0.5 font-mono">
          <span className="text-[10px] text-slate-400">Sort by:</span>
          <div className="flex items-center gap-1 text-[11px] text-cyan-400 cursor-pointer">
            <span>Risk (High &rarr; Low)</span>
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* 5. Ranked Hotspot Files List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {rankedFiles.map((file, idx) => {
          const isSelected = selectedFile?.id === file.id || selectedFile?.path === file.path;
          const riskPct = Math.round(file.risk_probability * 100);
          const isHighRisk = riskPct >= 50;

          return (
            <motion.div
              key={file.id}
              id={`hotspot-item-${idx}`}
              data-testid={`hotspot-item-${idx}`}
              whileHover={{ y: -1 }}
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
                  ? 'bg-cyan-950/70 border-cyan-400/80 shadow-glow-cyan text-white'
                  : 'bg-slate-900/60 border-white/5 text-slate-300 hover:border-cyan-500/40'
              }`}
            >
              {/* Row 1: Rank Number, File Icon, Filename, Risk Badge */}
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-[10px] font-mono text-slate-500 w-3.5 shrink-0">{idx + 1}.</span>
                  <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="font-mono text-slate-200 truncate font-semibold text-[11px]">
                    {file.filename}
                  </span>
                </div>

                {/* Risk Badge */}
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold shrink-0 ${
                    isHighRisk
                      ? 'bg-rose-950/80 text-rose-400 border border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.35)]'
                      : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {riskPct}%
                </span>
              </div>

              {/* Row 2: Directory and Impact / Depends on */}
              <div className="flex items-center justify-between mt-1 text-[9px] text-slate-400 font-mono">
                <span className="truncate text-slate-500">{file.directory || 'root'}/</span>
                <div className="flex items-center gap-1.5">
                  <span>Impact: <b className="text-slate-300">{file.impact_score.toFixed(1)}</b></span>
                  <span className="text-slate-600">|</span>
                  <span title="Number of other files depending on this file">Used by: <b className="text-slate-300">{file.blast_radius?.total_count || 0}</b></span>
                </div>
              </div>

              {/* Row 3: Colored Progress Bar */}
              <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isHighRisk
                      ? 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                      : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                  }`}
                  style={{ width: `${Math.max(6, riskPct)}%` }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.aside>
  );
};
