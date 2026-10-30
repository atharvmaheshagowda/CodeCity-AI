import React, { useEffect } from 'react';
import {
  Link2,
  AlertCircle,
  TrendingUp,
  Eye,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';
import { soundFx } from '../../utils/soundEffects';

export const CouplingTab: React.FC = () => {
  const {
    currentRepo,
    couplingResult,
    fetchCoupling,
    selectFile,
    toggleLayer,
    activeLayers,
  } = useCityStore();

  useEffect(() => {
    if (!couplingResult && currentRepo) {
      fetchCoupling();
    }
  }, [currentRepo, couplingResult]);

  if (!couplingResult) {
    return (
      <div className="py-12 text-center text-slate-500 font-mono text-xs">
        Mining Git co-change coupling data...
      </div>
    );
  }

  // Graceful degradation on tiny repos with < 5 commits
  if (!couplingResult.has_enough_history) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
          <Info className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-white">Insufficient Git History</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          {couplingResult.message ||
            'This repository has fewer than 5 historical commits. Hidden logical co-change coupling requires multi-month Git commit history.'}
        </p>
        <div className="pt-2">
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1.5 rounded-xl">
            Switch to pallets/flask or psf/requests for full coupling analysis
          </span>
        </div>
      </div>
    );
  }

  const pairs = couplingResult.pairs || [];

  return (
    <div className="space-y-4 text-xs text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Link2 className="w-4 h-4 text-purple-400" />
            <span>Hidden Co-Change Couplings ({pairs.length} pairs detected)</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Files that are edited together in Git commits, even though they don't import each other directly. Changing one usually means you need to update the other.
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            toggleLayer('coupling');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
            activeLayers.coupling
              ? 'bg-purple-950/80 text-purple-300 border-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
              : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
          }`}
        >
          {activeLayers.coupling ? 'Tunnels: ON' : 'Tunnels: OFF'}
        </button>
      </div>

      {pairs.length === 0 ? (
        <div className="p-8 text-center text-slate-500 font-mono">
          No hidden couplings found meeting min support &gt;= 2 and Jaccard &gt;= 0.15.
        </div>
      ) : (
        <div className="space-y-2.5">
          {pairs.map((p: any, idx: number) => {
            const srcPath = p.source || p.file_a;
            const tgtPath = p.target || p.file_b;
            const srcName = p.source_name || p.fname_a || srcPath.split('/').pop();
            const tgtName = p.target_name || p.fname_b || tgtPath.split('/').pop();
            const jaccardVal = p.jaccard_similarity ?? p.jaccard ?? 0;
            const samples = p.sample_commits || p.recent_commit_samples || [];

            return (
              <div
                key={`${srcPath}-${tgtPath}`}
                className="p-3 rounded-xl bg-slate-900/60 border border-white/10 hover:border-purple-500/40 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      #{idx + 1}
                    </span>
                    <span className="font-mono text-white font-bold">{srcName}</span>
                    <span className="text-purple-400 font-bold">&harr;</span>
                    <span className="font-mono text-white font-bold">{tgtName}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      Support: <strong className="text-white">{p.support}</strong> commits
                    </span>
                    <span className="text-[11px] font-mono text-purple-400">
                      Jaccard: <strong className="text-purple-300">{(jaccardVal * 100).toFixed(0)}%</strong>
                    </span>
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        const nodeA = currentRepo?.files.find((f) => f.path === srcPath);
                        if (nodeA) selectFile(nodeA);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-purple-300"
                      title="Focus module A in 3D"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-normal">{p.explanation}</p>

                {samples.length > 0 && (
                  <div className="text-[10px] font-mono text-slate-500 truncate">
                    Latest commit: "{samples[0]}"
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
