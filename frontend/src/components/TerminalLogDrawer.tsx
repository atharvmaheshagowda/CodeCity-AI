import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, X, Minimize2, Maximize2, Trash2 } from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { soundFx } from '../utils/soundEffects';

export const TerminalLogDrawer: React.FC = () => {
  const { isTerminalLogOpen, toggleTerminalLog, terminalLogs } = useCityStore();
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTerminalLogOpen) {
        soundFx.playClick();
        toggleTerminalLog(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTerminalLogOpen, toggleTerminalLog]);

  if (!isTerminalLogOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 240, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 240, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="fixed bottom-0 inset-x-4 md:inset-x-24 h-56 glass-panel rounded-t-2xl border-t border-x border-cyan-500/30 bg-slate-950/95 backdrop-blur-2xl shadow-2xl z-[80] flex flex-col font-mono text-xs select-none"
      >
        {/* Terminal Header */}
        <div className="px-4 py-2 bg-slate-900/80 border-b border-white/10 flex items-center justify-between text-slate-400">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-200">Analysis Engine Terminal</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Deterministic AST & ML
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-slate-500">
              {terminalLogs.length} events logged
            </span>
            <button
              onClick={() => {
                soundFx.playClick();
                toggleTerminalLog();
              }}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
              title="Close Terminal"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div
          ref={logContainerRef}
          className="flex-1 p-3 overflow-y-auto space-y-1.5 bg-black/40 text-[11px] font-mono"
        >
          {terminalLogs.map((log) => {
            let color = 'text-slate-300';
            let prefix = '[INFO]';
            if (log.level === 'warn') {
              color = 'text-amber-300';
              prefix = '[WARN]';
            } else if (log.level === 'success') {
              color = 'text-emerald-300';
              prefix = '[DONE]';
            }

            return (
              <div key={log.id} className="flex items-start space-x-2">
                <span className="text-slate-500 shrink-0">[{log.time}]</span>
                <span
                  className={`shrink-0 font-bold ${
                    log.level === 'warn'
                      ? 'text-amber-400'
                      : log.level === 'success'
                      ? 'text-emerald-400'
                      : 'text-cyan-400'
                  }`}
                >
                  {prefix}
                </span>
                <span className={`${color} leading-relaxed break-all`}>{log.text}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

