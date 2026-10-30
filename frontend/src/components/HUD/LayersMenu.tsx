import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  GitBranch,
  Link2,
  ShieldAlert,
  Route,
  Building2,
  Eye,
  Check,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';
import { soundFx } from '../../utils/soundEffects';

interface LayersMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LayersMenu: React.FC<LayersMenuProps> = ({ isOpen, onClose }) => {
  const {
    activeLayers,
    toggleLayer,
    showDecorativeSkyline,
    toggleDecorativeSkyline,
  } = useCityStore();

  if (!isOpen) return null;

  const layerItems = [
    {
      id: 'skybridges',
      label: 'Dependency Skybridges',
      desc: 'AST import conduits between modules',
      icon: GitBranch,
      enabled: activeLayers.skybridges,
      toggle: () => toggleLayer('skybridges'),
      color: 'text-cyan-400',
    },
    {
      id: 'coupling',
      label: 'Hidden Coupling Tunnels',
      desc: 'Git co-change links without imports',
      icon: Link2,
      enabled: activeLayers.coupling,
      toggle: () => toggleLayer('coupling'),
      color: 'text-purple-400',
    },
    {
      id: 'smells',
      label: 'Architecture Smell Arcs',
      desc: 'Circular dependency cycles overhead',
      icon: ShieldAlert,
      enabled: activeLayers.smells,
      toggle: () => toggleLayer('smells'),
      color: 'text-rose-400',
    },
    {
      id: 'path',
      label: 'Path Explorer Beam',
      desc: 'Active route between source & target',
      icon: Route,
      enabled: activeLayers.path,
      toggle: () => toggleLayer('path'),
      color: 'text-blue-400',
    },
    {
      id: 'dangerZones',
      label: 'Untested Danger Zones',
      desc: 'Hazard highlight on risk > 0.7 without tests',
      icon: AlertTriangle,
      enabled: activeLayers.dangerZones,
      toggle: () => toggleLayer('dangerZones'),
      color: 'text-amber-400',
    },
    {
      id: 'busFactor',
      label: 'Bus-Factor Concentration',
      desc: 'Files where 1 author has >80% share',
      icon: Users,
      enabled: activeLayers.busFactor,
      toggle: () => toggleLayer('busFactor'),
      color: 'text-rose-400',
    },
    {
      id: 'skyline',
      label: 'Skyline Backdrop',
      desc: 'Distant metropolitan silhouettes',
      icon: Building2,
      enabled: showDecorativeSkyline,
      toggle: () => toggleDecorativeSkyline(),
      color: 'text-slate-400',
    },
  ] as const;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 380, damping: 25 }}
        className="absolute bottom-16 right-6 w-72 glass-panel p-3 rounded-2xl border border-white/15 bg-slate-950/95 backdrop-blur-2xl shadow-[0_12px_36px_rgba(0,0,0,0.8)] z-30 select-none text-xs"
      >
        <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
          <div className="flex items-center space-x-1.5 font-bold text-white font-mono">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Visual Layers</span>
          </div>
          <button
            onClick={onClose}
            className="text-[10px] text-slate-400 hover:text-white font-mono"
          >
            Done
          </button>
        </div>

        <div className="space-y-1">
          {layerItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundFx.playClick();
                  item.toggle();
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all text-left ${
                  item.enabled
                    ? 'bg-slate-900/80 border-white/10 hover:border-cyan-400/30'
                    : 'bg-transparent border-transparent text-slate-500 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className={`p-1 rounded-lg bg-slate-950 border border-white/5 ${item.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className={`font-mono text-xs font-semibold ${item.enabled ? 'text-white' : 'text-slate-500'}`}>
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-500">{item.desc}</div>
                  </div>
                </div>

                <div
                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    item.enabled
                      ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                      : 'border-white/20 bg-slate-900'
                  }`}
                >
                  {item.enabled && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
