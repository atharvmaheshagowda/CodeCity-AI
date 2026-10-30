import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AtmosphericParticlesProps {
  lowPowerMode?: boolean;
}

export const AtmosphericParticles: React.FC<AtmosphericParticlesProps> = ({ lowPowerMode = false }) => {
  const count = lowPowerMode ? 80 : 260;
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 220; // x
      pos[i * 3 + 1] = Math.random() * 38 + 1;       // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 220; // z

      vel[i * 3 + 0] = (Math.random() - 0.5) * 0.04;
      vel[i * 3 + 1] = Math.random() * 0.02 + 0.01;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.04;
    }

    return { positions: pos, velocities: vel };
  }, [count]);

  const pMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.65,
      color: new THREE.Color('#38bdf8'),
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current || lowPowerMode) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      // Drift upward and slight swirl
      posArray[idx + 1] += velocities[idx + 1] * (delta * 60);
      posArray[idx + 0] += velocities[idx + 0] * (delta * 60);
      posArray[idx + 2] += velocities[idx + 2] * (delta * 60);

      // Loop back if too high or far
      if (posArray[idx + 1] > 40) {
        posArray[idx + 1] = 1;
        posArray[idx + 0] = (Math.random() - 0.5) * 200;
        posArray[idx + 2] = (Math.random() - 0.5) * 200;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <primitive object={pMaterial} attach="material" />
    </points>
  );
};

