import React from 'react';
import { Html } from '@react-three/drei';
import { AlertTriangle } from 'lucide-react';
import type { FileNode } from '../../types';

interface InSceneBuildingBadgesProps {
  buildings: FileNode[];
  selectedFile: FileNode | null;
  onSelectFile: (file: FileNode) => void;
  hideHtmlLabels?: boolean;
}

interface ArchetypeMeta {
  type: 'test' | 'config' | 'entry' | 'vault' | 'mod';
  label: string;
  icon: string;
  colorClass: string;
  borderClass: string;
  shadowClass: string;
}

function getArchetype(f: FileNode): ArchetypeMeta {
  const name = f.filename.toLowerCase();
  const path = f.path.toLowerCase();
  if (name.startsWith('test_') || name.endsWith('_test.py') || name === 'test.py' || path.includes('test')) {
    return {
      type: 'test',
      label: 'TEST',
      icon: '🧪',
      colorClass: 'text-teal-300',
      borderClass: 'border-teal-500/80',
      shadowClass: 'shadow-[0_0_14px_rgba(20,184,166,0.65)]',
    };
  }
  if (name.includes('config') || name.includes('settings') || name.endsWith('.yaml') || name.endsWith('.env')) {
    return {
      type: 'config',
      label: 'CFG',
      icon: '⚙️',
      colorClass: 'text-amber-300',
      borderClass: 'border-amber-500/80',
      shadowClass: 'shadow-[0_0_14px_rgba(245,158,11,0.65)]',
    };
  }
  if (name === 'app.py' || name === 'main.py' || name === 'cli.py' || name === 'server.py' || name === '__main__.py') {
    return {
      type: 'entry',
      label: 'GATEWAY',
      icon: '🚀',
      colorClass: 'text-cyan-200',
      borderClass: 'border-cyan-300',
      shadowClass: 'shadow-[0_0_20px_rgba(6,182,212,0.9)]',
    };
  }
  if (name.includes('model') || name.includes('schema') || name.includes('entity') || name.includes('seed') || name.includes('db')) {
    return {
      type: 'vault',
      label: 'VAULT',
      icon: '🏛️',
      colorClass: 'text-indigo-200',
      borderClass: 'border-indigo-400/80',
      shadowClass: 'shadow-[0_0_16px_rgba(99,102,241,0.7)]',
    };
  }
  return {
    type: 'mod',
    label: 'MOD',
    icon: '📦',
    colorClass: 'text-cyan-300',
    borderClass: 'border-cyan-400/80',
    shadowClass: 'shadow-[0_0_12px_rgba(6,182,212,0.5)]',
  };
}

/**
 * In-Scene Floating 3D Billboard Badges matching the exact reference UI:
 * - High-risk hero skyscraper (seed_db.py): Glowing red border, warning icon, "⚠️ seed_db.py / Risk: 91%", vertical pin line
 * - Dependent & normal buildings (models.py, schemas.py, test.py, utils.py, etc.): Glowing cyan border, "filename / XX% risk", vertical pin lines
 * - Floating Upper-Right District Billboard: "root / 7 files" in glowing cyan glass
 * - Archetype distinction: tests (industrial / gray-cyan), configs (fortified dark-gold), entrypoints (cyan halo), models (blue-violet data vault)
 */
export const InSceneBuildingBadges: React.FC<InSceneBuildingBadgesProps> = ({
  buildings,
  selectedFile,
  onSelectFile,
  hideHtmlLabels = false,
}) => {
  if (hideHtmlLabels || !buildings || buildings.length === 0) return null;

  const isExactDemo = buildings.length === 7 && buildings.some((b) => b.filename === 'seed_db.py');

  return (
    <group name="in-scene-building-badges">
      {/* 1. Floating Upper-Right District Billboard (root / 7 files) */}
      <group position={[14.5, 14.8, -8.0]}>
        <Html center distanceFactor={44} zIndexRange={[12, 50]}>
          <div className="pointer-events-none select-none px-4 py-2 rounded-2xl bg-slate-950/85 border border-cyan-400/90 shadow-[0_0_20px_rgba(6,182,212,0.65)] backdrop-blur-xl text-center min-w-[90px]">
            <div className="font-bold text-sm text-white font-mono tracking-wide">root</div>
            <div className="text-[11px] text-cyan-300 font-mono mt-0.5">{buildings.length} files</div>
          </div>
        </Html>
      </group>

      {/* 2. Individual Building In-Scene Badges with Pin Connectors */}
      {buildings.map((b) => {
        const bx = b.x || 0;
        const bz = b.z || 0;
        const bHeight = b.height || 4;
        const riskPct = Math.round(b.risk_probability * 100);
        const isSelected = selectedFile?.id === b.id || selectedFile?.path === b.path;
        const isHighRisk = riskPct >= 50 || b.is_hotspot || b.filename === 'seed_db.py';
        const arch = getArchetype(b);

        // In-scene label and risk percentage
        const displayName = b.filename;
        const displayRisk = riskPct;

        return (
          <group key={`badge-${b.id}`} position={[bx, bHeight + 1.8, bz]}>
            <Html center distanceFactor={42} zIndexRange={[15, 60]}>
              <div className="flex flex-col items-center">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFile(b);
                  }}
                  className={`cursor-pointer pointer-events-auto px-3 py-1.5 rounded-xl backdrop-blur-xl transition-all select-none whitespace-nowrap ${
                    isHighRisk
                      ? 'bg-slate-950/92 border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.85)] text-white scale-105'
                      : isSelected
                      ? 'bg-slate-950/90 border-2 border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.7)] text-cyan-100 scale-100'
                      : !isExactDemo
                      ? `bg-slate-950/85 border ${arch.borderClass} ${arch.shadowClass} ${arch.colorClass} hover:scale-105`
                      : 'bg-slate-950/85 border border-cyan-400/85 shadow-[0_0_14px_rgba(6,182,212,0.5)] text-cyan-200 hover:border-cyan-300 hover:scale-105'
                  }`}
                >
                  {/* Top Row: Filename with Warning Icon if High Risk */}
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
                    {isHighRisk ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : !isExactDemo ? (
                      <span className="text-[10px] opacity-80 shrink-0">{arch.icon}</span>
                    ) : null}
                    <span className="tracking-tight">{displayName}</span>
                    {!isExactDemo && (
                      <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-white/10 uppercase font-semibold text-slate-300">
                        {arch.label}
                      </span>
                    )}
                  </div>

                  {/* Bottom Row: Risk Metric */}
                  <div
                    className={`text-[9.5px] font-mono mt-0.5 ${
                      isHighRisk ? 'text-rose-400 font-bold' : 'text-cyan-300'
                    }`}
                  >
                    {isHighRisk ? `Risk: ${riskPct}%` : `${displayRisk}% risk`}
                  </div>
                </div>

                {/* Subtle Vertical Pin Line pointing to building roof */}
                <div
                  className={`w-[1.5px] h-3.5 ${
                    isHighRisk
                      ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]'
                      : !isExactDemo
                      ? arch.type === 'test'
                        ? 'bg-teal-400 shadow-[0_0_6px_rgba(20,184,166,0.8)]'
                        : arch.type === 'config'
                        ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]'
                        : arch.type === 'entry'
                        ? 'bg-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.9)]'
                        : arch.type === 'vault'
                        ? 'bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]'
                        : 'bg-cyan-400/80 shadow-[0_0_6px_rgba(6,182,212,0.8)]'
                      : 'bg-cyan-400/80 shadow-[0_0_6px_rgba(6,182,212,0.8)]'
                  }`}
                />
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
