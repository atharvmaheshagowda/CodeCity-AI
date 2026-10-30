import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { ShortestPathResult, FileNode } from '../../types';

interface ActivePathBeamProps {
  result: ShortestPathResult | null;
  allBuildingsMap: Map<string, FileNode>;
  lowPowerMode?: boolean;
}

export const ActivePathBeam: React.FC<ActivePathBeamProps> = ({
  result,
  allBuildingsMap,
  lowPowerMode = false,
}) => {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  const beamGeometries = useMemo(() => {
    if (!result || !result.exists || result.path.length < 2) return [];

    const geoms: Array<{ id: string; geometry: THREE.TubeGeometry }> = [];

    for (let i = 0; i < result.path.length - 1; i++) {
      const srcPath = result.path[i];
      const tgtPath = result.path[i + 1];

      const n1 = allBuildingsMap.get(srcPath) || allBuildingsMap.get(srcPath.replace(/^\//, ''));
      const n2 = allBuildingsMap.get(tgtPath) || allBuildingsMap.get(tgtPath.replace(/^\//, ''));

      if (!n1 || !n2) continue;
      if (n1.x === undefined || n1.z === undefined || n2.x === undefined || n2.z === undefined) continue;

      const p1 = new THREE.Vector3(n1.x, (n1.height || 3) * 0.7, n1.z);
      const p2 = new THREE.Vector3(n2.x, (n2.height || 3) * 0.7, n2.z);
      const dist = p1.distanceTo(p2);

      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mid.y += Math.min(3.0, 0.5 + dist * 0.08);

      const curve = new THREE.CatmullRomCurve3([p1, mid, p2]);
      const geom = new THREE.TubeGeometry(curve, 24, 0.25, 8, false);

      geoms.push({
        id: `path-beam-${srcPath}-${tgtPath}`,
        geometry: geom,
      });
    }

    return geoms;
  }, [result, allBuildingsMap]);

  useFrame((state) => {
    if (!matRef.current || lowPowerMode) return;
    const t = state.clock.elapsedTime;
    const pulse = Math.sin(t * 4.0) * 0.4 + 1.2;
    matRef.current.emissiveIntensity = pulse * 2.5;
  });

  if (beamGeometries.length === 0) return null;

  return (
    <group name="active-path-beams">
      {beamGeometries.map((b) => (
        <mesh key={b.id} geometry={b.geometry}>
          <meshStandardMaterial
            ref={matRef}
            color="#38bdf8"
            emissive="#00f0ff"
            emissiveIntensity={2.5}
            roughness={0.1}
            metalness={0.9}
            transparent
            opacity={0.95}
          />
        </mesh>
      ))}
    </group>
  );
};

