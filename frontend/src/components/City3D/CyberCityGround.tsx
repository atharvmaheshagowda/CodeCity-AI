import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { DistrictZone, FileNode } from '../../types';

interface CyberCityGroundProps {
  districts?: DistrictZone[];
  buildings?: FileNode[];
  lowPowerMode?: boolean;
}

/**
 * Realistic Cinematic Cyber-City Ground:
 * - Deep wet asphalt pavement with puddle roughness variation and glossy specular sheen
 * - Natural urban avenue corridors framing districts with subdued lane markers
 * - Ambient contact occlusion and warm/crimson foundation ground spill beneath structures
 * - Zero dominating laser lines or arbitrary geometric rings
 */
export const CyberCityGround: React.FC<CyberCityGroundProps> = ({
  districts = [],
  buildings = [],
  lowPowerMode = false,
}) => {
  // Extract key building grounding footprints (up to 16 key nodes)
  const groundNodes = useMemo(() => {
    if (!buildings || buildings.length === 0) return [];
    // Prioritize hero/hotspot files and key buildings
    return buildings
      .slice(0, 16)
      .map((b) => ({
        x: b.x || 0,
        z: b.z || 0,
        isHero: b.filename === 'seed_db.py' || b.is_hotspot || b.risk_probability >= 0.50,
        risk: b.risk_probability || 0.1,
      }));
  }, [buildings]);

  const groundMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#02050c'),
      roughness: 0.22,
      metalness: 0.85,
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
           varying vec3 vWorldPos;

           // Fast procedural pseudo-noise for asphalt puddle roughness variation
           float hashAsphalt(vec2 p) {
             p = fract(p * vec2(123.34, 456.21));
             p += dot(p, p + 45.32);
             return fract(p.x * p.y);
           }

           float smoothNoise(vec2 uv) {
             vec2 id = floor(uv);
             vec2 f = fract(uv);
             f = f * f * (3.0 - 2.0 * f);
             float a = hashAsphalt(id);
             float b = hashAsphalt(id + vec2(1.0, 0.0));
             float c = hashAsphalt(id + vec2(0.0, 1.0));
             float d = hashAsphalt(id + vec2(1.0, 1.0));
             return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
           }`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <dithering_fragment>',
          `#include <dithering_fragment>
            // Cinematic Nocturnal Wet Asphalt Pavement
            float distFromCenter = length(vWorldPos.xz);
            float edgeFade = 1.0 - smoothstep(110.0, 230.0, distFromCenter);

            vec3 groundGlow = vec3(0.0);

            // 1. Wet-Looking Rain Slick Puddle Variation
            float puddleNoise = smoothNoise(vWorldPos.xz * 0.18);
            float isPuddle = smoothstep(0.48, 0.72, puddleNoise);

            // 2. Dynamic Building Grounding & Ambient Light Spill
            // Contact shadow / foundation glow around active structures
            float heroDist = length(vWorldPos.xz);
            float heroSpill = 1.0 - smoothstep(1.8, 8.0, heroDist);
            // Hero building warm amber lobby reflection
            groundGlow += vec3(1.0, 0.76, 0.40) * heroSpill * 0.55;
            // Menacing crimson perimeter spill
            float heroCrimson = smoothstep(2.5, 4.8, heroDist) * (1.0 - smoothstep(4.8, 7.5, heroDist));
            groundGlow += vec3(1.0, 0.16, 0.08) * heroCrimson * 0.42;

            // 3. Urban Avenue Network (Subdued, realistic asphalt road lanes)
            // Primary perimeter ring avenue framing core blocks
            vec2 boxDistOuter = abs(vWorldPos.xz) - vec2(17.5, 17.5);
            float outerAvenue = 1.0 - smoothstep(0.18, 0.55, abs(max(boxDistOuter.x, boxDistOuter.y)));

            // Inner perimeter avenue
            vec2 boxDistInner = abs(vWorldPos.xz) - vec2(5.5, 5.5);
            float innerAvenue = 1.0 - smoothstep(0.16, 0.48, abs(max(boxDistInner.x, boxDistInner.y)));

            // Cross-block connector avenues
            float crossX = (1.0 - smoothstep(0.15, 0.45, abs(vWorldPos.z))) * step(abs(vWorldPos.x), 17.8) * (1.0 - step(abs(vWorldPos.x), 5.2));
            float crossZ = (1.0 - smoothstep(0.15, 0.45, abs(vWorldPos.x))) * step(abs(vWorldPos.z), 17.8) * (1.0 - step(abs(vWorldPos.z), 5.2));

            float totalAvenues = max(max(outerAvenue, innerAvenue), max(crossX, crossZ));

            // Subdued, elegant cyan road edge markings (intensity 0.55 instead of 2.2)
            vec3 roadMarkingGlow = vec3(0.20, 0.75, 0.95) * totalAvenues * 0.55;
            groundGlow += roadMarkingGlow;

            // 4. Subtle Coordinate Ground Grid (Non-intrusive reference)
            vec2 gridCoord = abs(fract(vWorldPos.xz * 0.25 - 0.5) - 0.5) / fwidth(vWorldPos.xz * 0.25);
            float gridLine = 1.0 - min(min(gridCoord.x, gridCoord.y), 1.0);
            float gridFade = (1.0 - smoothstep(15.0, 75.0, distFromCenter)) * 0.14;
            groundGlow += vec3(0.08, 0.25, 0.40) * gridLine * gridFade;

            // Apply wet asphalt specular response
            gl_FragColor.rgb = mix(gl_FragColor.rgb * 0.35, gl_FragColor.rgb * 0.85, isPuddle);
            gl_FragColor.rgb += groundGlow * edgeFade;
            gl_FragColor.rgb *= edgeFade;`
        );
      };
    }

    return mat;
  }, [lowPowerMode]);

  return (
    <group position={[0, -0.06, 0]}>
      {/* Dark Glossy Ground Plane with Soft Puddle Reflections & Urban Avenues */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[520, 520, 4, 4]} />
        <primitive object={groundMaterial} attach="material" />
      </mesh>
    </group>
  );
};
