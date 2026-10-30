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
  telecom_spire: 'Lattice Communications Spire',
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

  // 4. Heavy complexity files (> 14 cyclomatic complexity) -> Glass Skyscraper or Corporate Tower
  if (file.max_complexity >= 14) {
    return (index % 2 === 0) ? 'glass_skyscraper' : 'corporate_tower';
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

  // 8. Large multi-component modules (LOC > 400) -> Multi-Section Complex
  if (file.loc > 400) {
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
 * Builds rich, normalized [0..1] unit geometries with physical architectural details,
 * setbacks, roof machinery, antennas, and cantilevers.
 */
export function createArchetypeGeometries(): Record<BuildingArchetype, THREE.BufferGeometry> {
  // Helper to ensure clean attributes before merge
  const prep = (geo: THREE.BufferGeometry) => {
    geo.computeVertexNormals();
    return geo;
  };

  // 1. Futuristic Glass Skyscraper
  // Base podium + octagonal chamfered tower + tapered crown + needle spire with pinnacle beacon
  const glassSkyscraperGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Base podium
    const base = prep(new THREE.BoxGeometry(1.0, 0.12, 1.0));
    base.translate(0, 0.06, 0);
    parts.push(base);

    // 4 Corner structural pillars
    const pW = 0.06;
    const colCoords = [
      [-0.46, -0.46],
      [0.46, -0.46],
      [-0.46, 0.46],
      [0.46, 0.46],
    ];
    for (const [cx, cz] of colCoords) {
      const col = prep(new THREE.BoxGeometry(pW, 0.82, pW));
      col.translate(cx, 0.50, cz);
      parts.push(col);
    }

    // Main octagonal tower shaft
    const shaft = prep(new THREE.CylinderGeometry(0.58, 0.64, 0.76, 8));
    shaft.translate(0, 0.48, 0);
    parts.push(shaft);

    // Tapered setback crown
    const crown = prep(new THREE.CylinderGeometry(0.40, 0.56, 0.12, 8));
    crown.translate(0, 0.92, 0);
    parts.push(crown);

    // Pinnacle communication spire
    const spire = prep(new THREE.CylinderGeometry(0.012, 0.035, 0.22, 6));
    spire.translate(0, 1.09, 0);
    parts.push(spire);

    // Spire beacon sphere
    const beacon = prep(new THREE.SphereGeometry(0.032, 8, 6));
    beacon.translate(0, 1.20, 0);
    parts.push(beacon);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 2. High-Rise Corporate Tower
  // Tiered 3-step setbacks + penthouse + rooftop chiller units + dual antenna masts
  const corporateTowerGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Tier 1 Base Podium
    const t1 = prep(new THREE.BoxGeometry(1.0, 0.22, 1.0));
    t1.translate(0, 0.11, 0);
    parts.push(t1);

    // Tier 2 Mid-Tower Shaft
    const t2 = prep(new THREE.BoxGeometry(0.82, 0.46, 0.82));
    t2.translate(0, 0.45, 0);
    parts.push(t2);

    // Tier 3 Penthouse Setback
    const t3 = prep(new THREE.BoxGeometry(0.62, 0.28, 0.62));
    t3.translate(0, 0.82, 0);
    parts.push(t3);

    // Rooftop Machinery Bulkhead
    const bulkhead = prep(new THREE.BoxGeometry(0.38, 0.08, 0.38));
    bulkhead.translate(0, 1.00, 0);
    parts.push(bulkhead);

    // Dual Antennas
    const ant1 = prep(new THREE.CylinderGeometry(0.01, 0.02, 0.16, 4));
    ant1.translate(-0.12, 1.12, -0.12);
    parts.push(ant1);
    const ant2 = prep(new THREE.CylinderGeometry(0.01, 0.02, 0.16, 4));
    ant2.translate(0.12, 1.12, 0.12);
    parts.push(ant2);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 3. Stepped Industrial Tech Hub
  // Ziggurat stepped blocks + mechanical cooling units + industrial exhaust stacks
  const steppedIndustrialGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Step 1 Base
    const s1 = prep(new THREE.BoxGeometry(1.0, 0.34, 1.0));
    s1.translate(0, 0.17, 0);
    parts.push(s1);

    // Step 2 Middle
    const s2 = prep(new THREE.BoxGeometry(0.76, 0.34, 0.76));
    s2.translate(0, 0.51, 0);
    parts.push(s2);

    // Step 3 Upper
    const s3 = prep(new THREE.BoxGeometry(0.52, 0.26, 0.52));
    s3.translate(0, 0.81, 0);
    parts.push(s3);

    // Industrial HVAC Chiller (horizontal cylinder on step 1 ledge)
    const chiller1 = prep(new THREE.CylinderGeometry(0.06, 0.06, 0.36, 8));
    chiller1.rotateZ(Math.PI / 2);
    chiller1.translate(-0.38, 0.40, 0.36);
    parts.push(chiller1);

    // Industrial HVAC Chiller 2
    const chiller2 = prep(new THREE.CylinderGeometry(0.05, 0.05, 0.28, 8));
    chiller2.rotateZ(Math.PI / 2);
    chiller2.translate(0.28, 0.72, -0.28);
    parts.push(chiller2);

    // Dual Rooftop Exhaust Stacks
    const stack1 = prep(new THREE.CylinderGeometry(0.035, 0.045, 0.14, 6));
    stack1.translate(-0.10, 1.01, 0);
    parts.push(stack1);
    const stack2 = prep(new THREE.CylinderGeometry(0.035, 0.045, 0.14, 6));
    stack2.translate(0.10, 1.01, 0);
    parts.push(stack2);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 4. Brutalist Technology Structure
  // Heavy cantilevered overhangs + 4 massive corner pillars + recessed horizontal slot windows
  const brutalistTechGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // 4 Heavy Corner Pilasters
    const pSize = 0.14;
    const pCoords = [
      [-0.42, -0.42],
      [0.42, -0.42],
      [-0.42, 0.42],
      [0.42, 0.42],
    ];
    for (const [cx, cz] of pCoords) {
      const p = prep(new THREE.BoxGeometry(pSize, 0.26, pSize));
      p.translate(cx, 0.13, cz);
      parts.push(p);
    }

    // Recessed ground base
    const base = prep(new THREE.BoxGeometry(0.72, 0.26, 0.72));
    base.translate(0, 0.13, 0);
    parts.push(base);

    // Cantilevered Mid-Section
    const mid = prep(new THREE.BoxGeometry(1.04, 0.44, 1.04));
    mid.translate(0, 0.48, 0);
    parts.push(mid);

    // Projected Top Overhang
    const top = prep(new THREE.BoxGeometry(1.10, 0.24, 1.10));
    top.translate(0, 0.82, 0);
    parts.push(top);

    // Recessed roof parapet rim
    const parapet = prep(new THREE.BoxGeometry(0.86, 0.08, 0.86));
    parapet.translate(0, 0.98, 0);
    parts.push(parapet);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 5. Modular Research Facility
  // Central octagonal core + flanking laboratory pods + connecting skybridges + rooftop radome
  const researchFacilityGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Central Core Tower
    const core = prep(new THREE.CylinderGeometry(0.36, 0.38, 0.94, 8));
    core.translate(0, 0.47, 0);
    parts.push(core);

    // Flanking Lab Wing West
    const wingW = prep(new THREE.BoxGeometry(0.36, 0.60, 0.42));
    wingW.translate(-0.35, 0.30, 0);
    parts.push(wingW);

    // Flanking Lab Wing East
    const wingE = prep(new THREE.BoxGeometry(0.36, 0.60, 0.42));
    wingE.translate(0.35, 0.30, 0);
    parts.push(wingE);

    // Connecting Skybridge Tube
    const bridge = prep(new THREE.CylinderGeometry(0.08, 0.08, 0.70, 8));
    bridge.rotateZ(Math.PI / 2);
    bridge.translate(0, 0.48, 0);
    parts.push(bridge);

    // Rooftop Radome Observatory Dome
    const radome = prep(new THREE.SphereGeometry(0.20, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2));
    radome.translate(0, 0.94, 0);
    parts.push(radome);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 6. Compact High-Density Residential Block
  // Offset stacked cubic modules + exterior service balconies + rooftop water tank
  const compactResidentialGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Lower Module
    const mod1 = prep(new THREE.BoxGeometry(0.96, 0.46, 0.96));
    mod1.translate(0, 0.23, 0);
    parts.push(mod1);

    // Upper Offset Module
    const mod2 = prep(new THREE.BoxGeometry(0.86, 0.46, 0.86));
    mod2.translate(0.04, 0.69, -0.04);
    parts.push(mod2);

    // Balcony Ledge 1
    const balc1 = prep(new THREE.BoxGeometry(0.98, 0.04, 0.16));
    balc1.translate(0, 0.46, 0.42);
    parts.push(balc1);

    // Balcony Ledge 2
    const balc2 = prep(new THREE.BoxGeometry(0.16, 0.04, 0.88));
    balc2.translate(-0.42, 0.74, 0);
    parts.push(balc2);

    // Rooftop Water Tank (cylinder on 4 stilts)
    const tank = prep(new THREE.CylinderGeometry(0.14, 0.14, 0.16, 8));
    tank.translate(-0.20, 1.02, 0.18);
    parts.push(tank);
    const stilts = prep(new THREE.BoxGeometry(0.24, 0.10, 0.24));
    stilts.translate(-0.20, 0.94, 0.18);
    parts.push(stilts);

    // Elevator Penthouse
    const elev = prep(new THREE.BoxGeometry(0.26, 0.10, 0.26));
    elev.translate(0.18, 0.97, -0.16);
    parts.push(elev);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 7. Fortified Data Center Monolith
  // Monolithic armored block + vertical heat-sink cooling fins + rooftop fan arrays
  const datacenterGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Armored plinth base
    const plinth = prep(new THREE.BoxGeometry(1.04, 0.10, 1.04));
    plinth.translate(0, 0.05, 0);
    parts.push(plinth);

    // Main Server Vault
    const vault = prep(new THREE.BoxGeometry(0.94, 0.84, 0.94));
    vault.translate(0, 0.52, 0);
    parts.push(vault);

    // Vertical Heat Sink Fins (East and West facades)
    const finThick = 0.04;
    const finH = 0.72;
    const finD = 0.08;
    const zOffsets = [-0.30, -0.15, 0.0, 0.15, 0.30];
    for (const z of zOffsets) {
      const finE = prep(new THREE.BoxGeometry(finD, finH, finThick));
      finE.translate(0.50, 0.50, z);
      parts.push(finE);

      const finWest = prep(new THREE.BoxGeometry(finD, finH, finThick));
      finWest.translate(-0.50, 0.50, z);
      parts.push(finWest);
    }

    // Rooftop Cooling Chiller Fans (4 circular fan wells)
    const fanCoords = [
      [-0.22, -0.22],
      [0.22, -0.22],
      [-0.22, 0.22],
      [0.22, 0.22],
    ];
    for (const [fx, fz] of fanCoords) {
      const fanWell = prep(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 8));
      fanWell.translate(fx, 0.97, fz);
      parts.push(fanWell);
    }

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 8. Twin-Tower Multi-Section Complex
  // Twin towers + ground atrium connector + mid-level enclosed skybridge + upper skyway truss
  const multisectionComplexGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Ground Atrium Plinth
    const atrium = prep(new THREE.BoxGeometry(0.96, 0.18, 0.84));
    atrium.translate(0, 0.09, 0);
    parts.push(atrium);

    // Tower 1 (West)
    const t1 = prep(new THREE.BoxGeometry(0.38, 1.0, 0.78));
    t1.translate(-0.29, 0.50, 0);
    parts.push(t1);

    // Tower 2 (East - slightly shorter for dynamic skyline)
    const t2 = prep(new THREE.BoxGeometry(0.38, 0.90, 0.78));
    t2.translate(0.29, 0.45, 0);
    parts.push(t2);

    // Enclosed Skybridge (at y=0.54)
    const skybridge = prep(new THREE.BoxGeometry(0.26, 0.10, 0.30));
    skybridge.translate(0, 0.54, 0);
    parts.push(skybridge);

    // Upper Structural Truss (at y=0.82)
    const truss = prep(new THREE.BoxGeometry(0.26, 0.05, 0.18));
    truss.translate(0, 0.82, 0);
    parts.push(truss);

    // Roof Antenna on Tower 1
    const ant = prep(new THREE.CylinderGeometry(0.015, 0.025, 0.18, 4));
    ant.translate(-0.29, 1.09, 0);
    parts.push(ant);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 9. Lattice Communications Spire
  // Tapered pyramidal base + equipment deck + open lattice mast + microwave dishes + needle spire
  const telecomSpireGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Heavy Tapered Base
    const base = prep(new THREE.CylinderGeometry(0.62, 0.98, 0.28, 4));
    base.rotateY(Math.PI / 4);
    base.translate(0, 0.14, 0);
    parts.push(base);

    // Equipment Deck Mezzanine
    const mezz = prep(new THREE.BoxGeometry(0.56, 0.22, 0.56));
    mezz.translate(0, 0.39, 0);
    parts.push(mezz);

    // Tapering Lattice Transmission Mast
    const mast = prep(new THREE.CylinderGeometry(0.12, 0.26, 0.50, 4));
    mast.rotateY(Math.PI / 4);
    mast.translate(0, 0.75, 0);
    parts.push(mast);

    // Microwave Dish 1 (Lower)
    const dish1 = prep(new THREE.CylinderGeometry(0.10, 0.02, 0.04, 8));
    dish1.rotateX(Math.PI / 2);
    dish1.translate(0, 0.66, 0.22);
    parts.push(dish1);

    // Microwave Dish 2 (Upper, opposite side)
    const dish2 = prep(new THREE.CylinderGeometry(0.08, 0.02, 0.04, 8));
    dish2.rotateX(Math.PI / 2);
    dish2.translate(0, 0.86, -0.16);
    parts.push(dish2);

    // High-Gain Needle Spire
    const spire = prep(new THREE.CylinderGeometry(0.01, 0.035, 0.36, 6));
    spire.translate(0, 1.18, 0);
    parts.push(spire);

    // Aviation Warning Beacon
    const beacon = prep(new THREE.SphereGeometry(0.035, 8, 6));
    beacon.translate(0, 1.36, 0);
    parts.push(beacon);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 10. Monumental Critical Landmark
  // Reserved for critical files & top-risk hotspots.
  // Swept corner buttress pylons + multi-tier central spire + glowing torus halo ring + apex pinnacle
  const monumentalLandmarkGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // 4 Diagonal Swept Buttresses
    const buttressAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
    for (const angle of buttressAngles) {
      const bx = Math.cos(angle) * 0.44;
      const bz = Math.sin(angle) * 0.44;
      const buttress = prep(new THREE.BoxGeometry(0.16, 0.60, 0.16));
      buttress.translate(bx, 0.30, bz);
      parts.push(buttress);
    }

    // Monumental Octagonal Core Tower
    const core = prep(new THREE.CylinderGeometry(0.48, 0.66, 0.90, 8));
    core.translate(0, 0.45, 0);
    parts.push(core);

    // Floating Halo Torus Ring (Upper Tier)
    const halo = prep(new THREE.TorusGeometry(0.56, 0.026, 8, 24));
    halo.rotateX(Math.PI / 2);
    halo.translate(0, 0.84, 0);
    parts.push(halo);

    // Stepped Crown Apex
    const apex = prep(new THREE.BoxGeometry(0.44, 0.14, 0.44));
    apex.translate(0, 0.97, 0);
    parts.push(apex);

    // Monumental Pinnacle Spire
    const needle = prep(new THREE.ConeGeometry(0.12, 0.36, 8));
    needle.translate(0, 1.18, 0);
    parts.push(needle);

    // Apex Energy Beacon Sphere
    const beacon = prep(new THREE.SphereGeometry(0.055, 8, 8));
    beacon.translate(0, 1.38, 0);
    parts.push(beacon);

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
 * Supports:
 * - Architectural floor bands and vertical structural columns.
 * - Recessed window apertures.
 * - Deterministic window hash lighting (warm amber, cyber cyan, cool terminal white).
 * - Subtle window flicker on a small fraction of illuminated windows.
 * - Emissive vertical accent stripes and edge lighting driven by instanceColor.
 * - Rooftop trim and beacon illumination.
 * - Emissive risk pulse sweep on critical/high-risk structures.
 */
export function createArchitecturalFacadeMaterial(): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({
    roughness: 0.32,
    metalness: 0.72,
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
       varying vec3 vObjectPos;`
    );

    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      `#include <worldpos_vertex>
       vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
       vModelNormal = normal;
       vObjectPos = position;`
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
       uniform float uTime;
       uniform float uPulseIntensity;
       varying vec3 vWorldPos;
       varying vec3 vModelNormal;
       varying vec3 vObjectPos;

       float hash21(vec2 p) {
         p = fract(p * vec2(123.34, 456.21));
         p += dot(p, p + 45.32);
         return fract(p.x * p.y);
       }`
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `#include <dithering_fragment>
       // Realistic Procedural Architectural Facade Shader

       // 1. Facade Vertical Walls (abs(normal.y) < 0.42)
       if (abs(vModelNormal.y) < 0.42) {
         // Angle-aware coordinate projection for planar, chamfered, and cylindrical facades
         float angle = atan(vModelNormal.z, vModelNormal.x);
         float uCoord = (abs(vModelNormal.x) > 0.65) ? vWorldPos.z : ((abs(vModelNormal.z) > 0.65) ? vWorldPos.x : angle * 2.5);
         vec2 wallCoord = vec2(uCoord, vWorldPos.y);

         // Calibrated architectural grid: ~5.0 window bays per unit, ~3.6 floors per unit
         vec2 gridPos = wallCoord * vec2(5.0, 3.6);
         vec2 cell = floor(gridPos);
         vec2 uvInCell = fract(gridPos);

         // Crisp architectural window aperture with dark structural spandrels and mullions
         // Horizontal spandrel: [0.18, 0.82]
         // Vertical mullion: [0.18, 0.82]
         float isWindow = step(0.18, uvInCell.x) * step(uvInCell.x, 0.82) *
                          step(0.20, uvInCell.y) * step(uvInCell.y, 0.80);

         // Detect if this instance is dimmed into standby mode (e.g. during blast radius)
         float instanceLuma = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
         float isDimmed = step(instanceLuma, 0.12);
         float windowDimFactor = mix(1.0, 0.18, isDimmed);

         if (isWindow > 0.5) {
           float h = hash21(cell);
           float flicker = 1.0;
           // Subtle flicker on ~5% of lit windows
           if (h > 0.89) {
             flicker = 0.80 + 0.20 * sin(uTime * 4.5 + h * 6.28);
           }

           vec3 winColor = vec3(0.015, 0.025, 0.045); // Unlit dark office
           if (h > 0.68) {
             // Warm incandescent amber interior light
             winColor = vec3(1.0, 0.82, 0.52) * 1.35;
           } else if (h > 0.44) {
             // Cyber cyan terminal workstation
             winColor = vec3(0.28, 0.86, 1.0) * 1.45;
           } else if (h > 0.24) {
             // Cool white corporate fluorescent
             winColor = vec3(0.88, 0.94, 1.0) * 1.20;
           }

           // Blend window illumination into surface diffuse
           gl_FragColor.rgb = mix(gl_FragColor.rgb * 0.25, winColor * flicker * windowDimFactor, 0.88);
         } else {
           // Dark structural spandrel / mullion framing
           gl_FragColor.rgb *= 0.32;

           // Subtle vertical corner neon accent fin
           float edgeDist = min(uvInCell.x, 1.0 - uvInCell.x);
           if (edgeDist < 0.04) {
             gl_FragColor.rgb += vec3(0.05, 0.16, 0.28) * windowDimFactor;
           }
         }

         // Vertical scanning pulse wave for high-risk / selected buildings
         float scanWave = sin(vWorldPos.y * 0.55 - uTime * 2.8);
         if (scanWave > 0.90) {
           float scanFactor = (scanWave - 0.90) / 0.10;
           gl_FragColor.rgb += vec3(0.08, 0.24, 0.42) * scanFactor * uPulseIntensity * windowDimFactor;
         }
       }
       // 2. Rooftop Surfaces and Architectural Equipment (normal.y > 0.42)
       else if (vModelNormal.y > 0.42) {
         // Dark metallic roof gravel finish (prevent white blowout)
         gl_FragColor.rgb *= 0.38;

         // Rooftop edge perimeter trim neon accent
         vec2 roofPos = fract(vWorldPos.xz * 0.35);
         float borderDist = min(min(roofPos.x, 1.0 - roofPos.x), min(roofPos.y, 1.0 - roofPos.y));
         if (borderDist < 0.07) {
           gl_FragColor.rgb += vec3(0.12, 0.35, 0.52);
         }

         // Beacon glow for spires and antenna tips at upper heights (y > 0.95 in model)
         if (vObjectPos.y > 0.95) {
           float beaconPulse = 0.7 + 0.3 * sin(uTime * 5.0 + vWorldPos.x * 2.0);
           gl_FragColor.rgb = vec3(0.25, 0.75, 1.0) * beaconPulse * 1.8;
         }
       }`
    );
  };

  return mat;
}
