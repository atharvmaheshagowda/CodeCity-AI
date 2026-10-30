import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { FileNode } from '../../types';

interface SelectionMarkerProps {
  selectedFile: FileNode | null;
}

export const SelectionMarker: React.FC<SelectionMarkerProps> = ({ selectedFile }) => {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const pillarRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = elapsed * 0.8;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = -elapsed * 1.2;
    }
    if (pillarRef.current) {
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * 4.0);
      const mat = pillarRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.25 + pulse * 0.25;
    }
  });

  if (!selectedFile || selectedFile.x === undefined || selectedFile.z === undefined) {
    return null;
  }

  const posX = selectedFile.x;
  const posZ = selectedFile.z;
  const radius = Math.max(1.8, ((selectedFile.width || 1) + (selectedFile.depth || 1)) * 0.65);
  const height = selectedFile.height || 2;

  return (
    <group position={[posX, 0.09, posZ]}>
      {/* 1. Outer Ground Cyber Reticle */}
      <mesh ref={outerRingRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.95, radius * 1.15, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          toneMapped={false}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. Inner Ground Segmented Ring */}
      <mesh ref={innerRingRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.65, radius * 0.78, 6]} />
        <meshBasicMaterial
          color="#06b6d4"
          toneMapped={false}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3. Vertical Holographic Column Framing the Building */}
      <mesh ref={pillarRef} position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius * 1.05, radius * 1.05, height, 16, 1, true]} />
        <meshBasicMaterial
          color="#38bdf8"
          toneMapped={false}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          wireframe
        />
      </mesh>
    </group>
  );
};
