import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ShieldAlert, Flame, Sparkles } from 'lucide-react';
import type { FileNode } from '../../types';

interface LandmarkBeaconsProps {
  buildings: FileNode[];
  selectedFile: FileNode | null;
  hideHtmlLabels?: boolean;
  lowPowerMode?: boolean;
}

export const LandmarkBeacons: React.FC<LandmarkBeaconsProps> = ({
  buildings,
  selectedFile,
  hideHtmlLabels = false,
  lowPowerMode = false,
}) => {
  // Identify top landmark files: hot spot or rank #1 (limit to top 2 to avoid clutter)
  const landmarks = useMemo(() => {
    return buildings
      .filter((b) => b.is_hotspot || (b.risk_rank !== undefined && b.risk_rank === 1) || (b.risk_probability >= 0.7 && b.impact_score >= 1.8))
      .slice(0, 2);
  }, [buildings]);

  const beaconMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color('#38bdf8'),
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }, []);

  const beaconGroupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (lowPowerMode) return;
    const t = clock.getElapsedTime();
    if (beaconMaterial) {
      beaconMaterial.opacity = 0.25 + 0.10 * Math.sin(t * 2.2);
    }
  });

  if (landmarks.length === 0) return null;

  return (
    <group ref={beaconGroupRef}>
      {landmarks.map((b) => {
        const bx = b.x || 0;
        const bz = b.z || 0;
        const bHeight = b.height || 4;
        const isSelected = selectedFile?.id === b.id || selectedFile?.path === b.path;

        return (
          <group key={`landmark-${b.id}`} position={[bx, 0, bz]}>
            {/* 1. Vertical Holographic Light Beam ascending into the atmosphere */}
            {!lowPowerMode && (
              <mesh position={[0, bHeight + 16, 0]}>
                <cylinderGeometry args={[0.25, 0.75, 32, 16, 1, true]} />
                <primitive object={beaconMaterial} attach="material" />
              </mesh>
            )}

            {/* 2. Floating Holographic Landmark Badge strictly above the tower crown (Hidden when focused or selected) */}
            {!hideHtmlLabels && !isSelected && !selectedFile && (
              <Html
                position={[0, bHeight + 2.0, 0]}
                center
                distanceFactor={45}
                zIndexRange={[10, 25]}
              >
                <div className="pointer-events-none flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-slate-950/85 border border-cyan-400/40 text-[9px] font-mono text-cyan-200 backdrop-blur-md shadow-glow-cyan whitespace-nowrap select-none scale-90">
                  {b.risk_probability >= 0.6 ? (
                    <Flame className="w-2.5 h-2.5 text-rose-400 animate-pulse" />
                  ) : (
                    <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                  )}
                  <span className="font-semibold truncate max-w-[100px]">{b.filename}</span>
                  <span className="text-[8px] px-1 rounded bg-cyan-500/20 text-cyan-300 font-sans">
                    HOTSPOT
                  </span>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};
