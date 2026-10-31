import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface VolumetricSearchlightsProps {
  lowPowerMode?: boolean;
}

/**
 * Creates soft volumetric atmospheric beam material with vertical gradient fade
 * (zero hard polygon edges, fading softly into nocturnal clouds).
 */
function createSearchlightMaterial(color: string, peakOpacity: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: peakOpacity },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vViewDir = normalize(cameraPosition - worldPos.xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        // Vertical gradient: soft ground flare, tapering smoothly to top
        float vertFade = smoothstep(0.0, 0.08, vUv.y) * pow(1.0 - vUv.y, 1.6);
        // Grazing angle soft edge falloff
        float edgeSoftness = pow(abs(dot(vNormal, vViewDir)), 0.65);
        float alpha = vertFade * edgeSoftness * uOpacity;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
}

export const VolumetricSearchlights: React.FC<VolumetricSearchlightsProps> = ({ lowPowerMode = false }) => {
  const lightGroupRef = useRef<THREE.Group>(null);
  const spot1Ref = useRef<THREE.Mesh>(null);
  const spot2Ref = useRef<THREE.Mesh>(null);
  const spot3Ref = useRef<THREE.Mesh>(null);

  const matCyan = useMemo(() => createSearchlightMaterial('#06b6d4', 0.075), []);
  const matSky = useMemo(() => createSearchlightMaterial('#38bdf8', 0.090), []);
  const matViolet = useMemo(() => createSearchlightMaterial('#818cf8', 0.065), []);

  useFrame(({ clock }) => {
    if (lowPowerMode) return;
    const t = clock.getElapsedTime();

    if (spot1Ref.current) {
      spot1Ref.current.rotation.z = Math.sin(t * 0.28) * 0.22 - 0.18;
      spot1Ref.current.rotation.x = Math.cos(t * 0.22) * 0.18;
    }
    if (spot2Ref.current) {
      spot2Ref.current.rotation.z = Math.sin(t * 0.35 + 2.0) * 0.25 + 0.12;
      spot2Ref.current.rotation.x = Math.cos(t * 0.26 + 1.5) * 0.20;
    }
    if (spot3Ref.current) {
      spot3Ref.current.rotation.z = Math.sin(t * 0.20 + 4.0) * 0.26;
      spot3Ref.current.rotation.x = Math.cos(t * 0.30 + 3.0) * 0.22;
    }
  });

  if (lowPowerMode) return null;

  return (
    <group ref={lightGroupRef} name="volumetric-atmospheric-searchlights">
      {/* Light Shaft 1 (Cyan Atmospheric Beam) */}
      <mesh ref={spot1Ref} position={[-42, 0, -52]} rotation={[0.22, 0, -0.2]}>
        <cylinderGeometry args={[0.5, 12.0, 95, 20, 1, true]} />
        <primitive object={matCyan} attach="material" />
      </mesh>

      {/* Light Shaft 2 (Sky Blue Beam) */}
      <mesh ref={spot2Ref} position={[52, 0, -42]} rotation={[-0.18, 0, 0.22]}>
        <cylinderGeometry args={[0.6, 14.0, 105, 20, 1, true]} />
        <primitive object={matSky} attach="material" />
      </mesh>

      {/* Light Shaft 3 (Muted Violet Horizon Beam) */}
      <mesh ref={spot3Ref} position={[0, 0, 65]} rotation={[0.22, 0, 0.1]}>
        <cylinderGeometry args={[0.5, 13.0, 100, 20, 1, true]} />
        <primitive object={matViolet} attach="material" />
      </mesh>
    </group>
  );
};
