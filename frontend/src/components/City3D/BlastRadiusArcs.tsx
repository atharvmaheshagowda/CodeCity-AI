import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { FileNode } from '../../types';

interface BlastRadiusArcsProps {
  selectedFile: FileNode;
  allBuildingsMap: Map<string, FileNode>;
  maxHopDepth: number;
  isFailureSimulation?: boolean;
  lowPowerMode?: boolean;
}

export const BlastRadiusArcs: React.FC<BlastRadiusArcsProps> = ({
  selectedFile,
  allBuildingsMap,
  maxHopDepth,
  isFailureSimulation = false,
  lowPowerMode = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const shockwaveStartTime = useRef<number>(performance.now());

  // Vibrant Hop Color Definitions
  const HOP_COLORS: { [hop: number]: THREE.Color } = useMemo(() => {
    if (isFailureSimulation) {
      return {
        1: new THREE.Color('#f97316'), // Amber / Orange (Direct Failure)
        2: new THREE.Color('#e11d48'), // Crimson / Rose (Indirect Failure)
        3: new THREE.Color('#be123c'), // Deep Ruby (Transitive Failure)
      };
    }
    return {
      1: new THREE.Color('#38bdf8'), // Sky Cyan (Hop 1: Direct)
      2: new THREE.Color('#c084fc'), // Electric Violet (Hop 2: Indirect)
      3: new THREE.Color('#fb7185'), // Rose Crimson (Hop 3: Transitive)
    };
  }, [isFailureSimulation]);

  // Compute Bezier Curves & Arc Meshes
  const { arcCurves, tubeMeshes, sourcePos } = useMemo(() => {
    shockwaveStartTime.current = performance.now();

    const sourceNode = allBuildingsMap.get(selectedFile.id) || allBuildingsMap.get(selectedFile.path) || selectedFile;
    if (!sourceNode || sourceNode.x === undefined || sourceNode.z === undefined) {
      return { arcCurves: [], tubeMeshes: [], sourcePos: new THREE.Vector3(0, 0, 0) };
    }

    const srcPos = new THREE.Vector3(
      sourceNode.x,
      (sourceNode.height || 2) + 0.5,
      sourceNode.z
    );

    const curves: Array<{
      curve: THREE.QuadraticBezierCurve3;
      hop: number;
      targetId: string;
      color: THREE.Color;
    }> = [];

    const meshes: Array<{
      mesh: THREE.Mesh;
      hop: number;
      targetId: string;
      color: THREE.Color;
    }> = [];

    const hops = selectedFile.blast_radius?.hops || {};

    for (let hop = 1; hop <= Math.min(3, maxHopDepth); hop++) {
      const targets = (hops as any)[hop] || (hops as any)[String(hop)] || [];
      const col = HOP_COLORS[hop] || new THREE.Color('#38bdf8');

      for (const rawTargetPath of targets) {
        const targetNode =
          allBuildingsMap.get(rawTargetPath) ||
          allBuildingsMap.get(rawTargetPath.replace(/^\//, '')) ||
          allBuildingsMap.get(`/${rawTargetPath}`);

        if (targetNode && targetNode.x !== undefined && targetNode.z !== undefined) {
          const tgtPos = new THREE.Vector3(
            targetNode.x,
            (targetNode.height || 2) + 0.4,
            targetNode.z
          );

          // Control point for arc midpoint arched high in Y
          const midPos = new THREE.Vector3().addVectors(srcPos, tgtPos).multiplyScalar(0.5);
          const dist = srcPos.distanceTo(tgtPos);
          midPos.y += Math.max(3.5, Math.min(24.0, dist * 0.55));

          const curve = new THREE.QuadraticBezierCurve3(srcPos, midPos, tgtPos);
          curves.push({ curve, hop, targetId: rawTargetPath, color: col });

          // 3D Tube geometry with thickness
          const tubeGeo = new THREE.TubeGeometry(curve, 28, 0.13, 8, false);
          const tubeMat = new THREE.MeshStandardMaterial({
            color: col,
            emissive: col,
            emissiveIntensity: isFailureSimulation ? 3.8 : 3.2,
            roughness: 0.15,
            metalness: 0.85,
            transparent: true,
            opacity: 0.92,
          });

          const mesh = new THREE.Mesh(tubeGeo, tubeMat);
          meshes.push({ mesh, hop, targetId: rawTargetPath, color: col });
        }
      }
    }

    return { arcCurves: curves, tubeMeshes: meshes, sourcePos: srcPos };
  }, [selectedFile, allBuildingsMap, maxHopDepth, HOP_COLORS, isFailureSimulation]);

  // Particle instances setup
  const particleDummy = useMemo(() => new THREE.Object3D(), []);
  const totalConduits = arcCurves.length;
  // Up to 3 glowing energy beads per conduit
  const particlesPerConduit = lowPowerMode ? 1 : 3;
  const totalParticles = totalConduits * particlesPerConduit;

  // Frame animation loop
  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const shockwaveAge = (performance.now() - shockwaveStartTime.current) / 1000;

    // 1. Expanding Ground Shockwave Animation
    if (shockwaveRef.current) {
      const duration = 1.6;
      if (shockwaveAge < duration) {
        const t = shockwaveAge / duration;
        const scale = 1.0 + t * 24.0;
        shockwaveRef.current.scale.set(scale, scale, 1);
        shockwaveRef.current.visible = true;
        const mat = shockwaveRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, (1 - t) * 0.85);
      } else {
        shockwaveRef.current.visible = false;
      }
    }

    // 2. Animate Tube Pulses & Staggered Wave Fade-in
    tubeMeshes.forEach((item, idx) => {
      const mat = item.mesh.material as THREE.MeshStandardMaterial;
      // Staggered wave delay per hop: hop 1 = 0s, hop 2 = 0.25s, hop 3 = 0.50s
      const hopDelay = (item.hop - 1) * 0.25;
      const waveAlpha = Math.max(0.05, Math.min(1.0, (shockwaveAge - hopDelay) / 0.35));

      const pulseBase = isFailureSimulation ? 2.4 : 1.6;
      const pulseSpeed = isFailureSimulation ? 6.5 : 4.5;
      mat.emissiveIntensity = (pulseBase + Math.sin(elapsed * pulseSpeed + idx * 0.7) * 0.8) * waveAlpha;
      mat.opacity = 0.92 * waveAlpha;
    });

    // 3. Flowing Data Packet Particles Along Arcs
    if (particlesRef.current && totalParticles > 0) {
      let pIdx = 0;
      for (let cIdx = 0; cIdx < totalConduits; cIdx++) {
        const { curve, color, hop } = arcCurves[cIdx];
        const hopDelay = (hop - 1) * 0.25;
        const waveProgress = Math.max(0, Math.min(1.0, (shockwaveAge - hopDelay) / 0.35));

        for (let pSub = 0; pSub < particlesPerConduit; pSub++) {
          if (waveProgress <= 0.05) {
            particleDummy.scale.set(0, 0, 0);
            particleDummy.updateMatrix();
            particlesRef.current.setMatrixAt(pIdx, particleDummy.matrix);
            pIdx++;
            continue;
          }

          // Staggered speed and phase
          const speed = isFailureSimulation ? 0.75 : 0.55;
          const phaseOffset = pSub * (1.0 / particlesPerConduit);
          const t = (elapsed * speed + cIdx * 0.15 + phaseOffset) % 1.0;

          const pt = curve.getPointAt(t);
          const tangent = curve.getTangentAt(t);
          particleDummy.position.copy(pt);
          particleDummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
          const pPulse = 0.8 + Math.sin(t * Math.PI) * 0.3;
          const currentScale = 0.36 * pPulse * waveProgress;
          particleDummy.scale.set(currentScale, currentScale, currentScale);
          particleDummy.updateMatrix();

          particlesRef.current.setMatrixAt(pIdx, particleDummy.matrix);
          particlesRef.current.setColorAt(pIdx, color);
          pIdx++;
        }
      }
      particlesRef.current.instanceMatrix.needsUpdate = true;
      if (particlesRef.current.instanceColor) {
        particlesRef.current.instanceColor.needsUpdate = true;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Ground Shockwave Ring on Selection */}
      <mesh
        ref={shockwaveRef}
        position={[sourcePos.x, 0.08, sourcePos.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.8, 1.4, 48]} />
        <meshBasicMaterial
          color={isFailureSimulation ? '#ef4444' : '#38bdf8'}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. 3D Parabolic Glowing Conduits */}
      {tubeMeshes.map((item, i) => (
        <primitive key={`arc-tube-${item.targetId}-${item.hop}-${i}`} object={item.mesh} />
      ))}

      {/* 3. Glowing Data Packet Particles Flowing along Arcs */}
      {!lowPowerMode && totalParticles > 0 && (
        <instancedMesh
          ref={particlesRef}
          args={[undefined, undefined, totalParticles]}
        >
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color={isFailureSimulation ? '#fecdd3' : '#e0f2fe'} toneMapped={false} />
        </instancedMesh>
      )}
    </group>
  );
};
