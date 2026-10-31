import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Flame,
  Link2,
  ShieldAlert,
  FileText,
  Sliders,
  ChevronDown,
  Sparkles,
  Clock,
  History,
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';
import { ImpactTab } from './ImpactTab';
import { CouplingTab } from './CouplingTab';
import { SmellsTab } from './SmellsTab';
import { ReportTab } from './ReportTab';
import { PlanTab } from './PlanTab';
import { TimeTab } from './TimeTab';
import { ArchitecturalInsightsTab } from './ArchitecturalInsightsTab';
import { soundFx } from '../../utils/soundEffects';

export const InsightsDock: React.FC = () => {
  const {
    isInsightsOpen,
    insightsTab,
    toggleInsights,
    setInsightsTab,
    smellsResult,
    couplingResult,
  } = useCityStore();

  if (!isInsightsOpen) return null;

  const smellsCount = smellsResult?.total_smells || 0;
  const couplingCount = couplingResult?.pairs?.length || 0;

  const tabs = [
    { id: 'insights', label: 'Overview & Insights', icon: Sparkles, badge: null },
    { id: 'impact', label: 'Impact & Cascade', icon: Flame, badge: null },
    { id: 'plan', label: 'Review Planner', icon: Clock, badge: null },
    { id: 'time', label: 'Time-Lapse', icon: History, badge: null },
    { id: 'coupling', label: 'Hidden Coupling', icon: Link2, badge: couplingCount > 0 ? couplingCount : null },
    { id: 'smells', label: 'Architecture Smells', icon: ShieldAlert, badge: smellsCount > 0 ? smellsCount : null },
    { id: 'report', label: 'Health Report', icon: FileText, badge: null },
  ] as const;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 350, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 350, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="fixed inset-x-4 bottom-4 md:inset-x-12 lg:inset-x-24 max-h-[580px] glass-panel rounded-3xl border border-white/15 bg-slate-950/95 backdrop-blur-2xl shadow-[0_12px_48px_rgba(0,0,0,0.85)] z-40 flex flex-col overflow-hidden select-none"
      >
        {/* Dock Header with Tabs */}
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-sm text-white font-mono">CodeCity Insights</span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-white/10 overflow-x-auto scrollbar-none">
              {tabs.map((tab) => {
                const isActive = insightsTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      soundFx.playClick();
                      setInsightsTab(tab.id);
                    }}
                    onMouseEnter={soundFx.playHoverTick}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-glow-cyan'
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.badge !== null && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/30 text-rose-300 border border-rose-500/40">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              toggleInsights(false);
            }}
            onMouseEnter={soundFx.playHoverTick}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all shrink-0 ml-2"
            title="Close Insights Dock (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {insightsTab === 'insights' && <ArchitecturalInsightsTab />}
          {insightsTab === 'impact' && <ImpactTab />}
          {insightsTab === 'plan' && <PlanTab />}
          {insightsTab === 'time' && <TimeTab />}
          {insightsTab === 'coupling' && <CouplingTab />}
          {insightsTab === 'smells' && <SmellsTab />}
          {insightsTab === 'report' && <ReportTab />}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
