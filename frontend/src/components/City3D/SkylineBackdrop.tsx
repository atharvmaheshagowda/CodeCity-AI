import React, { useMemo } from 'react';
import * as THREE from 'three';

interface SkylineBackdropProps {
  lowPowerMode?: boolean;
}

/**
 * Creates procedural 3D neon billboard sign for the Archway: "CodeCity AI"
 */
function createCodeCitySignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
  ctx.roundRect(4, 4, 504, 120, 16);
  ctx.fill();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.95)';
  ctx.lineWidth = 4;
  ctx.roundRect(4, 4, 504, 120, 16);
  ctx.stroke();

  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 18;

  ctx.font = 'bold 52px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CodeCity AI', 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export const SkylineBackdrop: React.FC<SkylineBackdropProps> = ({ lowPowerMode = false }) => {
  const signTexture = useMemo(() => createCodeCitySignTexture(), []);

  return (
    <group name="cinematic-backdrop">
      {/* 1. Monumental Gateway Arch with Glowing "CodeCity AI" Neon Billboard (Left Sky) */}
      <group position={[-11.5, 0, -20.5]} rotation={[0, 0.72, 0]}>
        {/* Left Column Tower */}
        <mesh position={[-3.6, 10.5, 0]}>
          <boxGeometry args={[3.0, 21, 3.6]} />
          <meshStandardMaterial
            color="#050c18"
            metalness={0.85}
            roughness={0.25}
            emissive="#0284c7"
            emissiveIntensity={0.35}
          />
        </mesh>

        {/* Right Column Tower */}
        <mesh position={[3.6, 10.5, 0]}>
          <boxGeometry args={[3.0, 21, 3.6]} />
          <meshStandardMaterial
            color="#050c18"
            metalness={0.85}
            roughness={0.25}
            emissive="#0284c7"
            emissiveIntensity={0.35}
          />
        </mesh>

        {/* Horizontal Connecting Skybridge Span */}
        <mesh position={[0, 19.5, 0]}>
          <boxGeometry args={[10.2, 3.4, 4.0]} />
          <meshStandardMaterial
            color="#081426"
            metalness={0.88}
            roughness={0.22}
            emissive="#06b6d4"
            emissiveIntensity={0.45}
          />
        </mesh>

        {/* Glowing "CodeCity AI" 3D Neon Sign */}
        <mesh position={[0, 19.5, 2.1]}>
          <planeGeometry args={[8.5, 2.1]} />
          <meshBasicMaterial
            map={signTexture}
            transparent
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* 2. Cybernetic Architectural Arena / Convention Pavilion (Right Background) */}
      <group position={[17.0, 0.0, -13.0]}>
        {/* Foundation Plinth */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[14, 15, 1.2, 32]} />
          <meshStandardMaterial color="#040813" metalness={0.85} roughness={0.28} />
        </mesh>

        {/* Lower Glazed Concourse Ring with soft interior illumination */}
        <mesh position={[0, 1.8, 0]}>
          <cylinderGeometry args={[12.8, 13.8, 1.2, 32]} />
          <meshStandardMaterial
            color="#071526"
            emissive="#0284c7"
            emissiveIntensity={0.35}
            metalness={0.75}
            roughness={0.25}
          />
        </mesh>

        {/* Sculptural Aerodynamic Roof Shell */}
        <mesh position={[0, 2.6, 0]}>
          <cylinderGeometry args={[10.5, 12.6, 0.8, 32]} />
          <meshStandardMaterial color="#0b162a" metalness={0.90} roughness={0.22} />
        </mesh>

        {/* Crown Skylight Hub */}
        <mesh position={[0, 3.1, 0]}>
          <cylinderGeometry args={[4.2, 5.8, 0.4, 24]} />
          <meshStandardMaterial
            color="#0a192f"
            emissive="#38bdf8"
            emissiveIntensity={0.42}
            metalness={0.80}
            roughness={0.20}
          />
        </mesh>

        {/* Perimeter Structural Rib Columns */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
          const angle = (idx / 8) * Math.PI * 2;
          const rx = Math.sin(angle) * 13.2;
          const rz = Math.cos(angle) * 13.2;
          return (
            <mesh key={`arena-rib-${idx}`} position={[rx, 1.8, rz]} rotation={[0, -angle, 0]}>
              <boxGeometry args={[0.35, 2.4, 0.8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
            </mesh>
          );
        })}

        {/* Subtle Ambient Arena Skylight Glow */}
        <pointLight position={[0, 4.5, 0]} intensity={0.45} distance={35} color="#38bdf8" />
      </group>
    </group>
  );
};

/**
 * 360-Degree Distant Megalopolis Horizon:
 * Procedural low-poly background skyscrapers situated at R = 140-185m in the far horizon.
 * Completely outside repository bounds (zero occlusion of repo buildings), blending softly
 * into exponential night fog with subtle window slits and red aviation warning beacons.
 */
export const DistantMegalopolisHorizon: React.FC<{ lowPowerMode?: boolean }> = ({ lowPowerMode = false }) => {
  const meshRef = React.useRef<THREE.InstancedMesh>(null);
  const beaconRef = React.useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const numTowers = 48;

  // Deterministic seeded procedural background tower instances
  const towers = useMemo(() => {
    const list: Array<{ x: number; z: number; h: number; w: number; d: number }> = [];
    let seed = 42;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let i = 0; i < numTowers; i++) {
      const angle = (i / numTowers) * Math.PI * 2 + (rnd() - 0.5) * 0.08;
      const radius = 140 + rnd() * 42;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      const h = 32 + rnd() * 85;
      const w = 7 + rnd() * 9;
      const d = 7 + rnd() * 9;
      list.push({ x, z, h, w, d });
    }
    return list;
  }, []);

  React.useEffect(() => {
    if (!meshRef.current || lowPowerMode) return;
    towers.forEach((t, i) => {
      // Tower volume
      dummy.position.set(t.x, t.h * 0.5, t.z);
      dummy.rotation.set(0, (i * 0.4) % Math.PI, 0);
      dummy.scale.set(t.w, t.h, t.d);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);

      // Rooftop red hazard beacon
      if (beaconRef.current) {
        dummy.position.set(t.x, t.h + 0.8, t.z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(0.65, 0.65, 0.65);
        dummy.updateMatrix();
        beaconRef.current.setMatrixAt(i, dummy.matrix);
      }
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (beaconRef.current) {
      beaconRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [towers, dummy, lowPowerMode]);

  if (lowPowerMode) return null;

  return (
    <group name="distant-megalopolis-horizon">
      {/* 1. Low-Poly Distant Monolithic Tower Instances */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, numTowers]} receiveShadow={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#030713"
          roughness={0.85}
          metalness={0.78}
          emissive="#0284c7"
          emissiveIntensity={0.12}
        />
      </instancedMesh>

      {/* 2. Red Aviation Hazard Beacons on Horizon Towers */}
      <instancedMesh ref={beaconRef} args={[undefined, undefined, numTowers]}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial color="#ef4444" toneMapped={false} />
      </instancedMesh>
    </group>
  );
};
