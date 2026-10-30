import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { ArchitectureSmell, FileNode } from '../../types';

interface SmellArcsProps {
  smells: ArchitectureSmell[];
  allBuildingsMap: Map<string, FileNode>;
  lowPowerMode?: boolean;
}

export const SmellArcs: React.FC<SmellArcsProps> = ({
  smells,
  allBuildingsMap,
  lowPowerMode = false,
}) => {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  const cycleCurves = useMemo(() => {
    if (!smells || smells.length === 0) return [];

    const cycleSmells = smells.filter((s) => s.type === 'circular_dependency');
    const tubeList: Array<{ id: string; geometry: THREE.TubeGeometry }> = [];

    for (const c of cycleSmells) {
      const files = c.affected_files;
      if (files.length < 2) continue;

      for (let i = 0; i < files.length; i++) {
        const f1 = files[i];
        const f2 = files[(i + 1) % files.length];

        const node1 = allBuildingsMap.get(f1) || allBuildingsMap.get(f1.replace(/^\//, ''));
        const node2 = allBuildingsMap.get(f2) || allBuildingsMap.get(f2.replace(/^\//, ''));

        if (!node1 || !node2) continue;
        if (node1.x === undefined || node1.z === undefined || node2.x === undefined || node2.z === undefined) continue;

        const h1 = node1.height || 4;
        const h2 = node2.height || 4;

        const p1 = new THREE.Vector3(node1.x, h1 + 0.5, node1.z);
        const p2 = new THREE.Vector3(node2.x, h2 + 0.5, node2.z);
        const dist = p1.distanceTo(p2);

        // High overhead loop
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        mid.y = Math.max(h1, h2) + Math.min(5.0, 1.5 + dist * 0.15);

        const curve = new THREE.CatmullRomCurve3([p1, mid, p2]);
        const geom = new THREE.TubeGeometry(curve, 20, 0.22, 8, false);

        tubeList.push({
          id: `cycle-${f1}-${f2}`,
          geometry: geom,
        });
      }
    }

    return tubeList;
  }, [smells, allBuildingsMap]);

  useFrame((state) => {
    if (!matRef.current || lowPowerMode) return;
    const t = state.clock.elapsedTime;
    const flare = Math.sin(t * 3.5) * 0.4 + 1.0;
    matRef.current.emissiveIntensity = flare * 2.2;
  });

  if (cycleCurves.length === 0) return null;

  return (
    <group name="architecture-smell-arcs">
      {cycleCurves.map((arc) => (
        <mesh key={arc.id} geometry={arc.geometry}>
          <meshStandardMaterial
            ref={matRef}
            color="#ef4444"
            emissive="#dc2626"
            emissiveIntensity={2.0}
            roughness={0.2}
            metalness={0.9}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
};

