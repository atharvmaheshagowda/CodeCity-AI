import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { AlertTriangle } from 'lucide-react';
import type { DistrictZone, FileNode } from '../../types';

interface InSceneBuildingBadgesProps {
  buildings: FileNode[];
  selectedFile: FileNode | null;
  onSelectFile: (file: FileNode) => void;
  hideHtmlLabels?: boolean;
  districts?: DistrictZone[];
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
      shadowClass: 'shadow-[0_0_12px_rgba(20,184,166,0.5)]',
    };
  }
  if (name.includes('config') || name.includes('settings') || name.endsWith('.yaml') || name.endsWith('.env')) {
    return {
      type: 'config',
      label: 'CFG',
      icon: '⚙️',
      colorClass: 'text-amber-300',
      borderClass: 'border-amber-500/80',
      shadowClass: 'shadow-[0_0_12px_rgba(245,158,11,0.5)]',
    };
  }
  if (name === 'app.py' || name === 'main.py' || name === 'cli.py' || name === 'server.py' || name === '__main__.py') {
    return {
      type: 'entry',
      label: 'GATEWAY',
      icon: '🚀',
      colorClass: 'text-cyan-200',
      borderClass: 'border-cyan-400',
      shadowClass: 'shadow-[0_0_16px_rgba(6,182,212,0.65)]',
    };
  }
  if (name.includes('model') || name.includes('schema') || name.includes('entity') || name.includes('seed') || name.includes('db')) {
    return {
      type: 'vault',
      label: 'VAULT',
      icon: '🏛️',
      colorClass: 'text-indigo-200',
      borderClass: 'border-indigo-400/80',
      shadowClass: 'shadow-[0_0_12px_rgba(99,102,241,0.55)]',
    };
  }
  return {
    type: 'mod',
    label: 'MOD',
    icon: '📦',
    colorClass: 'text-cyan-300',
    borderClass: 'border-cyan-400/80',
    shadowClass: 'shadow-[0_0_10px_rgba(6,182,212,0.4)]',
  };
}

/**
 * Intelligent Anti-Collision In-Scene Badges:
 * - High-risk hero buildings & selected files receive full prominent HUD callouts
 * - Normal files in dense repos receive sleek, non-overlapping micro-pins
 * - District billboard is dynamically elevated above the district perimeter, never colliding with buildings
 */
export const InSceneBuildingBadges: React.FC<InSceneBuildingBadgesProps> = ({
  buildings,
  selectedFile,
  onSelectFile,
  hideHtmlLabels = false,
  districts = [],
}) => {
  if (hideHtmlLabels || !buildings || buildings.length === 0) return null;

  const isSmallDemo = buildings.length <= 8;

  // Compute district billboard dynamic anchor
  const districtBillboardPos = useMemo(() => {
    if (districts && districts.length > 0) {
      const d = districts[0];
      return [d.x + d.width * 0.46, (d.maxBuildingHeight || 12) + 4.2, d.z - d.depth * 0.46] as [number, number, number];
    }
    return [16.0, 18.5, -16.0] as [number, number, number];
  }, [districts]);

  return (
    <group name="in-scene-building-badges">
      {/* 2. Individual Building In-Scene Badges */}
      {buildings.map((b, i) => {
        const bx = b.x || 0;
        const bz = b.z || 0;
        const bHeight = b.height || 4;
        const riskPct = Math.round(b.risk_probability * 100);
        const isSelected = selectedFile?.id === b.id || selectedFile?.path === b.path;
        const isHighRisk = riskPct >= 45 || b.is_hotspot || b.filename === 'seed_db.py';
        const isGateway = b.filename === 'app.py' || b.filename === 'main.py';
        const arch = getArchetype(b);

        // Anti-collision staggering: adjust pin height based on index and neighbor proximity
        const pinOffset = isHighRisk
          ? 2.4
          : isSelected
          ? 2.2
          : b.filename === 'config.py'
          ? 3.2
          : b.filename === '__init__.py'
          ? 0.9
          : 1.8 + ((i % 3) * 0.45);
        const shouldShowFullBadge = isSmallDemo || isSelected || isHighRisk || isGateway;

        const displayName = b.filename;
        const displayRisk = riskPct;

        // Subtle lateral and vertical pin adjustment to guarantee zero screen-space overlap
        const posX = bx + (b.filename === '__init__.py' ? 1.4 : 0);
        const posZ = bz + (b.filename === '__init__.py' ? -1.0 : 0);

        return (
          <group key={`badge-${b.id}`} position={[posX, bHeight + pinOffset, posZ]}>
            <Html center distanceFactor={42} zIndexRange={[15, 60]}>
              <div className="flex flex-col items-center">
                {shouldShowFullBadge ? (
                  // Full Detailed Badge for Important / Selected / Small-Repo Buildings
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectFile(b);
                    }}
                    className={`cursor-pointer pointer-events-auto px-2.5 py-1 rounded-xl backdrop-blur-xl transition-all select-none whitespace-nowrap ${
                      isHighRisk
                        ? 'bg-slate-950/94 border border-rose-500 shadow-[0_0_16px_rgba(244,63,94,0.75)] text-white scale-105'
                        : isSelected
                        ? 'bg-slate-950/92 border border-cyan-400 shadow-[0_0_14px_rgba(6,182,212,0.65)] text-cyan-100 scale-100'
                        : `bg-slate-950/88 border ${arch.borderClass} ${arch.shadowClass} ${arch.colorClass} hover:scale-105`
                    }`}
                  >
                    {/* Top Row: Filename with Warning Icon if High Risk */}
                    <div className="flex items-center gap-1.5 font-mono text-[10.5px] font-bold">
                      {isHighRisk ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      ) : !isSmallDemo ? (
                        <span className="text-[10px] opacity-80 shrink-0">{arch.icon}</span>
                      ) : null}
                      <span className="tracking-tight">{displayName}</span>
                      {!isSmallDemo && (
                        <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-white/10 uppercase font-semibold text-slate-300">
                          {arch.label}
                        </span>
                      )}
                    </div>

                    {/* Bottom Row: Risk Metric */}
                    <div
                      className={`text-[9px] font-mono mt-0.5 ${
                        isHighRisk ? 'text-rose-400 font-bold' : 'text-cyan-300'
                      }`}
                    >
                      {isHighRisk ? `Risk: ${riskPct}%` : `${displayRisk}% risk`}
                    </div>
                  </div>
                ) : (
                  // Sleek Non-Overlapping Micro-Pin for dense repository secondary files
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectFile(b);
                    }}
                    title={`${displayName} (${riskPct}% risk)`}
                    className="cursor-pointer pointer-events-auto group px-1.5 py-0.5 rounded-md bg-slate-950/85 border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.35)] hover:scale-110 transition-all flex items-center space-x-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span className="font-mono text-[9px] text-slate-300 group-hover:text-cyan-200">
                      {displayName}
                    </span>
                  </div>
                )}

                {/* Vertical Pin Line pointing to building roof */}
                <div
                  className={`w-[1px] h-3 ${
                    isHighRisk
                      ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]'
                      : isSelected
                      ? 'bg-cyan-300 shadow-[0_0_6px_rgba(6,182,212,0.8)]'
                      : 'bg-cyan-500/60'
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
