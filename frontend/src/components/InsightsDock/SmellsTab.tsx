import React, { useEffect } from 'react';
import {
  AlertOctagon,
  RefreshCw,
  Box,
  FileQuestion,
  ShieldAlert,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';
import { soundFx } from '../../utils/soundEffects';

export const SmellsTab: React.FC = () => {
  const {
    currentRepo,
    smellsResult,
    fetchSmells,
    selectFile,
    toggleLayer,
    activeLayers,
  } = useCityStore();

  useEffect(() => {
    if (!smellsResult && currentRepo) {
      fetchSmells();
    }
  }, [currentRepo, smellsResult]);

  if (!smellsResult) {
    return (
      <div className="py-12 text-center text-slate-500 font-mono text-xs">
        Scanning codebase AST for architecture smells...
      </div>
    );
  }

  const smells = smellsResult.smells || [];
  const cycles = smells.filter((s) => s.type === 'circular_dependency');
  const godFiles = smells.filter((s) => s.type === 'god_file');
  const orphans = smells.filter((s) => s.type === 'orphan_file');

  return (
    <div className="space-y-4 text-xs text-slate-200">
      {/* Header with Layer Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Architecture Anti-Patterns ({smellsResult.total_smells} Detected)</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Structural debt detected via Tarjan Strongly Connected Components and multi-factor thresholds.
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            toggleLayer('smells');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
            activeLayers.smells
              ? 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
              : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
          }`}
        >
          {activeLayers.smells ? 'Smell Arcs: ON' : 'Smell Arcs: OFF'}
        </button>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/10 flex items-center space-x-2">
          <div className="p-1 rounded bg-rose-500/20 text-rose-400">
            <RefreshCw className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Circular Loops</div>
            <div className="text-sm font-bold font-mono text-white">{cycles.length}</div>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/10 flex items-center space-x-2">
          <div className="p-1 rounded bg-amber-500/20 text-amber-400">
            <Box className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">God Files</div>
            <div className="text-sm font-bold font-mono text-white">{godFiles.length}</div>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/10 flex items-center space-x-2">
          <div className="p-1 rounded bg-cyan-500/20 text-cyan-400">
            <FileQuestion className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Orphan Modules</div>
            <div className="text-sm font-bold font-mono text-white">{orphans.length}</div>
          </div>
        </div>
      </div>

      {/* Smells List */}
      <div className="space-y-3 pt-1">
        {smells.map((s) => {
          const isHigh = s.severity === 'high';
          return (
            <div
              key={s.id}
              className={`p-3.5 rounded-xl bg-slate-900/70 border transition-all space-y-2 ${
                isHigh ? 'border-rose-500/40 hover:border-rose-500/60' : 'border-amber-500/30 hover:border-amber-500/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      isHigh
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {s.severity}
                  </span>
                  <h4 className="font-semibold text-white text-xs">{s.title}</h4>
                </div>

                <div className="flex items-center space-x-1.5">
                  {s.affected_files.map((p) => {
                    const fname = p.split('/').pop();
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          soundFx.playClick();
                          const f = currentRepo?.files.find((item) => item.path === p);
                          if (f) selectFile(f);
                        }}
                        className="text-[10px] font-mono text-slate-300 px-1.5 py-0.5 rounded bg-slate-800 hover:text-cyan-300 border border-white/10"
                        title={`Focus ${fname} in 3D`}
                      >
                        {fname}
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">{s.description}</p>

              <div className="p-2 rounded-lg bg-slate-950/80 border border-white/5 text-[10px] font-mono text-slate-400">
                <strong className="text-cyan-400">Recommendation:</strong> {s.recommendation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

