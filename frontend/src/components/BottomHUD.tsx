import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  Layers,
  Flame,
  Clock,
  Zap,
  RotateCcw,
  Compass,
  Building2,
  BatteryCharging,
} from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { ColorMode, FileNode } from '../types';
import { computeCityLayout, getBuildingColorHex } from '../utils/cityLayout';
import { soundFx } from '../utils/soundEffects';

export const BottomHUD: React.FC = () => {
  const {
    currentRepo,
    selectedFile,
    colorMode,
    lowPowerMode,
    presentationMode,
    showDecorativeSkyline,
    setColorMode,
    selectFile,
    triggerCameraReset,
    toggleDecorativeSkyline,
  } = useCityStore();

  const colorModes: Array<{ id: ColorMode; label: string; icon: any; key: string }> = [
    { id: 'risk', label: 'Risk', icon: Activity, key: '1' },
    { id: 'complexity', label: 'Complexity', icon: Layers, key: '2' },
    { id: 'churn', label: 'Churn', icon: Flame, key: '3' },
    { id: 'age', label: 'Age', icon: Clock, key: '4' },
    { id: 'impact', label: 'Impact', icon: Zap, key: '5' },
  ];

  // Minimap computed coordinates from actual layout
  const { buildings, bounds } = useMemo(() => {
    if (!currentRepo) return { buildings: [], bounds: { minX: -20, maxX: 20, minZ: -20, maxZ: 20 } };
    return computeCityLayout(currentRepo.files);
  }, [currentRepo]);

  if (presentationMode || !currentRepo) return null;

  // Minimap size: 130x80px
  const mapW = 130;
  const mapH = 80;
  const spanX = Math.max(1, bounds.maxX - bounds.minX);
  const spanZ = Math.max(1, bounds.maxZ - bounds.minZ);

  // Convert 3D world (X, Z) into 2D minimap SVG coordinates
  const getMapCoords = (x: number = 0, z: number = 0) => {
    const normX = (x - bounds.minX) / spanX;
    const normZ = (z - bounds.minZ) / spanZ;
    return {
      cx: 10 + normX * (mapW - 20),
      cy: 10 + normZ * (mapH - 20),
    };
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 flex items-end justify-between px-6 z-20 select-none">
      {/* 1. Left HUD: Real-time 2D City Minimap */}
      <div className="pointer-events-auto glass-panel p-2.5 rounded-2xl border border-white/10 flex items-center space-x-3 shadow-glass-panel backdrop-blur-2xl bg-slate-950/85">
        <div className="relative">
          <svg width={mapW} height={mapH} className="rounded-xl bg-slate-900/90 border border-white/5">
            {/* Subtle Grid crosshairs */}
            <line x1={mapW / 2} y1="0" x2={mapW / 2} y2={mapH} stroke="rgba(255,255,255,0.06)" strokeDasharray="2,2" />
            <line x1="0" y1={mapH / 2} x2={mapW} y2={mapH / 2} stroke="rgba(255,255,255,0.06)" strokeDasharray="2,2" />

            {/* Buildings as dots */}
            {buildings.map((b) => {
              const { cx, cy } = getMapCoords(b.x, b.z);
              const isSelected = selectedFile?.id === b.id || selectedFile?.path === b.path;
              const dotColor = getBuildingColorHex(b, colorMode);

              return (
                <g
                  key={`minimap-dot-${b.id}`}
                  className="cursor-pointer"
                  onClick={() => {
                    soundFx.playClick();
                    selectFile(isSelected ? null : b);
                  }}
                >
                  {isSelected && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r="7"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                      className="animate-ping opacity-75 origin-center"
                    />
                  )}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 4 : Math.min(3, Math.max(1.5, Math.sqrt(b.loc || 1) * 0.25))}
                    fill={isSelected ? '#ffffff' : dotColor}
                    stroke={isSelected ? '#38bdf8' : 'rgba(0,0,0,0.5)'}
                    strokeWidth="0.8"
                    opacity={isSelected ? 1 : 0.85}
                  />
                </g>
              );
            })}
          </svg>
          <div className="absolute top-1 left-1.5 flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-slate-400 pointer-events-none">
            <Compass className="w-2.5 h-2.5 text-cyan-400" />
            <span>Radar Minimap</span>
          </div>
        </div>

        {/* Minimap stats & camera reset */}
        <div className="flex flex-col justify-between h-[80px] py-0.5">
          <div>
            <div className="text-[10px] font-mono text-slate-400">
              <span className="text-white font-bold">{buildings.length}</span> nodes
            </div>
            {selectedFile ? (
              <div className="text-[9px] font-mono text-cyan-400 truncate max-w-[90px]" title={selectedFile.filename}>
                {selectedFile.filename}
              </div>
            ) : (
              <div className="text-[9px] font-mono text-slate-500">None selected</div>
            )}
          </div>

          <button
            onClick={() => {
              soundFx.playWhoosh();
              triggerCameraReset();
            }}
            onMouseEnter={soundFx.playHoverTick}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 text-[10px] font-mono transition-all"
            title="Reset camera view to center"
          >
            <RotateCcw className="w-3 h-3 text-cyan-400" />
            <span>Center</span>
          </button>
        </div>
      </div>

      {/* 2. Center HUD: Color Mode Pills with Motion sliding indicator & Active Mode Legend */}
      <div className="pointer-events-auto glass-panel px-3 py-2 rounded-2xl border border-white/10 flex flex-col items-center space-y-1.5 shadow-glass-panel backdrop-blur-2xl bg-slate-950/85">
        {/* Mode Buttons */}
        <div className="relative flex items-center space-x-1 overflow-x-auto max-w-full py-0.5">
          {colorModes.map(({ id, label, icon: Icon, key }) => {
            const isActive = colorMode === id;
            return (
              <button
                key={id}
                onClick={() => {
                  soundFx.playClick();
                  setColorMode(id);
                }}
                onMouseEnter={soundFx.playHoverTick}
                className={`relative flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-medium transition-colors z-10 ${
                  isActive ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-200'
                }`}
                title={`Switch color mode to ${label} (Key: ${key})`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeColorModePill"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    className="absolute inset-0 bg-cyan-500/20 border border-cyan-400/50 rounded-xl shadow-glow-cyan -z-10"
                  />
                )}
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline font-mono">{label}</span>
                <kbd className="text-[9px] font-mono text-slate-500 bg-black/40 px-1 rounded">
                  {key}
                </kbd>
              </button>
            );
          })}
        </div>

        {/* Dynamic Mode Legend */}
        <div className="flex items-center space-x-4 text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
          {colorMode === 'risk' && (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> &lt;35% Low Risk
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> 35-65% Medium
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-glow-rose" /> &ge;65% Defect Prone
              </span>
            </>
          )}

          {colorMode === 'complexity' && (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" /> &le;4 Simple
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" /> 5-10 Moderate
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" /> 11-15 Complex
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> &gt;15 Extreme
              </span>
            </>
          )}

          {colorMode === 'churn' && (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" /> &le;10 lines
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" /> 10-100 lines
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> 100-300 lines
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> &gt;300 Heavy Churn
              </span>
            </>
          )}

          {colorMode === 'age' && (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> &lt;30d Fresh
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> 30-90d
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> 90-180d
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" /> &gt;180d Legacy
              </span>
            </>
          )}

          {colorMode === 'impact' && (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> &lt;0.8 Isolated
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> 0.8-1.8 Medium
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-glow-rose" /> &gt;1.8 Systemic Impact
              </span>
            </>
          )}
        </div>
      </div>

      {/* 3. Right HUD: Decorative Skyline toggle + Telemetry badge */}
      <div className="pointer-events-auto glass-panel px-3 py-2 rounded-2xl border border-white/10 flex items-center space-x-2.5 shadow-glass-panel text-xs text-slate-400 font-mono backdrop-blur-2xl bg-slate-950/85">
        {/* Context Skyline Toggle Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            toggleDecorativeSkyline();
          }}
          onMouseEnter={soundFx.playHoverTick}
          className={`flex items-center space-x-1.5 px-2 py-1 rounded-xl text-[10px] border transition-all ${
            showDecorativeSkyline
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35'
              : 'bg-slate-900/60 text-slate-500 border-white/5 hover:text-slate-300'
          }`}
          title="Toggle Background Decorative Context Skyline"
        >
          <Building2 className="w-3 h-3" />
          <span>Skyline: {showDecorativeSkyline ? 'ON' : 'OFF'}</span>
        </button>

        <div className="h-3 w-px bg-white/10" />

        {lowPowerMode ? (
          <span className="flex items-center gap-1 text-amber-400">
            <BatteryCharging className="w-3.5 h-3.5" />
            <span>Eco Mode</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>60 FPS</span>
          </span>
        )}
      </div>
    </div>
  );
};
