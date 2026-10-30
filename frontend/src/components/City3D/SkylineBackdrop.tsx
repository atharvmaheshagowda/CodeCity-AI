import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';

interface SkylineBackdropProps {
  lowPowerMode?: boolean;
}

export const SkylineBackdrop: React.FC<SkylineBackdropProps> = ({ lowPowerMode = false }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const beaconsRef = useRef<THREE.InstancedMesh>(null);
  const count = lowPowerMode ? 48 : 88;

  const { dummy, towers } = useMemo(() => {
    const list: Array<{ x: number; z: number; w: number; h: number; d: number; col: THREE.Color }> = [];
    const rnd = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const rings = [
      { radius: 68, count: Math.floor(count * 0.35), minH: 30, maxH: 55 },
      { radius: 98, count: Math.floor(count * 0.40), minH: 45, maxH: 85 },
      { radius: 135, count: Math.floor(count * 0.25), minH: 60, maxH: 115 },
    ];

    let seed = 137;
    for (const ring of rings) {
      for (let i = 0; i < ring.count; i++) {
        const angle = (i / ring.count) * Math.PI * 2 + rnd(seed++) * 0.18;
        const rad = ring.radius + (rnd(seed++) - 0.5) * 14;
        const x = Math.cos(angle) * rad;
        const z = Math.sin(angle) * rad;
        const w = 4.5 + rnd(seed++) * 6.5;
        const d = 4.5 + rnd(seed++) * 6.5;
        const h = ring.minH + rnd(seed++) * (ring.maxH - ring.minH);

        const col = new THREE.Color(
          0.02 + rnd(seed++) * 0.02,
          0.04 + rnd(seed++) * 0.03,
          0.07 + rnd(seed++) * 0.05
        );
        list.push({ x, z, w, h, d, col });
      }
    }

    return { dummy: new THREE.Object3D(), towers: list };
  }, [count]);

  // Facade material for distant towers with subtle illuminated window slits
  const skylineMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      roughness: 0.65,
      metalness: 0.65,
      color: '#060c18',
    });

    mat.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `#include <common>
         varying vec3 vWorldPos;
         varying vec3 vModelNormal;`
      );
      shader.vertexShader = shader.vertexShader.replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
         vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
         vModelNormal = normal;`
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `#include <common>
         varying vec3 vWorldPos;
         varying vec3 vModelNormal;

         float hashDistant(vec2 p) {
           return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
         }`
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `#include <dithering_fragment>
         // Subtle horizontal illuminated window slit bands on distant skyscrapers
         if (abs(vModelNormal.y) < 0.45) {
           float floorLevel = floor(vWorldPos.y * 0.65);
           float floorFrac = fract(vWorldPos.y * 0.65);
           float isWindowBand = step(0.35, floorFrac) * step(floorFrac, 0.65);

           if (isWindowBand > 0.5) {
             float h = hashDistant(vec2(floorLevel, floor(vWorldPos.x * 0.2)));
             if (h > 0.65) {
               vec3 slitCol = (h > 0.85) ? vec3(0.18, 0.65, 0.95) : vec3(0.95, 0.75, 0.45);
               gl_FragColor.rgb += slitCol * 0.55;
             }
           }
         }`
      );
    };

    return mat;
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    const beaconCol = new THREE.Color('#38bdf8');
    const redCol = new THREE.Color('#f43f5e');

    for (let i = 0; i < towers.length; i++) {
      const t = towers[i];
      dummy.position.set(t.x, t.h / 2, t.z);
      dummy.scale.set(t.w, t.h, t.d);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, t.col);

      if (beaconsRef.current) {
        dummy.position.set(t.x, t.h + 0.6, t.z);
        dummy.scale.set(0.65, 0.65, 0.65);
        dummy.updateMatrix();
        beaconsRef.current.setMatrixAt(i, dummy.matrix);
        beaconsRef.current.setColorAt(i, i % 3 === 0 ? redCol : beaconCol);
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
    if (beaconsRef.current) {
      beaconsRef.current.instanceMatrix.needsUpdate = true;
      if (beaconsRef.current.instanceColor) {
        beaconsRef.current.instanceColor.needsUpdate = true;
      }
    }
  }, [towers, dummy]);

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, towers.length]}
        material={skylineMaterial}
        frustumCulled
      >
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>

      {/* Pulsing Rooftop Beacons */}
      <instancedMesh
        ref={beaconsRef}
        args={[undefined, undefined, towers.length]}
      >
        <sphereGeometry args={[0.5, 6, 6]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
};
