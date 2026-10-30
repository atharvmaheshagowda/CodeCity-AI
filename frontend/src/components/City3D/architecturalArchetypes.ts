import * as THREE from 'three';
import * as BGU from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { FileNode } from '../../types';

export type BuildingArchetype =
  | 'glass_skyscraper'
  | 'corporate_tower'
  | 'stepped_industrial'
  | 'brutalist_tech'
  | 'research_facility'
  | 'compact_residential'
  | 'datacenter'
  | 'multisection_complex'
  | 'telecom_spire'
  | 'monumental_landmark';

export const ARCHETYPE_NAMES: Record<BuildingArchetype, string> = {
  glass_skyscraper: 'Futuristic Glass Skyscraper',
  corporate_tower: 'High-Rise Corporate Tower',
  stepped_industrial: 'Stepped Industrial Tech Hub',
  brutalist_tech: 'Brutalist Technology Structure',
  research_facility: 'Modular Research Facility',
  compact_residential: 'High-Density Residential Block',
  datacenter: 'Fortified Data Center Monolith',
  multisection_complex: 'Twin-Tower Multi-Section Complex',
  telecom_spire: 'Lattice Communications Mast',
  monumental_landmark: 'Monumental Critical Landmark',
};

export const ALL_ARCHETYPES: BuildingArchetype[] = [
  'glass_skyscraper',
  'corporate_tower',
  'stepped_industrial',
  'brutalist_tech',
  'research_facility',
  'compact_residential',
  'datacenter',
  'multisection_complex',
  'telecom_spire',
  'monumental_landmark',
];

/**
 * Deterministically select an architectural archetype for a file node based on
 * file metadata, risk metrics, path, and filename.
 */
export function getBuildingArchetype(file: FileNode, index: number): BuildingArchetype {
  // 1. Critical hot-spots or high-risk high-impact files get the Monumental Landmark
  if (
    file.is_hotspot ||
    (file.risk_rank !== undefined && file.risk_rank <= 3) ||
    (file.risk_probability >= 0.65 && file.impact_score >= 1.45)
  ) {
    return 'monumental_landmark';
  }

  const pathLower = (file.path || '').toLowerCase();
  const filenameLower = (file.filename || '').toLowerCase();

  // 2. Telemetry, networking, routing, client, API files -> Telecom Spire
  if (
    pathLower.includes('api') ||
    pathLower.includes('client') ||
    pathLower.includes('route') ||
    pathLower.includes('net') ||
    pathLower.includes('socket') ||
    filenameLower.startsWith('cli')
  ) {
    return 'telecom_spire';
  }

  // 3. Database, storage, schema, models, cache, config -> Fortified Data Center
  if (
    pathLower.includes('model') ||
    pathLower.includes('db') ||
    pathLower.includes('schema') ||
    pathLower.includes('store') ||
    pathLower.includes('sql') ||
    pathLower.includes('config') ||
    pathLower.includes('cache')
  ) {
    return 'datacenter';
  }

  // 4. Heavy complexity files (> 12 cyclomatic complexity) -> Glass Skyscraper or Corporate Tower
  if (file.max_complexity >= 12) {
    return index % 2 === 0 ? 'glass_skyscraper' : 'corporate_tower';
  }

  // 5. Tests, specs, mocks, fixtures -> Stepped Industrial Hub
  if (
    pathLower.includes('test') ||
    pathLower.includes('mock') ||
    pathLower.includes('fixture') ||
    pathLower.includes('spec')
  ) {
    return 'stepped_industrial';
  }

  // 6. Security, auth, permissions, crypto -> Brutalist Technology Structure
  if (
    pathLower.includes('auth') ||
    pathLower.includes('sec') ||
    pathLower.includes('crypt') ||
    pathLower.includes('token')
  ) {
    return 'brutalist_tech';
  }

  // 7. Core algorithms, engine, compute, graph, ML -> Modular Research Facility
  if (
    pathLower.includes('graph') ||
    pathLower.includes('engine') ||
    pathLower.includes('core') ||
    pathLower.includes('ml') ||
    pathLower.includes('algo')
  ) {
    return 'research_facility';
  }

  // 8. Large multi-component modules (LOC > 350) -> Multi-Section Complex
  if (file.loc > 350) {
    return 'multisection_complex';
  }

  // 9. Small utilities, helpers, tools (LOC < 80) -> Compact Residential Block
  if (file.loc < 80) {
    return 'compact_residential';
  }

  // 10. Deterministic string hash distribution for the remainder
  let hash = 0;
  for (let i = 0; i < pathLower.length; i++) {
    hash = (hash * 31 + pathLower.charCodeAt(i)) & 0xffffffff;
  }
  const archetypesWithoutLandmark: BuildingArchetype[] = [
    'glass_skyscraper',
    'corporate_tower',
    'stepped_industrial',
    'brutalist_tech',
    'research_facility',
    'compact_residential',
    'datacenter',
    'multisection_complex',
    'telecom_spire',
  ];
  return archetypesWithoutLandmark[Math.abs(hash) % archetypesWithoutLandmark.length];
}

