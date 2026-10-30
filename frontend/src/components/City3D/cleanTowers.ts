import * as THREE from 'three';
import * as BGU from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { FileNode } from '../../types';

export type TowerStyle =
  | 'monolith_tower'
  | 'setback_highrise'
  | 'cantilever_tower'
  | 'twin_column_tower'
  | 'landmark_monument';

export const TOWER_STYLE_NAMES: Record<TowerStyle, string> = {
  monolith_tower: 'Monolithic Glass Tower',
  setback_highrise: 'Stepped Setback High-Rise',
  cantilever_tower: 'Cantilevered Modernist Tower',
  twin_column_tower: 'Twin-Column Composite Tower',
  landmark_monument: 'Landmark Monumental Tower',
};

export const ALL_TOWER_STYLES: TowerStyle[] = [
  'monolith_tower',
  'setback_highrise',
  'cantilever_tower',
  'twin_column_tower',
  'landmark_monument',
];

/**
 * Deterministically assign a clean architectural tower style based strictly on file metrics.
 * No weird barrels, no spires, no random ornaments.
 */
export function getTowerStyle(file: FileNode, index: number): TowerStyle {
  // Top-impact files or hotspots get the Landmark Monumental Tower
  if (
    file.is_hotspot ||
    (file.risk_rank !== undefined && file.risk_rank <= 3) ||
    (file.risk_probability >= 0.65 && file.impact_score >= 1.4)
  ) {
    return 'landmark_monument';
  }

  // Large composite modules (LOC > 350) -> Twin-Column Tower
  if (file.loc > 350) {
    return 'twin_column_tower';
  }

  // High cyclomatic complexity (> 10) -> Stepped Setback High-Rise
  if (file.max_complexity >= 10) {
    return 'setback_highrise';
  }

  // Moderate complexity or security/core modules -> Cantilevered Modernist Tower
  const path = (file.path || '').toLowerCase();
  if (
    file.max_complexity >= 6 ||
    path.includes('auth') ||
    path.includes('core') ||
    path.includes('engine') ||
    path.includes('model')
  ) {
    return 'cantilever_tower';
  }

  // Standard clean rectangular tower
  return 'monolith_tower';
}

/**
 * Procedural Clean Architectural Tower Geometries.
 * Builds sharp-beveled rectangular prisms with stepped setbacks, flat roofs, and subtle emissive rims.
 * Normalized to [0..1] in Y and [-0.5..0.5] in X/Z.
 */
