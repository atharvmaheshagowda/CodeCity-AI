import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pin, X, Eye, Flame, Trash2 } from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { soundFx } from '../utils/soundEffects';

export const PinnedDock: React.FC = () => {
  const { pinnedFiles, togglePinFile, clearPinnedFiles, selectFile, selectedFile } = useCityStore();

  if (pinnedFiles.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 340, damping: 26 }}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-4xl w-[92%] sm:w-auto"
      >
        <div className="glass-panel p-2 rounded-2xl border border-cyan-500/35 shadow-glow-cyan backdrop-blur-2xl bg-slate-950/90 flex flex-col sm:flex-row items-center gap-2">
          {/* Header pill */}
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 font-mono text-xs">
            <Pin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">Comparison Dock</span>
            <span className="text-[10px] bg-cyan-400/20 px-1.5 py-0.2 rounded-full font-bold ml-1">
              {pinnedFiles.length}
            </span>
          </div>

          {/* Cards container */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-2xl py-1 px-0.5">
            {pinnedFiles.map((f) => {
              const isSelected = selectedFile?.id === f.id || selectedFile?.path === f.path;
              const isHighRisk = f.risk_probability >= 0.5;

              return (
                <motion.div
                  key={f.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-glow-cyan'
                      : 'bg-slate-900/80 border-white/10 hover:border-cyan-500/40 text-slate-300'
                  }`}
                  onClick={() => {
                    soundFx.playClick();
                    selectFile(isSelected ? null : f);
                  }}
                  onMouseEnter={soundFx.playHoverTick}
                >
                  <div className="flex flex-col text-left">
                    <span className="font-mono text-xs font-semibold truncate max-w-[120px]">
                      {f.filename}
                    </span>
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                      <span className={isHighRisk ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                        {(f.risk_probability * 100).toFixed(0)}% Risk
                      </span>
                      <span>LOC {f.loc}</span>
                      <span>CC {f.max_complexity.toFixed(0)}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      soundFx.playClick();
                      togglePinFile(f);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
                    title="Remove from comparison"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Clear all */}
          <button
            onClick={() => {
              soundFx.playClick();
              clearPinnedFiles();
            }}
            className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-mono flex items-center space-x-1 border border-transparent hover:border-rose-500/20 transition-all ml-auto"
            title="Clear all pinned files"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="text-[11px]">Clear</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

