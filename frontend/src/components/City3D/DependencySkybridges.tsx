import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { GraphEdge, FileNode } from '../../types';

interface DependencySkybridgesProps {
  graphEdges: GraphEdge[];
  allBuildingsMap: Map<string, FileNode>;
  selectedFile: FileNode | null;
  lowPowerMode?: boolean;
}

export const DependencySkybridges: React.FC<DependencySkybridgesProps> = ({
  graphEdges,
  allBuildingsMap,
  selectedFile,
  lowPowerMode = false,
}) => {
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const particleDummy = useMemo(() => new THREE.Object3D(), []);

  // Compute physical skybridges and conduit curves based strictly on real graphEdges
  const { bridges, conduits } = useMemo(() => {
    if (!graphEdges || graphEdges.length === 0) {
      return { bridges: [], conduits: [] };
    }

    const bridgeList: Array<{
      id: string;
      position: [number, number, number];
      rotation: [number, number, number];
      scale: [number, number, number];
      isRelatedToSelection: boolean;
    }> = [];

    const conduitList: Array<{
      id: string;
      curve: THREE.CatmullRomCurve3;
      mesh: THREE.Mesh;
      isRelatedToSelection: boolean;
      source: string;
      target: string;
    }> = [];

    // Filter to valid edges with existing nodes in city layout
    const processedPairs = new Set<string>();

    for (let i = 0; i < graphEdges.length; i++) {
      const edge = graphEdges[i];
      const src =
        allBuildingsMap.get(edge.source) ||
        allBuildingsMap.get(edge.source.replace(/^\//, '')) ||
        allBuildingsMap.get(`/${edge.source}`);
      const tgt =
        allBuildingsMap.get(edge.target) ||
        allBuildingsMap.get(edge.target.replace(/^\//, '')) ||
        allBuildingsMap.get(`/${edge.target}`);

      if (!src || !tgt || src.id === tgt.id) continue;
      if (src.x === undefined || src.z === undefined || tgt.x === undefined || tgt.z === undefined) continue;

      // Deduplicate bidirectional visual overlaps
      const pairKey = [src.id, tgt.id].sort().join('--');
      if (processedPairs.has(pairKey)) continue;
      processedPairs.add(pairKey);

      const p1 = new THREE.Vector3(src.x, Math.max(1.5, (src.height || 2) * 0.65), src.z);
      const p2 = new THREE.Vector3(tgt.x, Math.max(1.5, (tgt.height || 2) * 0.65), tgt.z);
      const dist = p1.distanceTo(p2);

      const isRelated =
        !!selectedFile &&
        (src.id === selectedFile.id ||
          tgt.id === selectedFile.id ||
          src.path === selectedFile.path ||
          tgt.path === selectedFile.path);

      if (dist <= 16.0) {
        // 1. Close modules: Architectural Enclosed Skybridge
        const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
        const bridgeLength = dist;

        // Compute rotation to align bridge along vector between buildings
        const rotY = Math.atan2(dir.x, dir.z);
        const rotX = -Math.asin(dir.y);

        bridgeList.push({
          id: `bridge-${pairKey}`,
          position: [midPoint.x, midPoint.y, midPoint.z],
          rotation: [rotX, rotY, 0],
          scale: [0.35, 0.35, bridgeLength],
          isRelatedToSelection: isRelated,
        });
      } else {
        // 2. Longer spans: Elevated Luminous Transit Conduit Cable with catenary sag
        const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        // Realistic catenary curve dip or arched transit clearance
        midPoint.y = Math.max(2.5, Math.min(p1.y, p2.y) - Math.min(4.0, dist * 0.08));

        const curve = new THREE.CatmullRomCurve3([p1, midPoint, p2]);
        const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.09, 6, false);
        const tubeMat = new THREE.MeshStandardMaterial({
          color: isRelated ? '#38bdf8' : '#0369a1',
          emissive: isRelated ? '#38bdf8' : '#0284c7',
          emissiveIntensity: isRelated ? 1.8 : 0.45,
          roughness: 0.3,
          metalness: 0.8,
          transparent: true,
          opacity: isRelated ? 0.95 : 0.38,
        });

        conduitList.push({
          id: `conduit-${pairKey}`,
          curve,
          mesh: new THREE.Mesh(tubeGeo, tubeMat),
          isRelatedToSelection: isRelated,
          source: src.id,
          target: tgt.id,
        });
      }
    }

    return { bridges: bridgeList, conduits: conduitList };
  }, [graphEdges, allBuildingsMap, selectedFile]);

  // Animated traffic packet particles along conduits
  const totalConduits = conduits.length;
  const particlesCount = lowPowerMode ? totalConduits : totalConduits * 2;

  useFrame(({ clock }) => {
    if (!particlesRef.current || totalConduits === 0) return;
    const elapsed = clock.getElapsedTime();

    for (let i = 0; i < totalConduits; i++) {
      const { curve, isRelatedToSelection } = conduits[i];
      // Animate 1-2 traffic data packets per conduit
      const t = (elapsed * 0.35 + i * 0.17) % 1.0;
      const pt = curve.getPointAt(t);

      particleDummy.position.copy(pt);
      const scale = isRelatedToSelection ? 0.35 : 0.22;
      particleDummy.scale.set(scale, scale, scale);
      particleDummy.updateMatrix();

      particlesRef.current.setMatrixAt(i, particleDummy.matrix);

      const pCol = isRelatedToSelection ? new THREE.Color('#38bdf8') : new THREE.Color('#0ea5e9');
      particlesRef.current.setColorAt(i, pCol);
    }

    particlesRef.current.instanceMatrix.needsUpdate = true;
    if (particlesRef.current.instanceColor) {
      particlesRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. Architectural Rigid Skybridges */}
      {bridges.map((b) => (
        <group key={b.id} position={b.position} rotation={b.rotation}>
          {/* Main Enclosed Bridge Tube */}
          <mesh scale={b.scale}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={b.isRelatedToSelection ? '#38bdf8' : '#0c1a32'}
              emissive={b.isRelatedToSelection ? '#38bdf8' : '#0284c7'}
              emissiveIntensity={b.isRelatedToSelection ? 1.6 : 0.35}
              roughness={0.25}
              metalness={0.85}
              transparent
              opacity={0.88}
            />
          </mesh>
          {/* Glowing Glass Window Band Along Bridge */}
          <mesh scale={[b.scale[0] * 1.05, b.scale[1] * 0.35, b.scale[2] * 0.95]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial
              color={b.isRelatedToSelection ? '#67e8f9' : '#38bdf8'}
              toneMapped={false}
              transparent
              opacity={0.75}
            />
          </mesh>
        </group>
      ))}

      {/* 2. Luminous Long-Distance Dependency Conduits */}
      {conduits.map((c) => (
        <primitive key={c.id} object={c.mesh} />
      ))}

      {/* 3. Traffic Data Packet Particles */}
      {totalConduits > 0 && (
        <instancedMesh
          ref={particlesRef}
          args={[undefined, undefined, totalConduits]}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
      )}
    </group>
  );
};

