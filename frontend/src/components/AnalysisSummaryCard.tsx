import React from 'react';
import {
  FileCheck,
  FolderTree,
  GitBranch,
  Cpu,
  Layers,
  ShieldAlert,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';

export const AnalysisSummaryCard: React.FC = () => {
  const { currentRepo, toggleCapabilitiesModal, toggleExclusionRulesModal } = useCityStore();
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!currentRepo) return null;

  const summary = currentRepo.summary;
  const languages = currentRepo.languages || [];
  const coverage = currentRepo.graph_coverage;
  const exclusion = currentRepo.exclusion_summary;
  const modelUsed = currentRepo.model_used || 'core';
  const modelRationale = currentRepo.model_rationale || 'Universal defect model active.';
  const isStatic = currentRepo.is_static_only;

  return (
    <div
      id="analysis-summary-card"
      data-testid="analysis-summary-card"
      className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono space-y-2.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200">Analysis Summary</span>
          {isStatic ? (
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-950 text-amber-300 border border-amber-500/40">
              Static
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              Git Analyzed
            </span>
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          title={isExpanded ? 'Collapse Summary' : 'Expand Details'}
        >
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Row 1: Languages & Graph Coverage */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        {/* Languages Found */}
        <div
          onClick={() => toggleCapabilitiesModal(true)}
          className="p-2 rounded-lg bg-slate-950/60 border border-white/5 cursor-pointer hover:border-cyan-500/40 transition-colors"
          title="Click to view full Language Capabilities Matrix"
        >
          <div className="text-[9px] text-slate-500 uppercase flex items-center justify-between">
            <span>Languages</span>
            <span className="text-cyan-400 font-bold">{languages.length}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 overflow-hidden truncate">
            {languages.slice(0, 3).map((l) => (
              <span key={l.name} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-slate-300">{l.display_name}</span>
              </span>
            ))}
            {languages.length > 3 && <span className="text-slate-500">+{languages.length - 3}</span>}
          </div>
        </div>

        {/* Graph Coverage Score */}
        <div
          onClick={() => toggleCapabilitiesModal(true)}
          className="p-2 rounded-lg bg-slate-950/60 border border-white/5 cursor-pointer hover:border-cyan-500/40 transition-colors"
          title="Click to view Dependency Graph Coverage details"
        >
          <div className="text-[9px] text-slate-500 uppercase flex items-center justify-between">
            <span>Graph Coverage</span>
            <span
              className={`font-bold ${
                coverage?.overall_confidence === 'High'
                  ? 'text-emerald-400'
                  : coverage?.overall_confidence === 'Moderate'
                  ? 'text-cyan-400'
                  : 'text-amber-400'
              }`}
            >
              {coverage ? `${(coverage.overall_coverage * 100).toFixed(0)}%` : '0%'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-slate-400 text-[10px]">
            <GitBranch className="w-3 h-3 text-cyan-400" />
            <span>
              {coverage ? `${coverage.total_resolved_edges} / ${coverage.total_detected_imports} edges` : 'No graph edges'}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="pt-2 border-t border-white/5 space-y-2 text-[10px]">
          {/* Model Rationale */}
          <div className="p-2 rounded-lg bg-slate-950/80 border border-white/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold uppercase flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span>Model Active: <b className="text-cyan-300">{modelUsed.toUpperCase()}</b></span>
              </span>
              <span className="text-slate-500">
                ROC-AUC: <b className="text-slate-300">{summary.model_roc_auc.toFixed(3)}</b>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">{modelRationale}</p>
          </div>

          {/* Exclusion & Filter Audit */}
          {exclusion && (
            <div
              onClick={() => toggleExclusionRulesModal(true)}
              className="p-2 rounded-lg bg-slate-950/80 border border-white/5 space-y-1 cursor-pointer hover:border-violet-500/40 transition-colors"
              title="Click to manage File Exclusion Rules"
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold uppercase flex items-center gap-1">
                  <Layers className="w-3 h-3 text-violet-400" />
                  <span>Files Audit</span>
                </span>
                <span className="text-cyan-400 font-bold">
                  {exclusion.analyzed} analyzed / {exclusion.excluded} excluded
                </span>
              </div>
              <div className="text-slate-500 truncate">
                Filters: .gitignore, vendor, minified, binaries, size caps
              </div>
            </div>
          )}

          {/* Monorepo Roots */}
          {currentRepo.monorepo_roots && currentRepo.monorepo_roots.length > 0 && (
            <div className="p-2 rounded-lg bg-slate-950/80 border border-white/5">
              <span className="text-slate-400 font-semibold uppercase flex items-center gap-1 mb-1">
                <FolderTree className="w-3 h-3 text-amber-400" />
                <span>Monorepo Districts ({currentRepo.monorepo_roots.length} roots)</span>
              </span>
              <div className="flex flex-wrap gap-1">
                {currentRepo.monorepo_roots.map((root) => (
                  <span key={root} className="px-1.5 py-0.2 rounded bg-slate-900 text-amber-300 border border-amber-500/30">
                    {root}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
