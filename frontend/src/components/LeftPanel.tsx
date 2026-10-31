import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  UploadCloud,
  FileArchive,
  Folder,
  Globe,
  Settings2,
  Filter,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { FileClassFilter } from '../types';
import { AnalysisSummaryCard } from './AnalysisSummaryCard';
import { soundFx } from '../utils/soundEffects';

export const LeftPanel: React.FC = () => {
  const {
    currentRepo,
    selectedFile,
    searchQuery,
    isAnalyzing,
    analysisProgress,
    analysisMessage,
    analysisError,
    isLeftPanelCollapsed,
    selectedLanguage,
    selectedFileClass,
    impactFocusMode,
    customExcludes,
    setSearchQuery,
    selectFile,
    setHoveredFile,
    analyzeRepository,
    uploadZipArchive,
    setSelectedLanguage,
    setSelectedFileClass,
    setImpactFocusMode,
    toggleCapabilitiesModal,
    toggleExclusionRulesModal,
  } = useCityStore();

  const [activeTab, setActiveTab] = useState<'repo' | 'analyze'>('repo');
  const [inputVal, setInputVal] = useState('https://github.com/user/repo');
  const [sortBy, setSortBy] = useState<'risk' | 'impact' | 'loc'>('risk');
  const [maxFilesCap, setMaxFilesCap] = useState(500);
  const [maxCommitsCap, setMaxCommitsCap] = useState(1000);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect input source type live
  const detectedSourceType = useMemo(() => {
    const val = inputVal.trim();
    if (!val) return null;
    if (val.toLowerCase().endsWith('.zip')) return { type: 'zip', label: 'ZIP Archive', icon: FileArchive, color: 'text-amber-400' };
    if (val.startsWith('/') || /^[a-zA-Z]:[\\/]/.test(val)) return { type: 'local', label: 'Local Directory', icon: Folder, color: 'text-emerald-400' };
    if (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('git@')) {
      return { type: 'git', label: 'Git Remote URL', icon: Globe, color: 'text-cyan-400' };
    }
    return { type: 'unknown', label: 'Input Path/URL', icon: Link, color: 'text-slate-400' };
  }, [inputVal]);

  const handleAnalyzeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    soundFx.playClick();
    analyzeRepository(inputVal.trim(), {
      maxFiles: maxFilesCap,
      maxCommits: maxCommitsCap,
    });
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.zip')) {
        soundFx.playClick();
        uploadZipArchive(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.name.toLowerCase().endsWith('.zip')) {
        soundFx.playClick();
        uploadZipArchive(file);
      }
    }
  };

  // Filtered & Ranked Files list
  const rankedFiles = useMemo(() => {
    if (!currentRepo) return [];
    let list = [...currentRepo.files];

    // Filter by Language chip
    if (selectedLanguage) {
      list = list.filter((f) => (f.language || 'other').toLowerCase() === selectedLanguage.toLowerCase());
    }

    // Filter by File Class
    if (selectedFileClass !== 'all') {
      list = list.filter((f) => (f.file_class || 'source').toLowerCase() === selectedFileClass.toLowerCase());
    }

    // Filter by Search Query (with rule syntax support)
    if (searchQuery.trim()) {
      const tokens = searchQuery.trim().split(/\s+/);
      list = list.filter((f) => {
        return tokens.every((token) => {
          const riskMatch = token.match(/^risk:([><]=?)([\d.]+)/i);
          if (riskMatch) {
            const op = riskMatch[1];
            const val = parseFloat(riskMatch[2]);
            if (op === '>' || op === '>=') return f.risk_probability >= val;
            if (op === '<' || op === '<=') return f.risk_probability <= val;
          }
          const locMatch = token.match(/^loc:([><]=?)(\d+)/i);
          if (locMatch) {
            const op = locMatch[1];
            const val = parseInt(locMatch[2]);
            if (op === '>' || op === '>=') return f.loc >= val;
            if (op === '<' || op === '<=') return f.loc <= val;
          }
          const ccMatch = token.match(/^(?:cc|complexity):([><]=?)(\d+)/i);
          if (ccMatch) {
            const op = ccMatch[1];
            const val = parseInt(ccMatch[2]);
            if (op === '>' || op === '>=') return f.max_complexity >= val;
            if (op === '<' || op === '<=') return f.max_complexity <= val;
          }
          const extMatch = token.match(/^ext:(\w+)/i);
          if (extMatch) {
            return f.filename.toLowerCase().endsWith('.' + extMatch[1].toLowerCase());
          }
          const langMatch = token.match(/^lang:(\w+)/i);
          if (langMatch) {
            return (f.language || '').toLowerCase() === langMatch[1].toLowerCase();
          }
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

    // Impact Focus Mode (Top N files by impact)
    if (impactFocusMode !== 'all') {
      const n = typeof impactFocusMode === 'number' ? impactFocusMode : parseInt(impactFocusMode);
      list = list.slice(0, n);
    }

    return list;
  }, [currentRepo, selectedLanguage, selectedFileClass, searchQuery, sortBy, impactFocusMode]);

  const fileClasses = currentRepo?.file_classes || {};
  const languages = currentRepo?.languages || [];

  if (isLeftPanelCollapsed) return null;

  return (
    <motion.aside
      initial={{ x: -330, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -330, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="w-84 h-[calc(100vh-4rem)] glass-panel border-r border-white/10 flex flex-col z-20 select-none overflow-hidden shadow-glass-panel backdrop-blur-2xl bg-slate-950/92"
    >
      {/* 1. Mode Tabs (Repository | Analyze Input) */}
      <div className="p-3 border-b border-white/10 flex items-center gap-2 bg-slate-900/40">
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('repo');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
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
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
            activeTab === 'analyze'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/50 shadow-glow-cyan'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Link className="w-3.5 h-3.5 text-slate-400" />
          <span>Analyze Input</span>
        </button>
      </div>

      {activeTab === 'analyze' ? (
        /* ANALYZE INPUT WORKFLOW */
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Analyze Input Form */}
          <form onSubmit={handleAnalyzeSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Git URL or Local Folder</span>
                {detectedSourceType && (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${detectedSourceType.color}`}>
                    <detectedSourceType.icon className="w-3 h-3" />
                    <span>{detectedSourceType.label}</span>
                  </span>
                )}
              </div>
              <input
                id="analyze-input-field"
                type="text"
                placeholder="https://github.com/org/repo or C:/path/to/repo"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                disabled={isAnalyzing}
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500/50 shadow-inner"
              />
            </div>

            {/* Drag & Drop ZIP Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-xl border-2 border-dashed cursor-pointer text-center space-y-1.5 transition-all ${
                isDragOver
                  ? 'border-cyan-400 bg-cyan-950/40 shadow-glow-cyan'
                  : 'border-white/10 hover:border-cyan-500/40 bg-slate-900/40'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".zip"
                className="hidden"
              />
              <UploadCloud className="w-6 h-6 text-cyan-400 mx-auto" />
              <div className="text-xs font-mono text-slate-200 font-semibold">
                Drop ZIP Archive Here
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                Safe extraction with Zip-Slip & Zip-Bomb defenses
              </div>
            </div>

            {/* Advanced Caps & Filters Accordion */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="flex items-center justify-between w-full text-[11px] font-mono text-slate-400 hover:text-slate-200"
              >
                <span className="flex items-center gap-1.5">
                  <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Configurable Caps & Rules</span>
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`} />
              </button>

              {showAdvancedOptions && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-3 text-xs font-mono">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Max Files Cap:</span>
                      <span className="text-cyan-400 font-bold">{maxFilesCap}</span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={2000}
                      step={50}
                      value={maxFilesCap}
                      onChange={(e) => setMaxFilesCap(parseInt(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Max Commits Cap:</span>
                      <span className="text-cyan-400 font-bold">{maxCommitsCap}</span>
                    </div>
                    <input
                      type="range"
                      min={200}
                      max={3000}
                      step={100}
                      value={maxCommitsCap}
                      onChange={(e) => setMaxCommitsCap(parseInt(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => toggleExclusionRulesModal(true)}
                      className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] border border-white/10 flex items-center justify-center gap-1"
                    >
                      <Filter className="w-3 h-3 text-violet-400" />
                      <span>Exclusion Rules</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCapabilitiesModal(true)}
                      className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] border border-white/10 flex items-center justify-center gap-1"
                    >
                      <Cpu className="w-3 h-3 text-cyan-400" />
                      <span>Capabilities</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              id="analyze-submit-btn"
              type="submit"
              disabled={isAnalyzing || !inputVal.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-mono font-semibold transition-all shadow-glow-cyan flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Metropolis...</span>
                </>
              ) : (
                <span>Analyze Any Codebase</span>
              )}
            </button>
          </form>

          {/* Analysis Progress / Error Card */}
          {isAnalyzing && (
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 space-y-2 animate-fade-in font-mono text-xs">
              <div className="flex items-center justify-between text-cyan-300 font-semibold text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Pipeline Progress</span>
                </span>
                <span>{(analysisProgress * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 shadow-glow-cyan transition-all duration-300"
                  style={{ width: `${Math.max(8, analysisProgress * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 truncate">{analysisMessage}</p>
            </div>
          )}

          {analysisError && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-xs font-mono space-y-1">
              <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Analysis Failed</span>
              </div>
              <p className="text-[11px] text-rose-200/80 leading-relaxed">{analysisError}</p>
            </div>
          )}
        </div>
      ) : (
        /* REPOSITORY BROWSER WORKFLOW */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Analysis Summary Card */}
          <div className="p-3 border-b border-white/10">
            <AnalysisSummaryCard />
          </div>

          {/* Language Chips Filter Bar */}
          {languages.length > 0 && (
            <div className="p-2.5 border-b border-white/10 bg-slate-900/30 space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="uppercase tracking-wider">Languages ({languages.length}):</span>
                <button
                  onClick={() => toggleCapabilitiesModal(true)}
                  className="text-cyan-400 hover:text-cyan-300 text-[10px] flex items-center gap-1"
                >
                  <Cpu className="w-3 h-3" />
                  <span>Capabilities Matrix</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto scrollbar-none">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedLanguage(null);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] transition-all ${
                    selectedLanguage === null
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-glow-cyan font-bold'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-white/5'
                  }`}
                >
                  All ({currentRepo?.summary.total_files || 0})
                </button>
                {languages.map((l) => {
                  const isActive = selectedLanguage?.toLowerCase() === l.name.toLowerCase();
                  return (
                    <button
                      key={l.name}
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedLanguage(isActive ? null : l.name);
                      }}
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] transition-all ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-glow-cyan font-bold'
                          : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-white/5'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: l.color }} />
                      <span>{l.display_name}</span>
                      <span className="text-slate-500">({l.file_count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* File Class Filter Pills & Focus Mode */}
          <div className="p-2.5 border-b border-white/10 bg-slate-900/20 space-y-2 font-mono">
            {/* File Class Pills */}
            <div className="flex items-center gap-1 text-[10px] overflow-x-auto scrollbar-none">
              {(['all', 'source', 'test', 'config', 'docs'] as FileClassFilter[]).map((cls) => {
                const isActive = selectedFileClass === cls;
                const count = cls === 'all' ? currentRepo?.summary.total_files : fileClasses[cls] || 0;
                return (
                  <button
                    key={cls}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedFileClass(cls);
                    }}
                    className={`px-2 py-0.5 rounded-lg capitalize transition-all shrink-0 ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-glow-cyan font-bold'
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <span>{cls}</span>
                    {count !== undefined && <span className="text-slate-500 ml-1">({count})</span>}
                  </button>
                );
              })}
            </div>

            {/* Focus Mode (55+ FPS Optimization) */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>Impact Focus Mode:</span>
              </span>
              <select
                id="focus-mode-select"
                value={impactFocusMode}
                onChange={(e) => {
                  soundFx.playClick();
                  setImpactFocusMode(e.target.value as any);
                }}
                className="bg-slate-900 text-cyan-300 font-mono text-[10px] px-2 py-0.5 rounded border border-white/10 focus:outline-none cursor-pointer"
              >
                <option value="all">All Files ({currentRepo?.files.length || 0})</option>
                <option value="250">Top 250 Impact (55+ FPS)</option>
                <option value="100">Top 100 Impact</option>
                <option value="50">Top 50 Impact</option>
              </select>
            </div>
          </div>

          {/* Search Bar & Sort */}
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
                onClick={() => toggleExclusionRulesModal(true)}
                className="p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-cyan-300 border border-white/10 transition-all"
                title="Exclusion Rules"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sort by Row */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-0.5 font-mono">
              <span className="text-[10px] text-slate-400">
                Showing {rankedFiles.length} files &bull; Sort:
              </span>
              <div className="flex items-center gap-1 text-[11px] text-cyan-400 cursor-pointer">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-cyan-400 font-mono text-[11px] focus:outline-none cursor-pointer"
                >
                  <option value="risk" className="bg-slate-950 text-slate-200">Risk (High &rarr; Low)</option>
                  <option value="impact" className="bg-slate-950 text-slate-200">Impact Score</option>
                  <option value="loc" className="bg-slate-950 text-slate-200">Lines of Code</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ranked Hotspot Files List */}
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
                  {/* Row 1: Rank, Icon, Filename, Language badge, Risk Badge */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-[10px] font-mono text-slate-500 w-3.5 shrink-0">{idx + 1}.</span>
                      <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span className="font-mono text-slate-200 truncate font-semibold text-[11px]">
                        {file.filename}
                      </span>
                      {file.language && (
                        <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-slate-800 text-slate-400 border border-white/5 uppercase shrink-0">
                          {file.language}
                        </span>
                      )}
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

                  {/* Row 2: Directory and Impact / Depends on / CC */}
                  <div className="flex items-center justify-between mt-1 text-[9px] text-slate-400 font-mono">
                    <span className="truncate text-slate-500">{file.directory || 'root'}/</span>
                    <div className="flex items-center gap-1.5">
                      <span>Impact: <b className="text-slate-300">{file.impact_score.toFixed(1)}</b></span>
                      <span className="text-slate-600">|</span>
                      <span>CC: <b className="text-slate-300">{file.max_complexity}</b></span>
                      {file.is_approximate_complexity && (
                        <span className="text-amber-400" title="Approximate branching complexity">~</span>
                      )}
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
        </div>
      )}
    </motion.aside>
  );
};
