import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Cpu,
  GitBranch,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Code2,
  FileCode,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { soundFx } from '../utils/soundEffects';

export const LanguageCapabilitiesModal: React.FC = () => {
  const {
    isCapabilitiesModalOpen,
    toggleCapabilitiesModal,
    currentRepo,
    allLanguagesRegistry,
    fetchLanguageRegistry,
  } = useCityStore();

  useEffect(() => {
    if (isCapabilitiesModalOpen && allLanguagesRegistry.length === 0) {
      fetchLanguageRegistry();
    }
  }, [isCapabilitiesModalOpen, allLanguagesRegistry.length, fetchLanguageRegistry]);

  if (!isCapabilitiesModalOpen) return null;

  // Build merged capability rows
  const repoLanguages = currentRepo?.languages || [];
  const repoCoverage = currentRepo?.graph_coverage?.per_language || {};

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl select-none"
        onClick={() => {
          soundFx.playClick();
          toggleCapabilitiesModal(false);
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative w-full max-w-4xl glass-panel rounded-2xl border border-white/15 p-6 shadow-2xl overflow-hidden max-h-[88vh] flex flex-col backdrop-blur-2xl bg-slate-950/95"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shadow-glow-cyan">
                <Cpu className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2 font-display">
                  <span>Language Capabilities & Integrity Matrix</span>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded-full border border-cyan-500/40">
                    Deterministic Registry
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Honest capability levels across 30+ programming languages. Estimates and approximations are strictly labeled.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                soundFx.playClick();
                toggleCapabilitiesModal(false);
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Repo Languages Summary */}
          {repoLanguages.length > 0 && (
            <div className="py-3 px-4 my-3 rounded-xl bg-slate-900/60 border border-white/10 flex flex-wrap items-center gap-3 text-xs font-mono">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                Current Repository ({currentRepo?.name}):
              </span>
              {repoLanguages.map((lang) => {
                const cov = repoCoverage[lang.name];
                return (
                  <div
                    key={lang.name}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-white/10"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.color }} />
                    <span className="text-slate-200 font-semibold">{lang.display_name}</span>
                    <span className="text-slate-400 text-[10px]">({lang.file_count} files)</span>
                    {cov && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          cov.confidence === 'High'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : cov.confidence === 'Moderate'
                            ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'
                            : cov.confidence === 'Low'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        Graph: {(cov.coverage_ratio * 100).toFixed(0)}% ({cov.confidence})
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Table Container */}
          <div className="flex-1 overflow-y-auto pr-1">
            <table className="w-full text-left text-xs font-mono">
              <thead className="sticky top-0 bg-slate-900/90 text-slate-400 border-b border-white/10 uppercase text-[10px] tracking-wider backdrop-blur-md">
                <tr>
                  <th className="py-2.5 px-3">Language</th>
                  <th className="py-2.5 px-3">Complexity Engine</th>
                  <th className="py-2.5 px-3">Dependency Graph</th>
                  <th className="py-2.5 px-3">Defect Risk Model</th>
                  <th className="py-2.5 px-3">Current Repo Presence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(allLanguagesRegistry.length > 0
                  ? allLanguagesRegistry
                  : [
                      { name: 'python', display_name: 'Python', color: '#38bdf8', capabilities: { complexity: 'yes', graph: 'yes', model: 'validated' } },
                      { name: 'javascript', display_name: 'JavaScript', color: '#facc15', capabilities: { complexity: 'yes', graph: 'yes', model: 'validated' } },
                      { name: 'typescript', display_name: 'TypeScript', color: '#3b82f6', capabilities: { complexity: 'yes', graph: 'yes', model: 'validated' } },
                      { name: 'java', display_name: 'Java', color: '#f97316', capabilities: { complexity: 'yes', graph: 'yes', model: 'validated' } },
                      { name: 'go', display_name: 'Go', color: '#06b6d4', capabilities: { complexity: 'yes', graph: 'yes', model: 'validated' } },
                      { name: 'rust', display_name: 'Rust', color: '#ea580c', capabilities: { complexity: 'yes', graph: 'yes', model: 'validated' } },
                      { name: 'c', display_name: 'C / C++', color: '#6366f1', capabilities: { complexity: 'yes', graph: 'yes', model: 'validated' } },
                      { name: 'ruby', display_name: 'Ruby', color: '#e11d48', capabilities: { complexity: 'yes', graph: 'yes', model: 'validated' } },
                      { name: 'php', display_name: 'PHP', color: '#8b5cf6', capabilities: { complexity: 'yes', graph: 'yes', model: 'validated' } },
                      { name: 'csharp', display_name: 'C#', color: '#10b981', capabilities: { complexity: 'yes', graph: 'partial', model: 'unvalidated' } },
                      { name: 'kotlin', display_name: 'Kotlin', color: '#a855f7', capabilities: { complexity: 'yes', graph: 'partial', model: 'unvalidated' } },
                    ]
                ).map((lang: any) => {
                  const activeInRepo = repoLanguages.find((l) => l.name === lang.name);
                  const cov = repoCoverage[lang.name];

                  return (
                    <tr
                      key={lang.name}
                      className={`hover:bg-white/5 transition-colors ${
                        activeInRepo ? 'bg-cyan-950/20' : ''
                      }`}
                    >
                      {/* Language */}
                      <td className="py-2.5 px-3 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: lang.color || '#94a3b8' }}
                        />
                        <span className="font-semibold text-slate-200">{lang.display_name}</span>
                        {activeInRepo && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                            Active
                          </span>
                        )}
                      </td>

                      {/* Complexity */}
                      <td className="py-2.5 px-3">
                        {lang.capabilities.complexity === 'yes' ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{lang.name === 'python' ? 'Radon AST' : 'Lizard Engine'}</span>
                          </span>
                        ) : lang.capabilities.complexity === 'approx' ? (
                          <span className="inline-flex items-center gap-1.5 text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Approximate Heuristic</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">None</span>
                        )}
                      </td>

                      {/* Graph */}
                      <td className="py-2.5 px-3">
                        {lang.capabilities.graph === 'yes' ? (
                          <span className="inline-flex items-center gap-1.5 text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                            <GitBranch className="w-3 h-3" />
                            <span>Tree-sitter AST</span>
                          </span>
                        ) : lang.capabilities.graph === 'partial' ? (
                          <span className="inline-flex items-center gap-1.5 text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                            <GitBranch className="w-3 h-3" />
                            <span>Partial Resolver</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Unsupported (0 edges)</span>
                        )}
                      </td>

                      {/* Model */}
                      <td className="py-2.5 px-3">
                        {lang.capabilities.model === 'validated' ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Multi-Lang XGBoost</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-white/10">
                            <HelpCircle className="w-3 h-3 text-slate-500" />
                            <span>Unvalidated (Core model)</span>
                          </span>
                        )}
                      </td>

                      {/* Presence in current repo */}
                      <td className="py-2.5 px-3">
                        {activeInRepo ? (
                          <div className="space-y-0.5">
                            <div className="text-slate-300 font-semibold">
                              {activeInRepo.file_count} files ({activeInRepo.loc} LOC)
                            </div>
                            {cov ? (
                              <div className="text-[10px] text-slate-400">
                                Graph coverage:{' '}
                                <b className="text-cyan-300">
                                  {(cov.coverage_ratio * 100).toFixed(0)}%
                                </b>{' '}
                                ({cov.resolved_edges}/{cov.detected_imports} edges)
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-slate-600">&mdash;</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Honesty Guarantee */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                <b>Honesty Rule:</b> Unsupported languages produce 0 graph edges and display &ldquo;unvalidated&rdquo; warnings.
              </span>
            </div>
            <span className="text-slate-500">100% Offline &bull; Zero External APIs</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
