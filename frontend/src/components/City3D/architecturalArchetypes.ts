import * as THREE from 'three';
import * as BGU from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
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
  // 1. Critical hot-spot landmark files (highest risk + impact or flagged as hotspot)
  if (
    (file.is_hotspot && file.risk_probability >= 0.50) ||
    (file.risk_rank === 1 && file.risk_probability >= 0.65 && file.impact_score >= 1.20)
  ) {
    return 'monumental_landmark';
  }

  const pathLower = (file.path || '').toLowerCase();
  const filenameLower = (file.filename || '').toLowerCase();

  // 2. Telemetry, networking, routing, client, API, CLI -> Telecom Spire
  if (
    pathLower.includes('api') ||
    pathLower.includes('client') ||
    pathLower.includes('route') ||
    pathLower.includes('net') ||
    pathLower.includes('socket') ||
    pathLower.includes('connect') ||
    filenameLower.startsWith('cli')
  ) {
    return 'telecom_spire';
  }

  // 3. Database, storage, schema, models, cache, SQL, entity -> Fortified Data Center
  if (
    pathLower.includes('model') ||
    pathLower.includes('db') ||
    pathLower.includes('schema') ||
    pathLower.includes('store') ||
    pathLower.includes('sql') ||
    pathLower.includes('entity') ||
    pathLower.includes('cache')
  ) {
    return 'datacenter';
  }

  // 4. Tests, specs, mocks, fixtures, benchmarks -> Stepped Industrial Hub
  if (
    pathLower.includes('test') ||
    pathLower.includes('mock') ||
    pathLower.includes('fixture') ||
    pathLower.includes('spec') ||
    pathLower.includes('bench')
  ) {
    return 'stepped_industrial';
  }

  // 5. Security, auth, permissions, crypto, tokens -> Brutalist Technology Structure
  if (
    pathLower.includes('auth') ||
    pathLower.includes('sec') ||
    pathLower.includes('crypt') ||
    pathLower.includes('token') ||
    pathLower.includes('guard') ||
    pathLower.includes('cert')
  ) {
    return 'brutalist_tech';
  }

  // 6. Core algorithms, engine, compute, graph, ML, compiler/parser -> Modular Research Facility
  if (
    pathLower.includes('graph') ||
    pathLower.includes('engine') ||
    pathLower.includes('core') ||
    pathLower.includes('ml') ||
    pathLower.includes('algo') ||
    pathLower.includes('parse') ||
    pathLower.includes('ast')
  ) {
    return 'research_facility';
  }

  // 7. Multi-component modules, blueprints, sessions, or large modules (> 280 LOC) -> Multi-Section Complex
  if (
    pathLower.includes('blueprint') ||
    pathLower.includes('session') ||
    pathLower.includes('plugin') ||
    file.loc > 280
  ) {
    return 'multisection_complex';
  }

  // 8. High complexity files (CC >= 8) or substantial architectural hubs -> Glass Skyscraper vs Corporate Tower
  if (file.max_complexity >= 8 || file.loc >= 160) {
    return index % 2 === 0 ? 'glass_skyscraper' : 'corporate_tower';
  }

  // 9. Small utilities, helpers, tools, configs (< 80 LOC) -> Compact Residential Block
  if (
    file.loc < 80 ||
    pathLower.includes('util') ||
    pathLower.includes('help') ||
    pathLower.includes('const') ||
    pathLower.includes('wrapper') ||
    pathLower.includes('common') ||
    pathLower.includes('ctx') ||
    pathLower.includes('config')
  ) {
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
 * stepped setbacks, roof machinery, antennas, and subtle rounded/chamfered edges.
 */
export function createArchetypeGeometries(): Record<BuildingArchetype, THREE.BufferGeometry> {
  const prep = (geo: THREE.BufferGeometry) => {
    const nonIndexed = geo.index ? geo.toNonIndexed() : geo;
    nonIndexed.computeVertexNormals();
    return nonIndexed;
  };

  // Helper: create subtly rounded box with fallback to BoxGeometry
  const rbox = (w: number, h: number, d: number, r: number = 0.012, segs: number = 2) => {
    try {
      return prep(new RoundedBoxGeometry(w, h, d, segs, r));
    } catch {
      return prep(new THREE.BoxGeometry(w, h, d));
    }
  };

  // 1. Futuristic Glass Skyscraper: Sleek curtain-wall tower with stepped sections, vertical mullions, and illuminated crown
  const glassSkyscraperGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Base podium plinth: y=0 to 0.12 (1.02 x 1.02)
    const base = rbox(1.02, 0.12, 1.02, 0.015);
    base.translate(0, 0.06, 0);
    parts.push(base);

    // 4 Corner structural mullions (vertical fins)
    const pW = 0.06;
    const colCoords = [
      [-0.45, -0.45],
      [0.45, -0.45],
      [-0.45, 0.45],
      [0.45, 0.45],
    ];
    for (const [cx, cz] of colCoords) {
      const col = rbox(pW, 0.84, pW, 0.008);
      col.translate(cx, 0.50, cz);
      parts.push(col);
    }

    // Main rectangular glass tower shaft: y=0.12 to 0.88 (0.92 x 0.92)
    const shaft = rbox(0.92, 0.76, 0.92, 0.016);
    shaft.translate(0, 0.50, 0);
    parts.push(shaft);

    // Stepped Upper Setback Tier: y=0.88 to 0.96 (0.76 x 0.76)
    const upperTier = rbox(0.76, 0.08, 0.76, 0.012);
    upperTier.translate(0, 0.92, 0);
    parts.push(upperTier);

    // Flat roof penthouse & parapet crown: y=0.96 to 1.02 (0.60 x 0.60)
    const roof = rbox(0.60, 0.06, 0.60, 0.010);
    roof.translate(0, 0.99, 0);
    parts.push(roof);

    // Slender rooftop spire tip
    const spire = prep(new THREE.CylinderGeometry(0.015, 0.025, 0.06, 8));
    spire.translate(0, 1.05, 0);
    parts.push(spire);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 2. High-Rise Corporate Tower: 3-tier stepped setbacks, floor divisions + rooftop HVAC chiller units
  const corporateTowerGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Tier 1 Base Podium: y=0 to 0.24 (1.0 x 1.0)
    const t1 = rbox(1.0, 0.24, 1.0, 0.015);
    t1.translate(0, 0.12, 0);
    parts.push(t1);

    // Floor Band Divider 1
    const band1 = rbox(1.03, 0.02, 1.03, 0.006);
    band1.translate(0, 0.24, 0);
    parts.push(band1);

    // Tier 2 Mid-Tower Shaft: y=0.25 to 0.70 (0.80 x 0.80)
    const t2 = rbox(0.80, 0.45, 0.80, 0.014);
    t2.translate(0, 0.475, 0);
    parts.push(t2);

    // Floor Band Divider 2
    const band2 = rbox(0.83, 0.02, 0.83, 0.006);
    band2.translate(0, 0.70, 0);
    parts.push(band2);

    // Tier 3 Penthouse Setback: y=0.71 to 0.96 (0.60 x 0.60)
    const t3 = rbox(0.60, 0.25, 0.60, 0.012);
    t3.translate(0, 0.835, 0);
    parts.push(t3);

    // Rooftop Machinery Bulkhead: y=0.96 to 1.02
    const bulkhead = rbox(0.38, 0.06, 0.38, 0.008);
    bulkhead.translate(0, 0.99, 0);
    parts.push(bulkhead);

    // Dual HVAC Chiller boxes on mid-terrace
    const hvac1 = rbox(0.12, 0.06, 0.14, 0.005);
    hvac1.translate(0.36, 0.27, -0.36);
    parts.push(hvac1);
    const hvac2 = rbox(0.12, 0.06, 0.14, 0.005);
    hvac2.translate(-0.36, 0.27, 0.36);
    parts.push(hvac2);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 3. Stepped Industrial Tech Hub: Ziggurat massing, visible frames, utility sections & cooling units
  const steppedIndustrialGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Heavy Plinth Base: y=0 to 0.28 (1.04 x 1.04)
    const base = rbox(1.04, 0.28, 1.04, 0.015);
    base.translate(0, 0.14, 0);
    parts.push(base);

    // Terrace 1: y=0.28 to 0.58 (0.84 x 0.84)
    const terr1 = rbox(0.84, 0.30, 0.84, 0.012);
    terr1.translate(0, 0.43, 0);
    parts.push(terr1);

    // Terrace 2: y=0.58 to 0.86 (0.64 x 0.64)
    const terr2 = rbox(0.64, 0.28, 0.64, 0.010);
    terr2.translate(0, 0.72, 0);
    parts.push(terr2);

    // Industrial Roof Deck: y=0.86 to 0.98 (0.44 x 0.44)
    const deck = rbox(0.44, 0.12, 0.44, 0.008);
    deck.translate(0, 0.92, 0);
    parts.push(deck);

    // Cooling Towers (twin cylindrical chiller enclosures on lower terrace)
    const ch1 = prep(new THREE.CylinderGeometry(0.08, 0.08, 0.10, 10));
    ch1.translate(0.32, 0.33, 0.32);
    parts.push(ch1);
    const ch2 = prep(new THREE.CylinderGeometry(0.08, 0.08, 0.10, 10));
    ch2.translate(-0.32, 0.33, -0.32);
    parts.push(ch2);

    // Exhaust vent stack on roof deck
    const vent = prep(new THREE.CylinderGeometry(0.03, 0.04, 0.08, 8));
    vent.translate(0, 1.02, 0);
    parts.push(vent);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 4. Brutalist Technology Structure: Heavy pilasters, cantilevered overhangs, and recessed window slits
  const brutalistTechGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Recessed Ground Floor Core: y=0 to 0.18 (0.80 x 0.80)
    const core = rbox(0.80, 0.18, 0.80, 0.010);
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
      const p = rbox(pW, 0.95, pW, 0.008);
      p.translate(cx, 0.475, cz);
      parts.push(p);
    }

    // Cantilevered Mid-Section: y=0.18 to 0.76 (1.02 x 1.02)
    const mid = rbox(1.02, 0.58, 1.02, 0.014);
    mid.translate(0, 0.47, 0);
    parts.push(mid);

    // Upper Brutalist Setback Deck: y=0.76 to 0.96 (0.86 x 0.86)
    const upper = rbox(0.86, 0.20, 0.86, 0.010);
    upper.translate(0, 0.86, 0);
    parts.push(upper);

    // Heavy Parapet roof trim: y=0.96 to 1.01
    const trim = rbox(0.88, 0.05, 0.88, 0.008);
    trim.translate(0, 0.985, 0);
    parts.push(trim);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 5. Modular Research Facility: Central tower flanked by twin laboratory pods with skyway tubes
  const researchFacilityGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Foundation Base: y=0 to 0.16 (1.0 x 0.92)
    const found = rbox(1.0, 0.16, 0.92, 0.014);
    found.translate(0, 0.08, 0);
    parts.push(found);

    // Central Core Tower: y=0.16 to 0.95 (0.50 x 0.50)
    const central = rbox(0.50, 0.79, 0.50, 0.012);
    central.translate(0, 0.555, 0);
    parts.push(central);

    // West Laboratory Pod: y=0.16 to 0.72 (0.34 x 0.68)
    const westPod = rbox(0.34, 0.56, 0.68, 0.012);
    westPod.translate(-0.35, 0.44, 0);
    parts.push(westPod);

    // East Laboratory Pod: y=0.16 to 0.72 (0.34 x 0.68)
    const eastPod = rbox(0.34, 0.56, 0.68, 0.012);
    eastPod.translate(0.35, 0.44, 0);
    parts.push(eastPod);

    // Skyway connector bridges between pods and core: y=0.48
    const bridgeW = prep(new THREE.BoxGeometry(0.12, 0.08, 0.24));
    bridgeW.translate(-0.21, 0.48, 0);
    parts.push(bridgeW);
    const bridgeE = prep(new THREE.BoxGeometry(0.12, 0.08, 0.24));
    bridgeE.translate(0.21, 0.48, 0);
    parts.push(bridgeE);

    // Rooftop Observation Dome Bulkhead: y=0.95 to 1.02
    const dome = prep(new THREE.CylinderGeometry(0.18, 0.20, 0.07, 12));
    dome.translate(0, 0.985, 0);
    parts.push(dome);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 6. High-Density Residential Block: Compact multi-floor low/mid-rise with exterior balconies
  const compactResidentialGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Sturdy Plinth: y=0 to 0.20 (0.96 x 0.96)
    const plinth = rbox(0.96, 0.20, 0.96, 0.014);
    plinth.translate(0, 0.10, 0);
    parts.push(plinth);

    // Main Residential Block: y=0.20 to 0.88 (0.90 x 0.90)
    const block = rbox(0.90, 0.68, 0.90, 0.012);
    block.translate(0, 0.54, 0);
    parts.push(block);

    // Service Balcony Ledges (West & East)
    const bal1 = rbox(0.06, 0.03, 0.74, 0.005);
    bal1.translate(0.46, 0.44, 0);
    parts.push(bal1);
    const bal2 = rbox(0.06, 0.03, 0.74, 0.005);
    bal2.translate(-0.46, 0.64, 0);
    parts.push(bal2);

    // Flat roof penthouse & water tank: y=0.88 to 0.98 (0.64 x 0.64)
    const roof = rbox(0.64, 0.10, 0.64, 0.008);
    roof.translate(0, 0.93, 0);
    parts.push(roof);

    const tank = prep(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 8));
    tank.translate(0.14, 1.01, -0.14);
    parts.push(tank);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 7. Fortified Data Center Monolith: Heavy server vault with cooling louvers and 4-fan chiller bay
  const datacenterGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Armored Server Vault Base: y=0 to 0.88 (0.98 x 0.98)
    const vault = rbox(0.98, 0.88, 0.98, 0.016);
    vault.translate(0, 0.44, 0);
    parts.push(vault);

    // Vertical Heat-Sink Louvers (North & South exterior fins)
    for (let f = -0.38; f <= 0.38; f += 0.19) {
      const finNorth = rbox(0.04, 0.64, 0.04, 0.005);
      finNorth.translate(f, 0.44, 0.51);
      parts.push(finNorth);

      const finSouth = rbox(0.04, 0.64, 0.04, 0.005);
      finSouth.translate(f, 0.44, -0.51);
      parts.push(finSouth);
    }

    // 4-Fan Chiller Bay Array on Roof: y=0.88 to 0.98
    const chillerBay = rbox(0.78, 0.10, 0.78, 0.010);
    chillerBay.translate(0, 0.93, 0);
    parts.push(chillerBay);

    // 4 Individual Chiller Exhaust Cylinders
    const fanCoords = [
      [-0.22, -0.22],
      [0.22, -0.22],
      [-0.22, 0.22],
      [0.22, 0.22],
    ];
    for (const [fx, fz] of fanCoords) {
      const fan = prep(new THREE.CylinderGeometry(0.08, 0.09, 0.05, 8));
      fan.translate(fx, 1.005, fz);
      parts.push(fan);
    }

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 8. Twin-Tower Multi-Section Complex: Asymmetric twin towers linked by high-altitude skybridge
  const multisectionComplexGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Foundation Base: y=0 to 0.16 (1.02 x 0.92)
    const foundation = rbox(1.02, 0.16, 0.92, 0.014);
    foundation.translate(0, 0.08, 0);
    parts.push(foundation);

    // West Tower Column: y=0.16 to 0.98 (0.42 x 0.84)
    const westCol = rbox(0.42, 0.82, 0.84, 0.014);
    westCol.translate(-0.28, 0.57, 0);
    parts.push(westCol);

    // East Tower Column: y=0.16 to 0.88 (0.42 x 0.84)
    const eastCol = rbox(0.42, 0.72, 0.84, 0.014);
    eastCol.translate(0.28, 0.52, 0);
    parts.push(eastCol);

    // Enclosed Skybridge Connector: y=0.54 to 0.64
    const bridge = rbox(0.26, 0.10, 0.36, 0.008);
    bridge.translate(0, 0.59, 0);
    parts.push(bridge);

    // Rooftop Elevator Enclosures
    const wRoof = rbox(0.24, 0.06, 0.36, 0.006);
    wRoof.translate(-0.28, 1.01, 0);
    parts.push(wRoof);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 9. Lattice Communications Mast: Sturdy podium + slender rectangular structure + transmission dishes & mast
  const telecomSpireGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Sturdy Plinth Base: y=0 to 0.24 (0.94 x 0.94)
    const base = rbox(0.94, 0.24, 0.94, 0.014);
    base.translate(0, 0.12, 0);
    parts.push(base);

    // Equipment Deck Mezzanine: y=0.24 to 0.52 (0.68 x 0.68)
    const mezz = rbox(0.68, 0.28, 0.68, 0.012);
    mezz.translate(0, 0.38, 0);
    parts.push(mezz);

    // Upper Mast Platform: y=0.52 to 0.88 (0.34 x 0.34)
    const mast = rbox(0.34, 0.36, 0.34, 0.008);
    mast.translate(0, 0.70, 0);
    parts.push(mast);

    // Microwave Transmission Dishes (circular cylinders facing outward)
    const dish1 = prep(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 12));
    dish1.rotateZ(Math.PI / 2);
    dish1.translate(0.20, 0.68, 0);
    parts.push(dish1);

    const dish2 = prep(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 12));
    dish2.rotateZ(Math.PI / 2);
    dish2.translate(-0.20, 0.80, 0);
    parts.push(dish2);

    // Flat roof equipment crown: y=0.88 to 0.98 (0.22 x 0.22)
    const crown = rbox(0.22, 0.10, 0.22, 0.006);
    crown.translate(0, 0.93, 0);
    parts.push(crown);

    // Slender communication antenna needle
    const antenna = prep(new THREE.CylinderGeometry(0.012, 0.02, 0.14, 8));
    antenna.translate(0, 1.05, 0);
    parts.push(antenna);

    const merged = BGU.mergeGeometries(parts, false);
    merged.computeVertexNormals();
    return merged;
  })();

  // 10. Monumental Critical Landmark: Hero Cyber Skyscraper with vertical exoskeleton columns,
  // stepped setbacks, mid-tower reveal, and illuminated crown
  const monumentalLandmarkGeo = (() => {
    const parts: THREE.BufferGeometry[] = [];

    // Grand Lobby Podium Base: y=0 to 0.14 (1.04 x 1.04)
    const podium = rbox(1.04, 0.14, 1.04, 0.016);
    podium.translate(0, 0.07, 0);
    parts.push(podium);

    // Lower Tower Shaft: y=0.14 to 0.58 (0.92 x 0.92)
    const lowerShaft = rbox(0.92, 0.44, 0.92, 0.015);
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
      const col = rbox(colW, 0.82, colW, 0.008);
      col.translate(cx, 0.41, cz);
      parts.push(col);
    }

    // Mid-tower Architectural Reveal / Terrace: y=0.58 to 0.62 (0.96 x 0.96)
    const midReveal = rbox(0.96, 0.04, 0.96, 0.008);
    midReveal.translate(0, 0.60, 0);
    parts.push(midReveal);

    // Upper Tower Shaft: y=0.62 to 0.88 (0.80 x 0.80)
    const upperShaft = rbox(0.80, 0.26, 0.80, 0.012);
    upperShaft.translate(0, 0.75, 0);
    parts.push(upperShaft);

    // Crown Penthouse & Machinery Deck: y=0.88 to 0.98 (0.64 x 0.64)
    const penthouse = rbox(0.64, 0.10, 0.64, 0.010);
    penthouse.translate(0, 0.93, 0);
    parts.push(penthouse);

    // Rooftop Crown Parapet / Helipad Frame: y=0.98 to 1.04 (0.48 x 0.48)
    const crown = rbox(0.48, 0.06, 0.48, 0.008);
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
 * - Dual-temperature interior window illumination: warm amber (~50%) + cool cyan (~25%).
 * - Dark tinted glass spandrels and structural metallic mullions.
 * - Subtle window flicker on ~4% of lit windows.
 * - Non-destructive metric integration: applies metric coloring primarily to architectural trim,
 *   parapet crowns, floor bands, and exoskeleton conduits, rather than washing out every window.
 * - Slow crimson pulse on critical high-risk files.
 * - Crisp Fresnel rim edge lighting for instantaneous architectural readability against night sky.
 * - Soft vertical gradient (ground plinth grounding to crown brilliance).
 * - Rooftop metallic surfaces with crisp perimeter parapet light strips.
 */
export function createArchitecturalFacadeMaterial(archetype: BuildingArchetype = 'monumental_landmark'): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({
    roughness: 0.22,
    metalness: 0.86,
    emissive: new THREE.Color('#000000'),
    emissiveIntensity: 1.0,
  });

  // Archetype specific grid frequencies and window characteristics
  let gridFreq = 'vec2(6.0, 4.6)';
  let windowAperture = 'step(0.16, uvInCell.x) * step(uvInCell.x, 0.84) * step(0.18, uvInCell.y) * step(uvInCell.y, 0.82)';
  let litThresholdWarm = '0.22';
  let litThresholdCool = '0.08';
  let isDatacenter = false;
  let isBrutalist = false;

  if (archetype === 'glass_skyscraper') {
    gridFreq = 'vec2(7.2, 5.2)';
    windowAperture = 'step(0.10, uvInCell.x) * step(uvInCell.x, 0.90) * step(0.12, uvInCell.y) * step(uvInCell.y, 0.88)';
    litThresholdWarm = '0.18';
  } else if (archetype === 'corporate_tower') {
    gridFreq = 'vec2(5.8, 4.4)';
    windowAperture = 'step(0.15, uvInCell.x) * step(uvInCell.x, 0.85) * step(0.20, uvInCell.y) * step(uvInCell.y, 0.80)';
    litThresholdWarm = '0.20';
  } else if (archetype === 'stepped_industrial') {
    gridFreq = 'vec2(4.2, 3.4)';
    windowAperture = 'step(0.20, uvInCell.x) * step(uvInCell.x, 0.80) * step(0.22, uvInCell.y) * step(uvInCell.y, 0.78)';
    litThresholdWarm = '0.35';
    litThresholdCool = '0.15';
  } else if (archetype === 'brutalist_tech') {
    isBrutalist = true;
    gridFreq = 'vec2(3.8, 3.6)';
    windowAperture = 'step(0.28, uvInCell.x) * step(uvInCell.x, 0.72) * step(0.32, uvInCell.y) * step(uvInCell.y, 0.68)';
    litThresholdWarm = '0.45';
    litThresholdCool = '0.25';
  } else if (archetype === 'research_facility') {
    gridFreq = 'vec2(5.5, 4.0)';
    windowAperture = 'step(0.08, uvInCell.x) * step(uvInCell.x, 0.92) * step(0.24, uvInCell.y) * step(uvInCell.y, 0.76)';
    litThresholdWarm = '0.30';
    litThresholdCool = '0.06';
  } else if (archetype === 'compact_residential') {
    gridFreq = 'vec2(5.0, 4.2)';
    windowAperture = 'step(0.22, uvInCell.x) * step(uvInCell.x, 0.78) * step(0.22, uvInCell.y) * step(uvInCell.y, 0.78)';
    litThresholdWarm = '0.15';
  } else if (archetype === 'datacenter') {
    isDatacenter = true;
    gridFreq = 'vec2(3.4, 8.5)';
    windowAperture = 'step(0.38, uvInCell.x) * step(uvInCell.x, 0.62) * step(0.14, uvInCell.y) * step(uvInCell.y, 0.86)';
    litThresholdWarm = '0.85';
    litThresholdCool = '0.40';
  } else if (archetype === 'monumental_landmark') {
    gridFreq = 'vec2(6.8, 5.0)';
    windowAperture = 'step(0.14, uvInCell.x) * step(uvInCell.x, 0.86) * step(0.16, uvInCell.y) * step(uvInCell.y, 0.84)';
    litThresholdWarm = '0.18';
  }

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
       // Calibrated Nocturnal Architectural Facade Shader with Depth & Contrast

       // Detect whether building instance is crimson/hotspot (high risk)
       float isCrimson = step(diffuseColor.g + 0.12, diffuseColor.r) * step(diffuseColor.b + 0.10, diffuseColor.r);
       float crimsonPulse = 0.85 + 0.25 * sin(uTime * 2.2);

       // Active metric color passed via instanced mesh color
       vec3 metricColor = diffuseColor.rgb;

       // 1. Facade Vertical Walls
       if (abs(vModelNormal.y) < 0.40) {
         vec2 wallCoord = abs(vModelNormal.x) > 0.40 ? vWorldPos.zy : vWorldPos.xy;

         vec2 gridPos = wallCoord * ${gridFreq};
         vec2 cell = floor(gridPos);
         vec2 uvInCell = fract(gridPos);

         float isWindow = ${windowAperture};

         float instanceLuma = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
         float isDimmed = step(instanceLuma, 0.12);
         float dimFactor = mix(1.0, 0.20, isDimmed);

         if (isWindow > 0.5) {
           float h = hashWindow(cell);
           float flicker = 1.0;
           if (h > 0.94) {
             flicker = 0.85 + 0.15 * sin(uTime * 4.5 + h * 6.28);
           }

           // Inner window pane recessed shadow & reveal bevel
           float revealShadow = smoothstep(0.12, 0.24, uvInCell.x) * smoothstep(0.86, 0.74, uvInCell.y);
           float sillHighlight = mix(0.75, 1.0, smoothstep(0.16, 0.26, uvInCell.y));
           float paneDepth = revealShadow * sillHighlight;

           vec3 winColor = vec3(0.012, 0.018, 0.028); // Dark tinted unlit glass

           ${isDatacenter ? `
           // Server rack indicator LED slits
           if (h > ${litThresholdCool}) {
             winColor = mix(vec3(0.20, 0.85, 0.95), vec3(0.10, 0.95, 0.50), step(0.65, h)) * 1.35;
           }
           ` : isBrutalist ? `
           // High-security restrained window slits
           if (h > ${litThresholdWarm}) {
             winColor = vec3(1.0, 0.72, 0.35) * 1.30;
           } else if (h > ${litThresholdCool}) {
             winColor = vec3(0.35, 0.75, 0.92) * 1.15;
           }
           ` : `
           // Living interior offices & residential lighting
           if (h > ${litThresholdWarm}) {
             winColor = vec3(1.0, 0.78, 0.40) * 1.50; // Warm golden amber interior
           } else if (h > ${litThresholdCool}) {
             winColor = vec3(0.40, 0.82, 0.98) * 1.30; // Cool cyan office glow
           }
           `}

           // Subtle metric harmonization (preserves architectural realism)
           winColor = mix(winColor, metricColor * 1.40, 0.18);

           // Controlled pulsing crimson accent on critical high-risk landmarks
           if (isCrimson > 0.5 && h > 0.20) {
             winColor = mix(winColor, vec3(1.0, 0.24, 0.12) * 1.65, 0.35 * crimsonPulse);
           }

           // Blend into window surface with physical depth
           gl_FragColor.rgb = mix(gl_FragColor.rgb * 0.12, winColor * flicker * paneDepth * dimFactor, 0.92);
         } else {
           // Dark metallic spandrel / structural mullion framing
           gl_FragColor.rgb = gl_FragColor.rgb * 0.14;

           // Subtle floor divider reveal lines
           float floorSlab = step(0.92, uvInCell.y) + step(uvInCell.y, 0.08);
           gl_FragColor.rgb += vec3(0.02, 0.04, 0.07) * floorSlab;
         }

         // Sleek corner buttress pilasters
         float isCorner = step(0.44, abs(vObjectPos.x)) * step(0.44, abs(vObjectPos.z));
         if (isCorner > 0.5) {
           if (isCrimson > 0.5) {
             gl_FragColor.rgb = vec3(1.0, 0.16, 0.08) * (1.8 + 0.35 * sin(uTime * 2.2));
           } else {
             gl_FragColor.rgb = metricColor * 1.65 * dimFactor;
           }
         }

         // Mid-tower architectural floor reveal belt
         float isMidBelt = step(0.585, vObjectPos.y) * step(vObjectPos.y, 0.615);
         if (isMidBelt > 0.5) {
           if (isCrimson > 0.5) {
             gl_FragColor.rgb += vec3(1.0, 0.18, 0.10) * 1.35 * crimsonPulse;
           } else {
             gl_FragColor.rgb += metricColor * 1.40 * dimFactor;
           }
         }

         // Rooftop crown frame
         float isCrown = step(0.975, vObjectPos.y);
         if (isCrown > 0.5) {
           if (isCrimson > 0.5) {
             gl_FragColor.rgb = vec3(1.0, 0.16, 0.08) * (1.9 + 0.35 * sin(uTime * 2.2));
           } else {
             gl_FragColor.rgb = metricColor * 1.85 * dimFactor;
           }
         }

         // Soft vertical gradient from grounded plinth to crown
         float vertGrad = mix(0.78, 1.10, clamp(vObjectPos.y, 0.0, 1.0));
         gl_FragColor.rgb *= vertGrad;

         // Fresnel rim lighting for razor-sharp silhouette readability
         float fresnel = pow(1.0 - max(0.0, dot(vModelNormal, vViewDir)), 3.2);
         gl_FragColor.rgb += vec3(0.02, 0.09, 0.18) * fresnel * dimFactor;
       }
       // 2. Rooftop Surfaces
       else if (vModelNormal.y > 0.40) {
         gl_FragColor.rgb = gl_FragColor.rgb * 0.18;

         vec2 roofPos = fract(vWorldPos.xz * 0.45);
         float borderDist = min(min(roofPos.x, 1.0 - roofPos.x), min(roofPos.y, 1.0 - roofPos.y));

         if (isCrimson > 0.5) {
           if (borderDist < 0.06) {
             gl_FragColor.rgb = vec3(1.0, 0.16, 0.08) * (2.1 + 0.35 * sin(uTime * 2.2));
           }
         } else {
           if (borderDist < 0.05) {
             gl_FragColor.rgb = metricColor * 1.65;
           }
         }
       }`
    );
  };

  return mat;
}
