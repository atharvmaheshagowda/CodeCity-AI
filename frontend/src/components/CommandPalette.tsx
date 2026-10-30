import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  FolderGit2,
  Activity,
  Layers,
  Flame,
  Clock,
  Zap,
  Play,
  Award,
  BatteryCharging,
  RotateCcw,
  Layout,
  FileCode,
  X,
  CornerDownLeft,
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { ColorMode, FileNode } from '../types';
import { soundFx } from '../utils/soundEffects';

interface ActionItem {
  id: string;
  category: 'Repository' | 'Visualization Mode' | 'Navigation' | 'System' | 'File';
  label: string;
  detail?: string;
  icon: any;
  shortcut?: string;
  onSelect: () => void;
}

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    repos,
    currentRepo,
    lowPowerMode,
    presentationMode,
    isLeftPanelCollapsed,
    closeCommandPalette,
    loadRepo,
    setColorMode,
    selectFile,
    openModelCard,
    togglePresentationMode,
    toggleLowPowerMode,
    toggleLeftPanel,
    triggerCameraReset,
    toggleInsights,
    setInsightsTab,
    toggleScatterPlot,
    toggleTerminalLog,
    toggleRepoComparison,
  } = useCityStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  // Build searchable commands
  const allActions: ActionItem[] = useMemo(() => {
    const list: ActionItem[] = [
      // Color Modes
      {
        id: 'mode-risk',
        category: 'Visualization Mode',
        label: 'Switch to Risk Color Mode',
        detail: 'Color by XGBoost predicted defect probability',
        icon: Activity,
        shortcut: '1',
        onSelect: () => setColorMode('risk'),
      },
      {
        id: 'mode-complexity',
        category: 'Visualization Mode',
        label: 'Switch to Complexity Color Mode',
        detail: 'Color by cyclomatic complexity',
        icon: Layers,
        shortcut: '2',
        onSelect: () => setColorMode('complexity'),
      },
      {
        id: 'mode-churn',
        category: 'Visualization Mode',
        label: 'Switch to Churn Color Mode',
        detail: 'Color by 90-day git code churn',
        icon: Flame,
        shortcut: '3',
        onSelect: () => setColorMode('churn'),
      },
      {
        id: 'mode-age',
        category: 'Visualization Mode',
        label: 'Switch to File Age Color Mode',
        detail: 'Color by file creation and recency',
        icon: Clock,
        shortcut: '4',
        onSelect: () => setColorMode('age'),
      },
      {
        id: 'mode-impact',
        category: 'Visualization Mode',
        label: 'Switch to Impact Score Mode',
        detail: 'Color by risk probability × blast radius',
        icon: Zap,
        shortcut: '5',
        onSelect: () => setColorMode('impact'),
      },

      // System Actions
      {
        id: 'toggle-exhibition',
        category: 'System',
        label: presentationMode ? 'Exit Exhibition Mode' : 'Enter Exhibition Booth Mode',
        detail: 'Full-screen cinematic auto-orbit demonstration',
        icon: Play,
        shortcut: 'P',
        onSelect: () => togglePresentationMode(),
      },
      {
        id: 'toggle-low-power',
        category: 'System',
        label: lowPowerMode ? 'Disable Low-Power Mode (Enable Cinema Bloom)' : 'Enable Low-Power Mode (High Efficiency)',
        detail: 'Optimizes GPU rendering and battery usage',
        icon: BatteryCharging,
        onSelect: () => toggleLowPowerMode(),
      },
      {
        id: 'toggle-left-panel',
        category: 'System',
        label: isLeftPanelCollapsed ? 'Expand Intelligence Panel' : 'Collapse Intelligence Panel',
        detail: 'Maximize 3D metropolis canvas view',
        icon: Layout,
        onSelect: () => toggleLeftPanel(),
      },
      {
        id: 'reset-camera',
        category: 'System',
        label: 'Reset Camera Framing',
        detail: 'Re-center camera to overview angle',
        icon: RotateCcw,
        onSelect: () => triggerCameraReset(),
      },
      {
        id: 'open-model-card',
        category: 'System',
        label: 'View Model Evaluation Card',
        detail: 'Inspect ROC curve, Precision@10, and training leakage proof',
        icon: Award,
        onSelect: () => openModelCard(),
      },
      {
        id: 'open-review-planner',
        category: 'System',
        label: 'Open Review Budget Planner (Knapsack)',
        detail: 'Optimize review allocation maximizing defect risk mitigated',
        icon: Clock,
        onSelect: () => {
          setInsightsTab('plan');
          toggleInsights(true);
        },
      },
      {
        id: 'open-timelapse',
        category: 'System',
        label: 'Open Git History Time-Lapse (4D Replay)',
        detail: 'Choreographed month scrubber with dynamic building heights',
        icon: Play,
        onSelect: () => {
          setInsightsTab('time');
          toggleInsights(true);
        },
      },
      {
        id: 'open-scatter-matrix',
        category: 'System',
        label: 'Open 2D Hotspot Scatter Matrix',
        detail: 'Complexity vs Churn 4-quadrant interactive plot',
        icon: Layers,
        onSelect: () => toggleScatterPlot(),
      },
      {
        id: 'open-analysis-terminal',
        category: 'System',
        label: 'Open Live Analysis Engine Terminal',
        detail: 'View deterministic AST parsing, SHAP values, and PageRank events',
        icon: Activity,
        onSelect: () => toggleTerminalLog(),
      },
      {
        id: 'open-repo-comparison',
        category: 'System',
        label: 'Benchmark with Another Repository',
        detail: 'Dual side-by-side KPI and defect risk profile comparison',
        icon: FolderGit2,
        onSelect: () => toggleRepoComparison(),
      },
      {
        id: 'open-breaking-change',
        category: 'System',
        label: 'Simulate Breaking Change (AST Diffing)',
        detail: 'Identify broken call sites across repository without running code',
        icon: Zap,
        onSelect: () => {
          setInsightsTab('impact');
          toggleInsights(true);
        },
      },
    ];

    // Repositories
    repos.forEach((r) => {
      list.push({
        id: `repo-${r.id}`,
        category: 'Repository',
        label: `Load Repository: ${r.name}`,
        detail: `${r.summary?.total_files || 0} files • ${r.summary?.total_loc || 0} LOC`,
        icon: FolderGit2,
        onSelect: () => loadRepo(r.id),
      });
    });

    // Top Critical Files in Current Repo
    if (currentRepo) {
      currentRepo.files.forEach((f) => {
        list.push({
          id: `file-${f.id}`,
          category: 'File',
          label: f.filename,
          detail: `${f.directory || 'root'} • Risk: ${(f.risk_probability * 100).toFixed(0)}% • Impact: ${f.impact_score.toFixed(1)}`,
          icon: FileCode,
          onSelect: () => selectFile(f),
        });
      });
    }

    return list;
  }, [
    repos,
    currentRepo,
    lowPowerMode,
    presentationMode,
    isLeftPanelCollapsed,
    setColorMode,
    loadRepo,
    selectFile,
    openModelCard,
    togglePresentationMode,
    toggleLowPowerMode,
    toggleLeftPanel,
    triggerCameraReset,
  ]);

  // Filter actions based on query
  const filteredActions = useMemo(() => {
    if (!query.trim()) {
      return allActions.filter((a) => a.category !== 'File').slice(0, 15);
    }
    const q = query.toLowerCase();
    return allActions
      .filter((a) => a.label.toLowerCase().includes(q) || (a.detail && a.detail.toLowerCase().includes(q)))
      .slice(0, 20);
  }, [query, allActions]);

  // Keyboard navigation within palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      soundFx.playHoverTick();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredActions.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      soundFx.playHoverTick();
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % Math.max(1, filteredActions.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        soundFx.playClick();
        filteredActions[selectedIndex].onSelect();
        closeCommandPalette();
      }
    } else if (e.key === 'Escape') {
      closeCommandPalette();
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/75 backdrop-blur-xl select-none"
        onClick={() => {
          soundFx.playClick();
          closeCommandPalette();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: -16 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className="w-full max-w-xl glass-panel rounded-2xl border border-cyan-500/35 shadow-2xl overflow-hidden flex flex-col backdrop-blur-2xl bg-slate-950/92"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input Bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-slate-900/60">
            <Search className="w-4 h-4 text-cyan-400 shrink-0 mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a command, visualization mode, or filename..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-slate-500 hover:text-slate-300 mr-2 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <kbd className="text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
            {filteredActions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 font-mono">
                No matching commands or files found
              </div>
            ) : (
              filteredActions.map((action, idx) => {
                const Icon = action.icon;
                const isSelected = idx === selectedIndex;

                return (
                  <div
                    key={action.id}
                    onClick={() => {
                      soundFx.playClick();
                      action.onSelect();
                      closeCommandPalette();
                    }}
                    onMouseEnter={() => {
                      soundFx.playHoverTick();
                      setSelectedIndex(idx);
                    }}
                    className={`px-3 py-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/70 border border-cyan-500/50 text-white shadow-glow-cyan'
                        : 'hover:bg-white/5 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate mr-3">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-cyan-500/25 text-cyan-300' : 'bg-white/5 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-200 truncate flex items-center gap-2">
                          <span>{action.label}</span>
                          <span className="text-[9px] font-mono text-slate-400 uppercase px-1.5 py-0.2 rounded bg-white/5">
                            {action.category}
                          </span>
                        </div>
                        {action.detail && (
                          <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                            {action.detail}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {action.shortcut && (
                        <kbd className="text-[9px] font-mono text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                          {action.shortcut}
                        </kbd>
                      )}
                      {isSelected && (
                        <CornerDownLeft className="w-3.5 h-3.5 text-cyan-400 opacity-90" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Hints */}
          <div className="px-4 py-2 border-t border-white/10 bg-slate-900/50 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <div className="flex items-center space-x-3">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>ESC Close</span>
            </div>
            <span>CodeCity AI Command Palette</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
