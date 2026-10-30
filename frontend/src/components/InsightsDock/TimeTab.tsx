import React, { useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Calendar,
  History,
  GitCommit,
  Layers,
  Activity,
  Box,
  FolderGit2,
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';
import { soundFx } from '../../utils/soundEffects';

export const TimeTab: React.FC = () => {
  const {
    currentRepo,
    timelapseResult,
    timelapseMonthIndex,
    isTimelapsePlaying,
    setTimelapseMonthIndex,
    toggleTimelapsePlay,
    fetchTimelapse,
  } = useCityStore();

  useEffect(() => {
    if (!timelapseResult && currentRepo) {
      fetchTimelapse();
    }
  }, [currentRepo]);

  // Handle auto-stepping when playing
  useEffect(() => {
    if (!isTimelapsePlaying || !timelapseResult || timelapseResult.snapshots.length === 0) return;

    const interval = setInterval(() => {
      const nextIdx = (timelapseMonthIndex + 1) % timelapseResult.snapshots.length;
      setTimelapseMonthIndex(nextIdx);
      soundFx.playHoverTick();
    }, 1400);

    return () => clearInterval(interval);
  }, [isTimelapsePlaying, timelapseMonthIndex, timelapseResult]);

  const hasSnapshots = Boolean(timelapseResult && timelapseResult.snapshots && timelapseResult.snapshots.length > 0);

  if (!hasSnapshots) {
    return (
      <div className="p-8 text-center space-y-4 rounded-2xl bg-slate-900/40 border border-white/5">
        <History className="w-8 h-8 text-slate-500 mx-auto" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white font-mono">Not Enough Historical Commits</h4>
          <p className="text-xs text-slate-400 font-mono max-w-md mx-auto">
            Time-lapse 4D replay requires multi-month Git history. This workspace has fewer than 2 historical commits.
          </p>
        </div>
        <button
          onClick={() => {
            soundFx.playClick();
            useCityStore.getState().loadRepo('pallets_flask');
          }}
          className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono text-xs inline-flex items-center space-x-2 transition-all shadow-glow-cyan"
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Switch to Pallets Flask (180-Day History)</span>
        </button>
      </div>
    );
  }

  const currentSnapshot = timelapseResult.snapshots[timelapseMonthIndex] || timelapseResult.snapshots[0];
  const activeFilePaths = Object.keys(currentSnapshot.active_files || {});

  return (
    <div className="space-y-6 text-xs text-slate-200">
      {/* 1. Scrubber Header & Player Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Git History Time-Lapse</h3>
              <p className="text-[11px] text-slate-400">
                Choreographed 4D replay: dynamically scales building heights and renders unborn files as wireframe foundations.
              </p>
            </div>
          </div>

          {/* Transport Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                soundFx.playClick();
                setTimelapseMonthIndex(Math.max(0, timelapseMonthIndex - 1));
              }}
              disabled={timelapseMonthIndex === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-all border border-white/5"
              title="Previous Snapshot"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                toggleTimelapsePlay();
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-semibold border transition-all ${
                isTimelapsePlaying
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-glow-amber'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-glow-cyan'
              }`}
            >
              {isTimelapsePlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Play Replay</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                setTimelapseMonthIndex(Math.min(timelapseResult.snapshots.length - 1, timelapseMonthIndex + 1));
              }}
              disabled={timelapseMonthIndex === timelapseResult.snapshots.length - 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-all border border-white/5"
              title="Next Snapshot"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Timeline Slider Bar */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="text-cyan-400 font-bold">{currentSnapshot.month_label}</span>
            <span className="text-slate-400">{currentSnapshot.date}</span>
          </div>

          <input
            type="range"
            min="0"
            max={timelapseResult.snapshots.length - 1}
            step="1"
            value={timelapseMonthIndex}
            onChange={(e) => {
              soundFx.playHoverTick();
              setTimelapseMonthIndex(parseInt(e.target.value));
            }}
            className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-2 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            {timelapseResult.snapshots.map((s, idx) => (
              <button
                key={s.date}
                onClick={() => {
                  soundFx.playClick();
                  setTimelapseMonthIndex(idx);
                }}
                className={`transition-colors ${
                  idx === timelapseMonthIndex ? 'text-cyan-300 font-bold' : 'hover:text-slate-300'
                }`}
              >
                {s.month_label.split(':')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Snapshot Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-900/50 border border-white/10 space-y-1">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Active Modules</span>
            <Box className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {currentSnapshot.summary.total_files}
            <span className="text-xs text-slate-500 font-normal ml-1">
              / {currentRepo?.files.length || 0}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            {Math.max(0, (currentRepo?.files.length || 0) - currentSnapshot.summary.total_files)} unborn wireframes
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/50 border border-white/10 space-y-1">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Historical LOC</span>
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-300">
            {currentSnapshot.summary.total_loc.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 font-mono">Total codebase volume</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/50 border border-white/10 space-y-1">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Mean Defect Risk</span>
            <Activity className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-300">
            {(currentSnapshot.summary.avg_risk * 100).toFixed(1)}%
          </div>
          <p className="text-[10px] text-slate-500 font-mono">Historical prediction</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/50 border border-white/10 space-y-1">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Commit Milestone</span>
            <GitCommit className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xs font-bold font-mono text-amber-300 truncate pt-1">
            {currentSnapshot.commit_hash}
          </div>
          <p className="text-[10px] text-slate-500 font-mono">Git checkpoint</p>
        </div>
      </div>

      {/* 3. Modules Active at this Snapshot */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-semibold text-white">
            Modules Present at {currentSnapshot.month_label} ({activeFilePaths.length})
          </span>
          <span className="text-[11px] font-mono text-cyan-400">
            3D Scene synchronized
          </span>
        </div>

        <div className="max-h-48 overflow-y-auto space-y-1 pr-1 font-mono">
          {activeFilePaths.map((path) => {
            const data = currentSnapshot.active_files[path];
            const filename = path.split('/').pop() || path;
            return (
              <div
                key={path}
                className="p-2 rounded-lg bg-slate-900/40 border border-white/5 flex items-center justify-between"
              >
                <div className="truncate max-w-md">
                  <span className="font-semibold text-white text-xs mr-2">{filename}</span>
                  <span className="text-[10px] text-slate-500">{path}</span>
                </div>
                <div className="flex items-center space-x-3 text-right">
                  <span className="text-[10px] text-slate-400">{data.loc} LOC</span>
                  <span className="text-[10px] text-slate-400">CC: {data.max_complexity}</span>
                  <span className={`text-[10px] font-bold ${data.risk >= 0.5 ? 'text-rose-400' : 'text-cyan-400'}`}>
                    {(data.risk * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
