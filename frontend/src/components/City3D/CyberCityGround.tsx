import React, { useMemo } from 'react';
import * as THREE from 'three';

interface CyberCityGroundProps {
  lowPowerMode?: boolean;
}

export const CyberCityGround: React.FC<CyberCityGroundProps> = ({ lowPowerMode = false }) => {
  // Deep obsidian glossy ground material with soft specular sheen and radial distance fade
  // Absolutely no random black blobs, no messy puddle cutouts, and no stray avenue dashes.
  const groundMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#01040a'),
      roughness: 0.16,
      metalness: 0.92,
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
           // Clean glossy reflective ground plane with smooth radial distance falloff
           float distFromCenter = length(vWorldPos.xz);
           float edgeFade = 1.0 - smoothstep(160.0, 320.0, distFromCenter);

           // Faint, elegant coordinate micro-grid (every 4 units, hairline width)
           vec2 gridCoord = abs(fract(vWorldPos.xz * 0.25) - 0.5);
           float gridLine = 1.0 - smoothstep(0.008, 0.024, min(gridCoord.x, gridCoord.y));
           vec3 gridGlow = vec3(0.02, 0.14, 0.28) * gridLine * 0.40;

           // Major district boundary grid (every 20 units)
           vec2 majorCoord = abs(fract(vWorldPos.xz * 0.05) - 0.5);
           float majorLine = 1.0 - smoothstep(0.004, 0.016, min(majorCoord.x, majorCoord.y));
           vec3 majorGlow = vec3(0.04, 0.28, 0.52) * majorLine * 0.65;

           gl_FragColor.rgb += (gridGlow + majorGlow) * edgeFade;
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
        <planeGeometry args={[650, 650, 4, 4]} />
        <primitive object={groundMaterial} attach="material" />
      </mesh>

      {/* 2. Soft Fading Peripheral Coordinate Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <ringGeometry args={[180, 420, 64]} />
        <meshBasicMaterial color="#010308" transparent opacity={0.96} />
      </mesh>
    </group>
  );
};
