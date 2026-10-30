import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, AlertTriangle, Copy, Pin, X } from 'lucide-react';
import type { FileNode } from '../../types';
import { soundFx } from '../../utils/soundEffects';

interface RadialContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number } | null;
  file: FileNode | null;
  isPinned: boolean;
  onClose: () => void;
  onInspectBlastRadius: (file: FileNode) => void;
  onSimulateFailure: (file: FileNode) => void;
  onCopyPath: (file: FileNode) => void;
  onTogglePin: (file: FileNode) => void;
}

export const RadialContextMenu: React.FC<RadialContextMenuProps> = ({
  isOpen,
  position,
  file,
  isPinned,
  onClose,
  onInspectBlastRadius,
  onSimulateFailure,
  onCopyPath,
  onTogglePin,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !position || !file) return null;

  // Clamp within viewport
  const screenW = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const screenH = typeof window !== 'undefined' ? window.innerHeight : 1080;
  const menuSize = 220;
  const clampedX = Math.min(screenW - menuSize / 2 - 16, Math.max(menuSize / 2 + 16, position.x));
  const clampedY = Math.min(screenH - menuSize / 2 - 16, Math.max(menuSize / 2 + 16, position.y));

  const actions = [
    {
      id: 'blast',
      label: 'Blast Radius',
      icon: Share2,
      color: 'hover:text-cyan-400 hover:border-cyan-400/60 hover:bg-cyan-500/15',
      accent: 'text-cyan-400',
      action: () => {
        soundFx.playBlastWave();
        onInspectBlastRadius(file);
        onClose();
      },
    },
    {
      id: 'failure',
      label: 'Simulate Failure',
      icon: AlertTriangle,
      color: 'hover:text-amber-400 hover:border-amber-400/60 hover:bg-amber-500/15',
      accent: 'text-amber-400',
      action: () => {
        soundFx.playClick();
        onSimulateFailure(file);
        onClose();
      },
    },
    {
      id: 'copy',
      label: 'Copy Path',
      icon: Copy,
      color: 'hover:text-emerald-400 hover:border-emerald-400/60 hover:bg-emerald-500/15',
      accent: 'text-emerald-400',
      action: () => {
        soundFx.playClick();
        onCopyPath(file);
        onClose();
      },
    },
    {
      id: 'pin',
      label: isPinned ? 'Unpin File' : 'Pin to Dock',
      icon: Pin,
      color: 'hover:text-violet-400 hover:border-violet-400/60 hover:bg-violet-500/15',
      accent: isPinned ? 'text-violet-400' : 'text-slate-300',
      action: () => {
        soundFx.playClick();
        onTogglePin(file);
        onClose();
      },
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.82 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.82 }}
        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
        style={{ left: clampedX, top: clampedY }}
        className="fixed z-50 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
      >
        <div className="relative w-56 p-3 rounded-2xl glass-panel border border-cyan-500/30 shadow-2xl backdrop-blur-2xl bg-slate-950/92">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <div className="flex items-center space-x-1.5 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse flex-shrink-0" />
              <span className="font-mono text-[11px] font-semibold text-slate-200 truncate">
                {file.filename}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action List */}
          <div className="space-y-1">
            {actions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.id}
                  onClick={act.action}
                  onMouseEnter={soundFx.playHoverTick}
                  className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-xs font-sans text-slate-300 border border-transparent transition-all text-left ${act.color}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${act.accent}`} />
                  <span className="font-medium text-[11px]">{act.label}</span>
                </button>
              );
            })}
          </div>

          {/* Micro telemetry footer */}
          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Risk: {(file.risk_probability * 100).toFixed(0)}%</span>
            <span>Impact: {file.impact_score.toFixed(2)}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