/**
 * Procedural Compound Geometry Factory.
 * Builds rich, normalized [0..1] unit geometries with clean architectural details,
 * stepped setbacks, roof machinery, antennas, and cantilevers.
 * Absolutely NO tapered barrels, NO rings, and NO random spires.
 */
export function createArchetypeGeometries(): Record<BuildingArchetype, THREE.BufferGeometry> {
  const prep = (geo: THREE.BufferGeometry) => {
    geo.computeVertexNormals();
    return geo;
  };

  // 1. Futuristic Glass Skyscraper: Sharp rectangular tower with recessed base plinth, vertical corner columns, and flat roof deck
  const glassSkyscraperGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Base podium plinth: y=0 to 0.10 (1.02 x 1.02)
    const base = prep(new THREE.BoxGeometry(1.02, 0.10, 1.02));
    base.translate(0, 0.05, 0);
    parts.push(base);

    // 4 Corner structural pillars
    const pW = 0.08;
    const colCoords = [
      [-0.45, -0.45],
      [0.45, -0.45],
      [-0.45, 0.45],
      [0.45, 0.45],
    ];
    for (const [cx, cz] of colCoords) {
      const col = prep(new THREE.BoxGeometry(pW, 0.86, pW));
      col.translate(cx, 0.53, cz);
      parts.push(col);
    }

    // Main rectangular glass tower shaft: y=0.10 to 0.92 (0.92 x 0.92)
    const shaft = prep(new THREE.BoxGeometry(0.92, 0.82, 0.92));
    shaft.translate(0, 0.51, 0);
    parts.push(shaft);

    // Flat roof penthouse & parapet trim: y=0.92 to 1.0
    const roof = prep(new THREE.BoxGeometry(0.96, 0.08, 0.96));
    roof.translate(0, 0.96, 0);
    parts.push(roof);

    // Recessed elevator mechanical housing: y=1.0 to 1.05
    const mech = prep(new THREE.BoxGeometry(0.50, 0.06, 0.50));
    mech.translate(0, 1.01, 0);
    parts.push(mech);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 2. High-Rise Corporate Tower: 3-tier stepped setbacks + rooftop HVAC chiller units
  const corporateTowerGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Tier 1 Base Podium: y=0 to 0.24 (1.0 x 1.0)
    const t1 = prep(new THREE.BoxGeometry(1.0, 0.24, 1.0));
    t1.translate(0, 0.12, 0);
    parts.push(t1);

    // Tier 2 Mid-Tower Shaft: y=0.24 to 0.70 (0.80 x 0.80)
    const t2 = prep(new THREE.BoxGeometry(0.80, 0.46, 0.80));
    t2.translate(0, 0.47, 0);
    parts.push(t2);

    // Tier 3 Penthouse Setback: y=0.70 to 0.96 (0.60 x 0.60)
    const t3 = prep(new THREE.BoxGeometry(0.60, 0.26, 0.60));
    t3.translate(0, 0.83, 0);
    parts.push(t3);

    // Rooftop Machinery Bulkhead: y=0.96 to 1.02
    const bulkhead = prep(new THREE.BoxGeometry(0.38, 0.06, 0.38));
    bulkhead.translate(0, 0.99, 0);
    parts.push(bulkhead);

    // Dual HVAC Chiller boxes on mid-terrace
    const hvac1 = prep(new THREE.BoxGeometry(0.12, 0.06, 0.14));
    hvac1.translate(0.36, 0.27, -0.36);
    parts.push(hvac1);
    const hvac2 = prep(new THREE.BoxGeometry(0.12, 0.06, 0.14));
    hvac2.translate(-0.36, 0.27, 0.36);
    parts.push(hvac2);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 3. Stepped Industrial Tech Hub: Ziggurat massing, ventilation housings & cooling units
  const steppedIndustrialGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Heavy Plinth Base: y=0 to 0.28 (1.04 x 1.04)
    const base = prep(new THREE.BoxGeometry(1.04, 0.28, 1.04));
    base.translate(0, 0.14, 0);
    parts.push(base);

    // Terrace 1: y=0.28 to 0.58 (0.84 x 0.84)
    const terr1 = prep(new THREE.BoxGeometry(0.84, 0.30, 0.84));
    terr1.translate(0, 0.43, 0);
    parts.push(terr1);

    // Terrace 2: y=0.58 to 0.86 (0.62 x 0.62)
    const terr2 = prep(new THREE.BoxGeometry(0.62, 0.28, 0.62));
    terr2.translate(0, 0.72, 0);
    parts.push(terr2);

    // Industrial Roof Deck: y=0.86 to 0.98 (0.44 x 0.44)
    const deck = prep(new THREE.BoxGeometry(0.44, 0.12, 0.44));
    deck.translate(0, 0.92, 0);
    parts.push(deck);

    // Cooling Towers (twin rectangular chiller enclosures)
    const ch1 = prep(new THREE.BoxGeometry(0.14, 0.10, 0.14));
    ch1.translate(0.32, 0.33, 0.32);
    parts.push(ch1);
    const ch2 = prep(new THREE.BoxGeometry(0.14, 0.10, 0.14));
    ch2.translate(-0.32, 0.33, -0.32);
    parts.push(ch2);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 4. Brutalist Technology Structure: Heavy pilasters, cantilevered overhangs, and recessed window slits
  const brutalistTechGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Recessed Ground Floor Core: y=0 to 0.18 (0.80 x 0.80)
    const core = prep(new THREE.BoxGeometry(0.80, 0.18, 0.80));
    core.translate(0, 0.09, 0);
    parts.push(core);

    // 4 Corner Pilaster Pylons: y=0 to 0.95
    const pW = 0.14;
    const corners = [
      [-0.44, -0.44],
      [0.44, -0.44],
      [-0.44, 0.44],
      [0.44, 0.44],
    ];
    for (const [cx, cz] of corners) {
      const p = prep(new THREE.BoxGeometry(pW, 0.95, pW));
      p.translate(cx, 0.475, cz);
      parts.push(p);
    }

    // Cantilevered Mid-Section: y=0.18 to 0.76 (1.02 x 1.02)
    const mid = prep(new THREE.BoxGeometry(1.02, 0.58, 1.02));
    mid.translate(0, 0.47, 0);
    parts.push(mid);

    // Upper Brutalist Setback Deck: y=0.76 to 0.96 (0.86 x 0.86)
    const upper = prep(new THREE.BoxGeometry(0.86, 0.20, 0.86));
    upper.translate(0, 0.86, 0);
    parts.push(upper);

    // Parapet roof trim: y=0.96 to 1.0
    const trim = prep(new THREE.BoxGeometry(0.88, 0.04, 0.88));
    trim.translate(0, 0.98, 0);
    parts.push(trim);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 5. Modular Research Facility: Central tower flanked by twin laboratory pods with skyway tubes
  const researchFacilityGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Foundation Base: y=0 to 0.16 (1.0 x 0.92)
    const found = prep(new THREE.BoxGeometry(1.0, 0.16, 0.92));
    found.translate(0, 0.08, 0);
    parts.push(found);

    // Central Core Tower: y=0.16 to 0.95 (0.50 x 0.50)
    const central = prep(new THREE.BoxGeometry(0.50, 0.79, 0.50));
    central.translate(0, 0.555, 0);
    parts.push(central);

    // West Laboratory Pod: y=0.16 to 0.72 (0.34 x 0.68)
    const westPod = prep(new THREE.BoxGeometry(0.34, 0.56, 0.68));
    westPod.translate(-0.35, 0.44, 0);
    parts.push(westPod);

    // East Laboratory Pod: y=0.16 to 0.72 (0.34 x 0.68)
    const eastPod = prep(new THREE.BoxGeometry(0.34, 0.56, 0.68));
    eastPod.translate(0.35, 0.44, 0);
    parts.push(eastPod);

    // Rooftop Observation Dome Bulkhead
    const dome = prep(new THREE.BoxGeometry(0.32, 0.08, 0.32));
    dome.translate(0, 0.98, 0);
    parts.push(dome);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 6. High-Density Residential Block: Offset stacked rectangular modules with exterior balconies
  const compactResidentialGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Sturdy Plinth: y=0 to 0.20 (0.96 x 0.96)
    const plinth = prep(new THREE.BoxGeometry(0.96, 0.20, 0.96));
    plinth.translate(0, 0.10, 0);
    parts.push(plinth);

    // Main Residential Block: y=0.20 to 0.88 (0.90 x 0.90)
    const block = prep(new THREE.BoxGeometry(0.90, 0.68, 0.90));
    block.translate(0, 0.54, 0);
    parts.push(block);

    // Service Balcony Ledges (West & East)
    const bal1 = prep(new THREE.BoxGeometry(0.06, 0.03, 0.74));
    bal1.translate(0.46, 0.44, 0);
    parts.push(bal1);
    const bal2 = prep(new THREE.BoxGeometry(0.06, 0.03, 0.74));
    bal2.translate(-0.46, 0.64, 0);
    parts.push(bal2);

    // Flat roof penthouse: y=0.88 to 0.98 (0.64 x 0.64)
    const roof = prep(new THREE.BoxGeometry(0.64, 0.10, 0.64));
    roof.translate(0, 0.93, 0);
    parts.push(roof);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 7. Fortified Data Center Monolith: Heavy server vault with vertical cooling louvers and 4-fan chiller bay
  const datacenterGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Armored Server Vault Base: y=0 to 0.88 (0.98 x 0.98)
    const vault = prep(new THREE.BoxGeometry(0.98, 0.88, 0.98));
    vault.translate(0, 0.44, 0);
    parts.push(vault);

    // Vertical Heat-Sink Louvers (North & South exterior fins)
    for (let f = -0.38; f <= 0.38; f += 0.19) {
      const finNorth = prep(new THREE.BoxGeometry(0.04, 0.64, 0.04));
      finNorth.translate(f, 0.44, 0.51);
      parts.push(finNorth);

      const finSouth = prep(new THREE.BoxGeometry(0.04, 0.64, 0.04));
      finSouth.translate(f, 0.44, -0.51);
      parts.push(finSouth);
    }

    // 4-Fan Chiller Bay Array on Roof: y=0.88 to 0.98
    const chillerBay = prep(new THREE.BoxGeometry(0.78, 0.10, 0.78));
    chillerBay.translate(0, 0.93, 0);
    parts.push(chillerBay);

    // 4 Individual Chiller Housings
    const fanCoords = [
      [-0.22, -0.22],
      [0.22, -0.22],
      [-0.22, 0.22],
      [0.22, 0.22],
    ];
    for (const [fx, fz] of fanCoords) {
      const fan = prep(new THREE.BoxGeometry(0.20, 0.04, 0.20));
      fan.translate(fx, 0.99, fz);
      parts.push(fan);
    }

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 8. Twin-Tower Multi-Section Complex: Asymmetric twin rectangular towers linked by skybridge
  const multisectionComplexGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Foundation Base: y=0 to 0.16 (1.02 x 0.92)
    const foundation = prep(new THREE.BoxGeometry(1.02, 0.16, 0.92));
    foundation.translate(0, 0.08, 0);
    parts.push(foundation);

    // West Tower Column: y=0.16 to 0.98 (0.42 x 0.84)
    const westCol = prep(new THREE.BoxGeometry(0.42, 0.82, 0.84));
    westCol.translate(-0.28, 0.57, 0);
    parts.push(westCol);

    // East Tower Column: y=0.16 to 0.88 (0.42 x 0.84)
    const eastCol = prep(new THREE.BoxGeometry(0.42, 0.72, 0.84));
    eastCol.translate(0.28, 0.52, 0);
    parts.push(eastCol);

    // Enclosed Skybridge Connector: y=0.54 to 0.64
    const bridge = prep(new THREE.BoxGeometry(0.26, 0.10, 0.36));
    bridge.translate(0, 0.59, 0);
    parts.push(bridge);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 9. Lattice Communications Mast: Sturdy podium + slender rectangular communications structure + equipment platforms
  const telecomSpireGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Sturdy Plinth Base: y=0 to 0.24 (0.94 x 0.94)
    const base = prep(new THREE.BoxGeometry(0.94, 0.24, 0.94));
    base.translate(0, 0.12, 0);
    parts.push(base);

    // Equipment Deck Mezzanine: y=0.24 to 0.52 (0.68 x 0.68)
    const mezz = prep(new THREE.BoxGeometry(0.68, 0.28, 0.68));
    mezz.translate(0, 0.38, 0);
    parts.push(mezz);

    // Upper Mast Platform: y=0.52 to 0.88 (0.34 x 0.34)
    const mast = prep(new THREE.BoxGeometry(0.34, 0.36, 0.34));
    mast.translate(0, 0.70, 0);
    parts.push(mast);

    // Microwave Transmission Dishes (flat circular cylinders)
    const dish1 = prep(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 12));
    dish1.rotateZ(Math.PI / 2);
    dish1.translate(0.20, 0.68, 0);
    parts.push(dish1);

    const dish2 = prep(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 12));
    dish2.rotateZ(Math.PI / 2);
    dish2.translate(-0.20, 0.80, 0);
    parts.push(dish2);

    // Flat roof equipment crown: y=0.88 to 1.0 (0.22 x 0.22)
    const crown = prep(new THREE.BoxGeometry(0.22, 0.12, 0.22));
    crown.translate(0, 0.94, 0);
    parts.push(crown);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 10. Monumental Critical Landmark: Hero Cyber Skyscraper matching reference image
  // Sleek, tall, majestic architectural skyscraper with vertical structural mullions,
  // lobby podium, tiered setbacks, and illuminated rooftop crown
  const monumentalLandmarkGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Grand Lobby Podium Base: y=0 to 0.14 (1.04 x 1.04)
    const podium = prep(new THREE.BoxGeometry(1.04, 0.14, 1.04));
    podium.translate(0, 0.07, 0);
    parts.push(podium);

    // Lower Tower Shaft: y=0.14 to 0.58 (0.92 x 0.92)
    const lowerShaft = prep(new THREE.BoxGeometry(0.92, 0.44, 0.92));
    lowerShaft.translate(0, 0.36, 0);
    parts.push(lowerShaft);

    // 4 Vertical Exoskeleton Corner Columns running up through the lower tower
    const colW = 0.08;
    const corners = [
      [-0.45, -0.45],
      [0.45, -0.45],
      [-0.45, 0.45],
      [0.45, 0.45],
    ];
    for (const [cx, cz] of corners) {
      const col = prep(new THREE.BoxGeometry(colW, 0.82, colW));
      col.translate(cx, 0.41, cz);
      parts.push(col);
    }

    // Mid-tower Architectural Reveal / Terrace: y=0.58 to 0.62 (0.96 x 0.96)
    const midReveal = prep(new THREE.BoxGeometry(0.96, 0.04, 0.96));
    midReveal.translate(0, 0.60, 0);
    parts.push(midReveal);

    // Upper Tower Shaft: y=0.62 to 0.88 (0.80 x 0.80)
    const upperShaft = prep(new THREE.BoxGeometry(0.80, 0.26, 0.80));
    upperShaft.translate(0, 0.75, 0);
    parts.push(upperShaft);

    // Crown Penthouse & Machinery Deck: y=0.88 to 0.98 (0.64 x 0.64)
    const penthouse = prep(new THREE.BoxGeometry(0.64, 0.10, 0.64));
    penthouse.translate(0, 0.93, 0);
    parts.push(penthouse);

    // Rooftop Crown Parapet / Helipad Frame: y=0.98 to 1.04 (0.48 x 0.48)
    const crown = prep(new THREE.BoxGeometry(0.48, 0.06, 0.48));
    crown.translate(0, 1.01, 0);
    parts.push(crown);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  return {
    glass_skyscraper: glassSkyscraperGeo,
    corporate_tower: corporateTowerGeo,
    stepped_industrial: steppedIndustrialGeo,
    brutalist_tech: brutalistTechGeo,
    research_facility: researchFacilityGeo,
    compact_residential: compactResidentialGeo,
    datacenter: datacenterGeo,
    multisection_complex: multisectionComplexGeo,
    telecom_spire: telecomSpireGeo,
    monumental_landmark: monumentalLandmarkGeo,
  };
}

