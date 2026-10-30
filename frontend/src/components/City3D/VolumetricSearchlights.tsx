import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface VolumetricSearchlightsProps {
  lowPowerMode?: boolean;
}

export const VolumetricSearchlights: React.FC<VolumetricSearchlightsProps> = ({ lowPowerMode = false }) => {
  const lightGroupRef = useRef<THREE.Group>(null);
  const spot1Ref = useRef<THREE.Mesh>(null);
  const spot2Ref = useRef<THREE.Mesh>(null);
  const spot3Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (lowPowerMode) return;
    const t = clock.getElapsedTime();

    if (spot1Ref.current) {
      spot1Ref.current.rotation.z = Math.sin(t * 0.35) * 0.25 - 0.2;
      spot1Ref.current.rotation.x = Math.cos(t * 0.28) * 0.20;
    }
    if (spot2Ref.current) {
      spot2Ref.current.rotation.z = Math.sin(t * 0.42 + 2.0) * 0.28 + 0.15;
      spot2Ref.current.rotation.x = Math.cos(t * 0.32 + 1.5) * 0.22;
    }
    if (spot3Ref.current) {
      spot3Ref.current.rotation.z = Math.sin(t * 0.25 + 4.0) * 0.30;
      spot3Ref.current.rotation.x = Math.cos(t * 0.38 + 3.0) * 0.25;
    }
  });

  if (lowPowerMode) return null;

  return (
    <group ref={lightGroupRef}>
      {/* Light Cone 1 (Deep Cyan Searchlight) */}
      <mesh
        ref={spot1Ref}
        position={[-35, 0, -45]}
        rotation={[0.2, 0, -0.2]}
      >
        <cylinderGeometry args={[0.4, 9.0, 75, 16, 1, true]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.038}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Light Cone 2 (Sky Blue Searchlight) */}
      <mesh
        ref={spot2Ref}
        position={[45, 0, -35]}
        rotation={[-0.15, 0, 0.25]}
      >
        <cylinderGeometry args={[0.5, 11.0, 85, 16, 1, true]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.055}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Light Cone 3 (Electric Violet Searchlight) */}
      <mesh
        ref={spot3Ref}
        position={[0, 0, 55]}
        rotation={[0.25, 0, 0.1]}
      >
        <cylinderGeometry args={[0.4, 10.0, 80, 16, 1, true]} />
        <meshBasicMaterial
          color="#818cf8"
          transparent
          opacity={0.045}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};
