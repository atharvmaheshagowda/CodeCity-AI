import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Filter,
  Plus,
  Trash2,
  FolderMinus,
  FileCode,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { soundFx } from '../utils/soundEffects';

export const ExclusionRulesModal: React.FC = () => {
  const {
    isExclusionRulesModalOpen,
    toggleExclusionRulesModal,
    currentRepo,
    customExcludes,
    addCustomExclude,
    removeCustomExclude,
    defaultExclusions,
    fetchDefaultExclusions,
  } = useCityStore();

  const [newRuleInput, setNewRuleInput] = useState('');

  useEffect(() => {
    if (isExclusionRulesModalOpen && !defaultExclusions) {
      fetchDefaultExclusions();
    }
  }, [isExclusionRulesModalOpen, defaultExclusions, fetchDefaultExclusions]);

  if (!isExclusionRulesModalOpen) return null;

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleInput.trim()) return;
    soundFx.playClick();
    addCustomExclude(newRuleInput.trim());
    setNewRuleInput('');
  };

  const exclusionSummary = currentRepo?.exclusion_summary;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl select-none"
        onClick={() => {
          soundFx.playClick();
          toggleExclusionRulesModal(false);
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative w-full max-w-3xl glass-panel rounded-2xl border border-white/15 p-6 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col backdrop-blur-2xl bg-slate-950/95"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shadow-glow-violet">
                <Filter className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2 font-display">
                  <span>File Exclusion Rules & Filtering Engine</span>
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Configurable filters respecting .gitignore, build artifacts, vendors, minified files, and generated headers.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                soundFx.playClick();
                toggleExclusionRulesModal(false);
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-6">
            {/* 1. Current Repository Exclusion Statistics */}
            {exclusionSummary && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Current Repository Filtering Audit</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase block">Analyzed Files</span>
                    <span className="text-lg font-bold text-cyan-400">{exclusionSummary.analyzed}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase block">Excluded Files</span>
                    <span className="text-lg font-bold text-rose-400">{exclusionSummary.excluded}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-white/5 col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase block">Exclusion Breakdown</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {Object.entries(exclusionSummary.reasons || {}).map(([reason, count]) => (
                        <span
                          key={reason}
                          className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] border border-white/10"
                        >
                          {reason}: <b>{count}</b>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Custom Glob Exclusion Rules */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <FolderMinus className="w-4 h-4 text-cyan-400" />
                  <span>Custom Exclusion Patterns (Glob)</span>
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Applies to new analyses</span>
              </div>

              {/* Add Input */}
              <form onSubmit={handleAddRule} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. *.gen.ts, legacy/**, dist/*"
                  value={newRuleInput}
                  onChange={(e) => setNewRuleInput(e.target.value)}
                  className="flex-1 bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  type="submit"
                  disabled={!newRuleInput.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-medium font-mono flex items-center gap-1.5 transition-all shadow-glow-cyan"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Pattern</span>
                </button>
              </form>

              {/* Custom Rules List */}
              {customExcludes.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {customExcludes.map((pattern) => (
                    <span
                      key={pattern}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono"
                    >
                      <span>{pattern}</span>
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          removeCustomExclude(pattern);
                        }}
                        className="p-0.5 hover:text-rose-400 transition-colors"
                        title="Remove pattern"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-mono italic">
                  No custom rules defined. Using default exclusions below.
                </p>
              )}
            </div>

            {/* 3. Default Built-In Exclusions */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-3 text-xs font-mono">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-slate-400" />
                <span>Default Exclusion Engine Filters</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Dirs */}
                <div className="p-3 rounded-lg bg-slate-950/70 border border-white/5 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Directories</span>
                  <div className="flex flex-wrap gap-1 text-[10px] text-slate-300 max-h-32 overflow-y-auto">
                    {(defaultExclusions?.directories || [
                      '.git', 'node_modules', 'vendor', 'dist', 'build', 'target', 'out', '.venv', '__pycache__', 'coverage', '.next', '.idea'
                    ]).map((dir) => (
                      <span key={dir} className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/5">
                        {dir}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Exts */}
                <div className="p-3 rounded-lg bg-slate-950/70 border border-white/5 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Binary & Asset Extensions</span>
                  <div className="flex flex-wrap gap-1 text-[10px] text-slate-300 max-h-32 overflow-y-auto">
                    {(defaultExclusions?.extensions || [
                      '.png', '.jpg', '.pdf', '.zip', '.tar', '.exe', '.dll', '.so', '.dylib', '.wasm', '.woff2', '.ttf'
                    ]).map((ext) => (
                      <span key={ext} className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/5">
                        {ext}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Filenames */}
                <div className="p-3 rounded-lg bg-slate-950/70 border border-white/5 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Lockfiles & Metadata</span>
                  <div className="flex flex-wrap gap-1 text-[10px] text-slate-300 max-h-32 overflow-y-auto">
                    {(defaultExclusions?.filenames || [
                      'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'cargo.lock', 'poetry.lock', 'composer.lock'
                    ]).map((fn) => (
                      <span key={fn} className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/5">
                        {fn}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-1">
                Also automatically filters minified scripts (*.min.js, avg line length &gt; 300 chars), generated headers (&ldquo;DO NOT EDIT&rdquo;, protobuf), and files over 1.5MB.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