/**
 * Creates the high-fidelity procedural architectural facade shader.
 * - Dual-temperature lighting: warm golden interior office glow (~50%) + cool cyan workstation lighting (~25%).
 * - Dark tinted glass spandrels and structural mullions.
 * - Subtle window flicker on ~4% of lit windows.
 * - Slow crimson pulse on high-risk buildings.
 * - Fresnel edge rim light for crisp architectural silhouette readability against the dark night sky.
 * - Soft vertical gradient (darker at base, brighter toward crown).
 * - Rooftop surfaces: dark metallic gravel roof decks with glowing edge parapets.
 */
export function createArchitecturalFacadeMaterial(): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({
    roughness: 0.26,
    metalness: 0.80,
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
      '#include <opaque_fragment>',
      `#include <opaque_fragment>
       // High-Fidelity HDR Procedural Architectural Facade Shader with Neon Conduits

       // Detect high-risk file from diffuse / instance color (red dominant)
       float isHighRisk = step(diffuseColor.g + 0.12, diffuseColor.r) * step(diffuseColor.b + 0.10, diffuseColor.r);
       float crimsonPulse = 0.88 + 0.28 * sin(uTime * 2.4);

       // 1. Facade Vertical Walls (abs(normal.y) < 0.40)
       if (abs(vModelNormal.y) < 0.40) {
         vec2 wallCoord = abs(vModelNormal.x) > 0.40 ? vWorldPos.zy : vWorldPos.xy;

         // High-density architectural window grid: 6.5 bays per unit, 4.8 floors per unit
         vec2 gridPos = wallCoord * vec2(6.5, 4.8);
         vec2 cell = floor(gridPos);
         vec2 uvInCell = fract(gridPos);

         // Crisp rectangular window aperture
         float isWindow = step(0.14, uvInCell.x) * step(uvInCell.x, 0.86) *
                          step(0.16, uvInCell.y) * step(uvInCell.y, 0.84);

         float instanceLuma = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
         float isDimmed = step(instanceLuma, 0.12);
         float dimFactor = mix(1.0, 0.20, isDimmed);

         if (isWindow > 0.5) {
           float h = hashWindow(cell);
           float flicker = 1.0;
           if (h > 0.92) {
             flicker = 0.84 + 0.16 * sin(uTime * 4.8 + h * 6.28);
           }

           vec3 winColor = vec3(0.02, 0.03, 0.05); // Unlit dark glass
           if (h > 0.20) {
             // Warm golden incandescent amber interior glow
             winColor = vec3(1.0, 0.82, 0.45) * 2.6;
           } else if (h > 0.08) {
             // Cool cyan/white office lighting
             winColor = vec3(0.55, 0.88, 1.0) * 1.8;
           }

           // On high-risk buildings (seed_db.py), blend warm golden interior with fiery amber-red
           if (isHighRisk > 0.5 && h > 0.20) {
             winColor = mix(winColor, vec3(1.0, 0.48, 0.20) * 2.4, 0.45 * crimsonPulse);
           }

           gl_FragColor.rgb = mix(gl_FragColor.rgb * 0.18, winColor * flicker * dimFactor, 0.92);
         } else {
           // Dark metallic spandrel / mullion framing
           gl_FragColor.rgb *= 0.25;
         }

         // High-risk hero skyscraper (seed_db.py) EXOSKELETON CONDUITS
         if (isHighRisk > 0.5) {
           // 4 Vertical corner buttress columns running up the skyscraper
           float isCorner = step(0.36, abs(vObjectPos.x)) * step(0.36, abs(vObjectPos.z));
           if (isCorner > 0.5) {
             gl_FragColor.rgb = vec3(1.0, 0.14, 0.08) * 3.8 * crimsonPulse;
           }
           // Mid-tower architectural reveal
           float isMidBelt = step(0.58, vObjectPos.y) * step(vObjectPos.y, 0.62);
           if (isMidBelt > 0.5) {
             gl_FragColor.rgb += vec3(1.0, 0.18, 0.10) * 2.6 * crimsonPulse;
           }
           // Rooftop crown frame
           float isCrown = step(0.96, vObjectPos.y);
           if (isCrown > 0.5) {
             gl_FragColor.rgb = vec3(1.0, 0.14, 0.08) * 4.0 * crimsonPulse;
           }
         } else {
           // Normal buildings: glowing cyan rooftop parapet trim
           float isTopTrim = step(0.96, vObjectPos.y);
           if (isTopTrim > 0.5) {
             gl_FragColor.rgb += vec3(0.18, 0.82, 1.0) * 2.4;
           }
         }

         // Soft vertical gradient (darker at ground, brighter toward crown)
         float vertGrad = mix(0.75, 1.12, clamp(vObjectPos.y, 0.0, 1.0));
         gl_FragColor.rgb *= vertGrad;

         // Fresnel rim lighting for instant silhouette readability
         float fresnel = pow(1.0 - max(0.0, dot(vModelNormal, vViewDir)), 2.8);
         gl_FragColor.rgb += vec3(0.02, 0.15, 0.28) * fresnel * dimFactor;
       }
       // 2. Rooftop Surfaces (abs(normal.y) >= 0.40)
       else if (vModelNormal.y > 0.40) {
         gl_FragColor.rgb *= 0.26;

         vec2 roofPos = fract(vWorldPos.xz * 0.45);
         float borderDist = min(min(roofPos.x, 1.0 - roofPos.x), min(roofPos.y, 1.0 - roofPos.y));

         if (isHighRisk > 0.5) {
           // Brilliant red neon rooftop perimeter parapet
           if (borderDist < 0.12) {
             gl_FragColor.rgb = vec3(1.0, 0.14, 0.08) * 4.0 * crimsonPulse;
           }
         } else {
           // Brilliant cyan perimeter parapet trim
           if (borderDist < 0.08) {
             gl_FragColor.rgb += vec3(0.18, 0.82, 1.0) * 2.6;
           }
         }
       }`    );
  };

  return mat;
}
