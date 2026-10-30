import React, { useMemo } from 'react';
import * as THREE from 'three';

interface CyberCityGroundProps {
  lowPowerMode?: boolean;
}

/**
 * Realistic Cyber-City Ground matching reference image:
 * - Deep wet asphalt pavement with glossy specular reflections
 * - Defined illuminated cyan avenue lane lines and road curbs framing the city blocks
 * - Warm golden interior spill pools and red lobby reflections under buildings
 * - Zero infinite Tron grid lines across the world
 */
export const CyberCityGround: React.FC<CyberCityGroundProps> = ({ lowPowerMode = false }) => {
  const groundMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#020611'),
      roughness: 0.18,
      metalness: 0.88,
    });

    if (!lowPowerMode) {
      mat.onBeforeCompile = (shader) => {
        mat.userData.shader = shader;

        shader.vertexShader = shader.vertexShader.replace(
          '#include <common>',
          `#include <common>
           varying vec3 vWorldPos;`
        );

        shader.vertexShader = shader.vertexShader.replace(
          '#include <worldpos_vertex>',
          `#include <worldpos_vertex>
           vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <common>',
          `#include <common>
           varying vec3 vWorldPos;`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <dithering_fragment>',
          `#include <dithering_fragment>
            // Wet asphalt city pavement with illuminated avenue markings and ground reflections
            float distFromCenter = length(vWorldPos.xz);
            float edgeFade = 1.0 - smoothstep(120.0, 240.0, distFromCenter);

            vec3 groundGlow = vec3(0.0);

            // 1. Central Hero Skyscraper (seed_db.py) ground lobby spill: warm golden + red reflection
            float distHero = length(vWorldPos.xz);
            float heroSpill = 1.0 - smoothstep(2.5, 9.5, distHero);
            groundGlow += vec3(1.0, 0.72, 0.35) * heroSpill * 0.95;
            float heroRedRim = smoothstep(3.2, 5.8, distHero) * (1.0 - smoothstep(5.8, 8.5, distHero));
            groundGlow += vec3(1.0, 0.15, 0.10) * heroRedRim * 0.70;

            // 2. Surrounding buildings warm light pools on asphalt
            vec2 pModels = vWorldPos.xz - vec2(-8.8, -8.5);
            vec2 pSchemas = vWorldPos.xz - vec2(-9.2, 8.2);
            vec2 pTest = vWorldPos.xz - vec2(8.8, 8.5);
            vec2 pConfig = vWorldPos.xz - vec2(10.8, -1.0);
            vec2 pUtils = vWorldPos.xz - vec2(-12.8, 0.5);

            float bSpill = (1.0 - smoothstep(1.5, 7.5, length(pModels))) * 0.65
                         + (1.0 - smoothstep(1.5, 7.5, length(pSchemas))) * 0.65
                         + (1.0 - smoothstep(1.5, 7.5, length(pTest))) * 0.65
                         + (1.0 - smoothstep(1.5, 6.5, length(pConfig))) * 0.55
                         + (1.0 - smoothstep(1.5, 6.0, length(pUtils))) * 0.50;
            groundGlow += vec3(1.0, 0.80, 0.45) * bSpill;

            // 3. Cyber Avenue Network: Glowing cyan road lane lines framing the city blocks
            // Primary outer perimeter avenue: box from [-18, 18] in X and Z
            vec2 boxDistOuter = abs(vWorldPos.xz) - vec2(18.0, 18.0);
            float outerAvenue = 1.0 - smoothstep(0.12, 0.45, abs(max(boxDistOuter.x, boxDistOuter.y)));
            float outerAvenueCurb = 1.0 - smoothstep(0.08, 0.35, abs(max(boxDistOuter.x, boxDistOuter.y) + 1.2));

            // Inner hero perimeter avenue: box from [-5.2, 5.2] in X and Z
            vec2 boxDistInner = abs(vWorldPos.xz) - vec2(5.2, 5.2);
            float innerAvenue = 1.0 - smoothstep(0.10, 0.38, abs(max(boxDistInner.x, boxDistInner.y)));

            // Cross-block connector avenues
            float crossX = (1.0 - smoothstep(0.10, 0.38, abs(vWorldPos.z))) * step(abs(vWorldPos.x), 18.2) * (1.0 - step(abs(vWorldPos.x), 5.0));
            float crossZ = (1.0 - smoothstep(0.10, 0.38, abs(vWorldPos.x))) * step(abs(vWorldPos.z), 18.2) * (1.0 - step(abs(vWorldPos.z), 5.0));

            // Diagonal arterial avenues linking to surrounding districts
            float diag1 = (1.0 - smoothstep(0.12, 0.40, abs(vWorldPos.x - vWorldPos.z))) * step(14.0, abs(vWorldPos.x)) * step(abs(vWorldPos.x), 36.0);
            float diag2 = (1.0 - smoothstep(0.12, 0.40, abs(vWorldPos.x + vWorldPos.z))) * step(14.0, abs(vWorldPos.x)) * step(abs(vWorldPos.x), 36.0);

            float totalAvenues = max(max(outerAvenue, outerAvenueCurb * 0.7), max(innerAvenue, max(crossX, crossZ)));
            totalAvenues = max(totalAvenues, max(diag1, diag2) * 0.85);

            vec3 cyanRoadGlow = vec3(0.15, 0.75, 1.0) * totalAvenues * 2.2;
            groundGlow += cyanRoadGlow;

            // Wet asphalt specular sheen
            gl_FragColor.rgb += groundGlow * edgeFade;
            gl_FragColor.rgb *= edgeFade;`
        );
      };
    }

    return mat;
  }, [lowPowerMode]);

  return (
    <group position={[0, -0.06, 0]}>
      {/* 1. Dark Glossy Ground Plane with soft specular reflections */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[520, 520, 4, 4]} />
        <primitive object={groundMaterial} attach="material" />
      </mesh>

      {/* 2. Soft Fading Peripheral Coordinate Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <ringGeometry args={[140, 360, 64]} />
        <meshBasicMaterial color="#010308" transparent opacity={0.98} />
      </mesh>
    </group>
  );
};
