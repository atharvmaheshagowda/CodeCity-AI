import React from 'react';
import { AlertTriangle, Info, GitBranch } from 'lucide-react';
import { useCityStore } from '../store/useCityStore';

export const StaticModeBanner: React.FC = () => {
  const { currentRepo } = useCityStore();

  if (!currentRepo || !currentRepo.is_static_only) return null;

  return (
    <div
      id="static-mode-banner"
      data-testid="static-mode-banner"
      className="bg-amber-950/90 border-b border-amber-500/40 px-4 py-2 flex items-center justify-between text-xs font-mono text-amber-200 z-20 backdrop-blur-md shadow-[0_2px_12px_rgba(245,158,11,0.25)] select-none"
    >
      <div className="flex items-center space-x-2.5">
        <div className="p-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase tracking-wider text-amber-300">
            Static-Only Mode
          </span>
          <span className="text-slate-400 hidden sm:inline">&bull;</span>
          <span className="text-amber-100/90 text-[11px] hidden sm:inline">
            Analyzed without Git history. Static metrics (LOC, Cyclomatic Complexity, AST Graph, Blast Radius) are 100% active.
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-[10px] text-amber-300/80 bg-amber-900/40 px-2 py-0.5 rounded border border-amber-500/30">
        <GitBranch className="w-3 h-3 text-amber-400" />
        <span>History layers disabled</span>
      </div>
    </div>
  );
};
