import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { CouplingPair, FileNode } from '../../types';

interface CouplingTunnelsProps {
  pairs: CouplingPair[];
  allBuildingsMap: Map<string, FileNode>;
  selectedFile: FileNode | null;
  lowPowerMode?: boolean;
}

export const CouplingTunnels: React.FC<CouplingTunnelsProps> = ({
  pairs,
  allBuildingsMap,
  selectedFile,
  lowPowerMode = false,
}) => {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  const tunnels = useMemo(() => {
    if (!pairs || pairs.length === 0) return [];

    const list: Array<{
      id: string;
      geometry: THREE.TubeGeometry;
      isHighlighted: boolean;
    }> = [];

    for (const p of pairs) {
      const srcPath = (p as any).source || p.file_a;
      const tgtPath = (p as any).target || p.file_b;
      const src =
        allBuildingsMap.get(srcPath) ||
        allBuildingsMap.get(srcPath.replace(/^\//, '')) ||
        allBuildingsMap.get(`/${srcPath}`);
      const tgt =
        allBuildingsMap.get(tgtPath) ||
        allBuildingsMap.get(tgtPath.replace(/^\//, '')) ||
        allBuildingsMap.get(`/${tgtPath}`);

      if (!src || !tgt) continue;
      if (src.x === undefined || src.z === undefined || tgt.x === undefined || tgt.z === undefined) continue;

      const p1 = new THREE.Vector3(src.x, 0.25, src.z);
      const p2 = new THREE.Vector3(tgt.x, 0.25, tgt.z);
      const dist = p1.distanceTo(p2);

      // Low ground-skimming arch with midpoint slightly lifted
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mid.y = Math.min(2.0, 0.3 + dist * 0.05);

      const curve = new THREE.CatmullRomCurve3([p1, mid, p2]);
      const geom = new THREE.TubeGeometry(curve, 24, 0.18, 8, false);

      const isHighlighted =
        !!selectedFile &&
        (src.id === selectedFile.id ||
          tgt.id === selectedFile.id ||
          src.path === selectedFile.path ||
          tgt.path === selectedFile.path);

      list.push({
        id: `tunnel-${p.file_a}-${p.file_b}`,
        geometry: geom,
        isHighlighted,
      });
    }

    return list;
  }, [pairs, allBuildingsMap, selectedFile]);

  // Gentle pulse animation
  useFrame((state) => {
    if (!materialRef.current || lowPowerMode) return;
    const t = state.clock.elapsedTime;
    const pulse = Math.sin(t * 2.5) * 0.3 + 0.8;
    materialRef.current.emissiveIntensity = pulse * 1.8;
  });

  if (tunnels.length === 0) return null;

  return (
    <group name="hidden-coupling-tunnels">
      {tunnels.map((t) => (
        <mesh key={t.id} geometry={t.geometry}>
          <meshStandardMaterial
            ref={t.isHighlighted ? undefined : materialRef}
            color={t.isHighlighted ? '#c084fc' : '#8b5cf6'}
            emissive={t.isHighlighted ? '#d8b4fe' : '#7c3aed'}
            emissiveIntensity={t.isHighlighted ? 2.5 : 1.2}
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  );
};