export function createCleanTowerGeometries(): Record<TowerStyle, THREE.BufferGeometry> {
  const prep = (geo: THREE.BufferGeometry) => {
    geo.computeVertexNormals();
    return geo;
  };

  // 1. Monolithic Glass Tower: Sharp rectangular tower with recessed base plinth and flat roof deck
  const monolithTowerGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Sturdy plinth base: y=0 to 0.08
    const base = prep(new THREE.BoxGeometry(1.02, 0.08, 1.02));
    base.translate(0, 0.04, 0);
    parts.push(base);

    // Main rectangular tower shaft: y=0.08 to 0.94
    const shaft = prep(new THREE.BoxGeometry(0.96, 0.86, 0.96));
    shaft.translate(0, 0.51, 0);
    parts.push(shaft);

    // Flat roof parapet rim: y=0.94 to 1.0
    const roofRim = prep(new THREE.BoxGeometry(0.98, 0.06, 0.98));
    roofRim.translate(0, 0.97, 0);
    parts.push(roofRim);

    // Recessed roof center: y=0.98 to 1.01
    const roofDeck = prep(new THREE.BoxGeometry(0.82, 0.04, 0.82));
    roofDeck.translate(0, 0.99, 0);
    parts.push(roofDeck);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 2. Stepped Setback High-Rise: Clean 3-tier setbacks (Podium -> Mid-Shaft -> Penthouse), flat roofs
  const setbackHighriseGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Tier 1 Base Podium: y=0 to 0.28
    const t1 = prep(new THREE.BoxGeometry(1.0, 0.28, 1.0));
    t1.translate(0, 0.14, 0);
    parts.push(t1);

    // Tier 2 Mid-Tower Shaft: y=0.28 to 0.72 (setback to 0.78 x 0.78)
    const t2 = prep(new THREE.BoxGeometry(0.78, 0.44, 0.78));
    t2.translate(0, 0.50, 0);
    parts.push(t2);

    // Tier 3 Penthouse: y=0.72 to 0.96 (setback to 0.56 x 0.56)
    const t3 = prep(new THREE.BoxGeometry(0.56, 0.24, 0.56));
    t3.translate(0, 0.84, 0);
    parts.push(t3);

    // Flat roof penthouse bulkhead: y=0.96 to 1.02
    const bulkhead = prep(new THREE.BoxGeometry(0.38, 0.06, 0.38));
    bulkhead.translate(0, 0.99, 0);
    parts.push(bulkhead);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 3. Cantilevered Modernist Tower: Sturdy base -> projected cantilever mid-section -> flat roof
  const cantileverTowerGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Sturdy base core: y=0 to 0.24
    const base = prep(new THREE.BoxGeometry(0.82, 0.24, 0.82));
    base.translate(0, 0.12, 0);
    parts.push(base);

    // Cantilevered middle glass volume (wider than base): y=0.24 to 0.78 (1.04 x 1.04)
    const mid = prep(new THREE.BoxGeometry(1.04, 0.54, 1.04));
    mid.translate(0, 0.51, 0);
    parts.push(mid);

    // Upper setback tier: y=0.78 to 0.96 (0.86 x 0.86)
    const top = prep(new THREE.BoxGeometry(0.86, 0.18, 0.86));
    top.translate(0, 0.87, 0);
    parts.push(top);

    // Flat roof parapet: y=0.96 to 1.0
    const roof = prep(new THREE.BoxGeometry(0.88, 0.04, 0.88));
    roof.translate(0, 0.98, 0);
    parts.push(roof);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 4. Twin-Column Composite Tower: Dual rectangular towers joined by central glass atrium
  const twinColumnTowerGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Common foundation atrium: y=0 to 0.16
    const foundation = prep(new THREE.BoxGeometry(1.0, 0.16, 0.92));
    foundation.translate(0, 0.08, 0);
    parts.push(foundation);

    // West Tower Column: y=0.16 to 1.0 (0.40 x 0.84)
    const westCol = prep(new THREE.BoxGeometry(0.40, 0.84, 0.84));
    westCol.translate(-0.28, 0.58, 0);
    parts.push(westCol);

    // East Tower Column: y=0.16 to 0.92 (0.40 x 0.84)
    const eastCol = prep(new THREE.BoxGeometry(0.40, 0.76, 0.84));
    eastCol.translate(0.28, 0.54, 0);
    parts.push(eastCol);

    // Enclosed mid skybridge connector at y=0.55
    const bridge = prep(new THREE.BoxGeometry(0.24, 0.10, 0.36));
    bridge.translate(0, 0.55, 0);
    parts.push(bridge);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 5. Landmark Monumental Tower: Flagship stepped skyscraper with clean rectangular setbacks & flat roof
  const landmarkMonumentGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Grand Podium Base: y=0 to 0.22 (1.06 x 1.06)
    const base = prep(new THREE.BoxGeometry(1.06, 0.22, 1.06));
    base.translate(0, 0.11, 0);
    parts.push(base);

    // Primary Tower Shaft: y=0.22 to 0.68 (0.86 x 0.86)
    const shaft = prep(new THREE.BoxGeometry(0.86, 0.46, 0.86));
    shaft.translate(0, 0.45, 0);
    parts.push(shaft);

    // Upper Setback: y=0.68 to 0.92 (0.64 x 0.64)
    const upper = prep(new THREE.BoxGeometry(0.64, 0.24, 0.64));
    upper.translate(0, 0.80, 0);
    parts.push(upper);

    // Crown Penthouse Deck: y=0.92 to 1.04 (0.46 x 0.46)
    const crown = prep(new THREE.BoxGeometry(0.46, 0.12, 0.46));
    crown.translate(0, 0.98, 0);
    parts.push(crown);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  return {
    monolith_tower: monolithTowerGeo,
    setback_highrise: setbackHighriseGeo,
    cantilever_tower: cantileverTowerGeo,
    twin_column_tower: twinColumnTowerGeo,
    landmark_monument: landmarkMonumentGeo,
  };
}

/**
 * Creates the clean architectural procedural facade shader.
 * - Sharp, aligned rectangular window matrix.
 * - Stable pseudo-random window activation per file path.
 * - Warm-white interior lights & cool-cyan terminal lighting.
 * - Dark tinted glass spandrels and mullions.
 * - Slow crimson pulse and occasional flicker on high-risk buildings.
 * - Fresnel edge rim light & soft vertical luminance gradient.
 * - Dark metallic roof decks with glowing perimeter trim.
 */
