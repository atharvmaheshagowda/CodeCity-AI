import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MousePointer, Compass, ShieldAlert, Sparkles, Keyboard, Menu, Pin } from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { soundFx } from '../utils/soundEffects';

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, toggleOnboarding } = useCityStore();

  if (!isOnboardingOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl select-none"
        onClick={() => {
          soundFx.playClick();
          toggleOnboarding();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative w-full max-w-lg glass-panel rounded-2xl border border-white/15 p-6 shadow-2xl overflow-hidden flex flex-col backdrop-blur-2xl bg-slate-950/92"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white font-display">How to Explore CodeCity AI</h2>
                <p className="text-[11px] text-slate-400 font-mono">Interactive 3D navigation & defect analysis tips</p>
              </div>
            </div>
            <button
              onClick={() => {
                soundFx.playClick();
                toggleOnboarding();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Instructions */}
          <div className="py-4 space-y-3.5 text-xs text-slate-300 font-sans">
            <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
              <MousePointer className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-100">Select & Inspect Buildings</h3>
                <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed font-sans">
                  Click any building to fly the camera to it, inspect its predicted risk score, view plain-English SHAP explanations, and light up its 3D blast radius.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
              <Menu className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-100">Right-Click Radial Quick Actions</h3>
                <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed font-sans">
                  <b>Right-click</b> any building to open the radial context menu: trigger blast radius, copy path, simulate failure, or pin to the Comparison Dock.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-100">Animated Blast Radius Trajectories</h3>
                <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed font-sans">
                  Selecting a building reveals animated 3D arcs connecting all upstream dependent files with flowing data packets. Adjust Hop depth (1-3) in the right drawer.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
              <Keyboard className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="w-full">
                <h3 className="font-semibold text-slate-100 mb-1.5">Keyboard Shortcuts</h3>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-400">
                  <div className="flex justify-between bg-slate-900/80 px-2 py-1 rounded-lg">
                    <span>Command Palette:</span> <kbd className="text-cyan-400 font-bold">⌘K</kbd>
                  </div>
                  <div className="flex justify-between bg-slate-900/80 px-2 py-1 rounded-lg">
                    <span>Focus Search:</span> <kbd className="text-cyan-400 font-bold">F</kbd>
                  </div>
                  <div className="flex justify-between bg-slate-900/80 px-2 py-1 rounded-lg">
                    <span>Color Modes:</span> <kbd className="text-cyan-400 font-bold">1 - 5</kbd>
                  </div>
                  <div className="flex justify-between bg-slate-900/80 px-2 py-1 rounded-lg">
                    <span>Exhibition Mode:</span> <kbd className="text-cyan-400 font-bold">P</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-white/10 flex justify-end">
            <button
              onClick={() => {
                soundFx.playClick();
                toggleOnboarding();
              }}
              className="px-4 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-semibold text-xs hover:bg-cyan-500/30 transition-all shadow-glow-cyan"
            >
              Start Exploring
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