export function createCleanFacadeMaterial(): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({
    roughness: 0.25,
    metalness: 0.82,
    emissive: new THREE.Color('#000000'),
    emissiveIntensity: 1.0,
  });

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.uniforms.uPulseIntensity = { value: 1.0 };
    mat.userData.shader = shader;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
       varying vec3 vWorldPos;
       varying vec3 vModelNormal;
       varying vec3 vObjectPos;
       varying vec3 vViewDir;`
    );

    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      `#include <worldpos_vertex>
       vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
       vModelNormal = normal;
       vObjectPos = position;
       vViewDir = normalize(cameraPosition - vWorldPos);`
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
       uniform float uTime;
       uniform float uPulseIntensity;
       varying vec3 vWorldPos;
       varying vec3 vModelNormal;
       varying vec3 vObjectPos;
       varying vec3 vViewDir;

       float hashWindow(vec2 p) {
         p = fract(p * vec2(234.34, 435.345));
         p += dot(p, p + 34.23);
         return fract(p.x * p.y);
       }`
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `#include <dithering_fragment>
       // Clean Architectural Tower Facade Shader

       // 1. Facade Vertical Walls (abs(normal.y) < 0.40)
       if (abs(vModelNormal.y) < 0.40) {
         // Project along planar wall coordinates
         vec2 wallCoord = abs(vModelNormal.x) > 0.40 ? vWorldPos.zy : vWorldPos.xy;

         // Clean architectural grid: 4.0 window bays per unit, 3.0 floors per unit
         vec2 gridPos = wallCoord * vec2(4.0, 3.0);
         vec2 cell = floor(gridPos);
         vec2 uvInCell = fract(gridPos);

         // Crisp rectangular window aperture with dark structural spandrels and mullions
         // Horizontal spandrel: [0.16, 0.84]
         // Vertical mullion: [0.16, 0.84]
         float isWindow = step(0.16, uvInCell.x) * step(uvInCell.x, 0.84) *
                          step(0.18, uvInCell.y) * step(uvInCell.y, 0.82);

         // Standby dimming detection during blast radius
         float instanceLuma = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
         float isDimmed = step(instanceLuma, 0.12);
         float dimFactor = mix(1.0, 0.18, isDimmed);

         // Detect high-risk file from instance color (red component dominant)
         float isHighRisk = step(0.60, gl_FragColor.r) * step(gl_FragColor.g, 0.45);
         float crimsonPulse = 0.80 + 0.35 * sin(uTime * 2.2);

         if (isWindow > 0.5) {
           float h = hashWindow(cell);
           float flicker = 1.0;
           // Subtle flicker on ~4% of lit windows
           if (h > 0.90) {
             flicker = 0.82 + 0.18 * sin(uTime * 5.0 + h * 6.28);
           }

           vec3 winColor = vec3(0.015, 0.025, 0.045); // Unlit dark glass
           if (h > 0.64) {
             // Warm-white incandescent interior light
             winColor = vec3(1.0, 0.94, 0.80) * 1.30;
           } else if (h > 0.36) {
             // Cool-cyan terminal light
             winColor = vec3(0.20, 0.85, 1.0) * 1.40;
           }

           // If high risk, tint windows with a subtle crimson pulse
           if (isHighRisk > 0.5 && h > 0.36) {
             winColor = mix(winColor, vec3(1.0, 0.15, 0.30) * 1.6, 0.45 * crimsonPulse);
           }

           gl_FragColor.rgb = mix(gl_FragColor.rgb * 0.25, winColor * flicker * dimFactor, 0.86);
         } else {
           // Dark metallic spandrel / mullion framing
           gl_FragColor.rgb *= 0.30;
         }

         // Soft vertical gradient (darker at ground, brighter toward crown)
         float vertGrad = mix(0.72, 1.08, clamp(vObjectPos.y, 0.0, 1.0));
         gl_FragColor.rgb *= vertGrad;

         // Fresnel rim lighting for instant silhouette readability
         float fresnel = pow(1.0 - max(0.0, dot(vModelNormal, vViewDir)), 2.8);
         gl_FragColor.rgb += vec3(0.02, 0.12, 0.24) * fresnel * dimFactor;
       }
       // 2. Rooftop Surfaces (abs(normal.y) >= 0.40)
       else if (vModelNormal.y > 0.40) {
         // Dark matte metallic roof deck
         gl_FragColor.rgb *= 0.32;

         // Subtle glowing perimeter parapet trim
         vec2 roofPos = fract(vWorldPos.xz * 0.40);
         float borderDist = min(min(roofPos.x, 1.0 - roofPos.x), min(roofPos.y, 1.0 - roofPos.y));
         if (borderDist < 0.06) {
           gl_FragColor.rgb += vec3(0.05, 0.30, 0.50);
         }
       }`
    );
  };

  return mat;
}

