import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';

import type { FileNode, ColorMode, GraphEdge, DistrictZone } from '../../types';
import { computeCityLayout, getBuildingColorHex } from '../../utils/cityLayout';
import {
  ALL_ARCHETYPES,
  BuildingArchetype,
  getBuildingArchetype,
  createArchetypeGeometries,
  createArchitecturalFacadeMaterial,
  ARCHETYPE_NAMES,
} from './architecturalArchetypes';
import { EnvironmentalDetails } from './EnvironmentalDetails';
import { InSceneBuildingBadges } from './InSceneBuildingBadges';
import { CyberCityGround } from './CyberCityGround';
import { SkylineBackdrop } from './SkylineBackdrop';
import { DependencySkybridges } from './DependencySkybridges';
import { SelectionMarker } from './SelectionMarker';
import { BlastRadiusArcs } from './BlastRadiusArcs';
import { VolumetricSearchlights } from './VolumetricSearchlights';
import { LandmarkBeacons } from './LandmarkBeacons';
import { AtmosphericParticles } from './AtmosphericParticles';
import { RadialContextMenu } from './RadialContextMenu';
import { soundFx } from '../../utils/soundEffects';
import { useCityStore } from '../../store/useCityStore';

interface CitySceneProps {
  files: FileNode[];
  graphEdges?: GraphEdge[];
  selectedFile: FileNode | null;
  hoveredFile: FileNode | null;
  colorMode: ColorMode;
  riskThreshold: number;
  maxHopDepth: number;
  searchQuery: string;
  selectedDirectory: string | null;
  presentationMode: boolean;
  lowPowerMode?: boolean;
  cameraResetTrigger?: number;
  hideHtmlLabels?: boolean;
  onSelectFile: (file: FileNode | null) => void;
  onHoverFile: (file: FileNode | null) => void;
}

// Cinematic Camera Controller with Inertial Damping & Multi-Stage Establishing Intro
function CameraController({
  targetFile,
  focusedDistrict,
  allBuildingsMap,
  bounds,
  presentationMode,
  cameraResetTrigger = 0,
  isIntroActive,
  onIntroComplete,
}: {
  targetFile: FileNode | null;
  focusedDistrict: DistrictZone | null;
  allBuildingsMap: Map<string, FileNode>;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  presentationMode: boolean;
  cameraResetTrigger?: number;
  isIntroActive: boolean;
  onIntroComplete: () => void;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const introAnimRef = useRef<number | null>(null);

  // Compute optimal default overview framing
  const { defaultCamPos, defaultTarget, highIntroPos, midIntroPos } = useMemo(() => {
    const spanX = bounds.maxX - bounds.minX;
    const spanZ = bounds.maxZ - bounds.minZ;
    const maxSpan = Math.max(spanX, spanZ);

    const camDist = Math.max(34, Math.min(130, maxSpan * 1.45));
    const target = new THREE.Vector3(0, 0, 0);

    return {
      defaultCamPos: new THREE.Vector3(30.0, 32.0, 36.0),
      defaultTarget: new THREE.Vector3(0.0, 3.5, 0.0),
      // High establishing altitude: looking across the distant skyline
      highIntroPos: new THREE.Vector3(45.0, 52.0, 52.0),
      // Mid descent point sweeping over the districts
      midIntroPos: new THREE.Vector3(36.0, 40.0, 42.0),
    };
  }, [bounds]);

  // 1. Choreographed 4-Stage Cinematic Establishing Intro
  useEffect(() => {
    if (!isIntroActive) return;

    camera.position.copy(highIntroPos);
    if (controlsRef.current) {
      controlsRef.current.target.copy(defaultTarget);
      controlsRef.current.update();
    }

    const startTime = performance.now();
    const duration = 2400; // 2.4s sweep

    const animateIntro = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1.0, elapsed / duration);

      let currentPos: THREE.Vector3;
      if (progress < 0.5) {
        const t1 = progress / 0.5;
        const ease1 = t1 * t1 * (3 - 2 * t1);
        currentPos = new THREE.Vector3().lerpVectors(highIntroPos, midIntroPos, ease1);
      } else {
        const t2 = (progress - 0.5) / 0.5;
        const ease2 = 1 - Math.pow(1 - t2, 3);
        currentPos = new THREE.Vector3().lerpVectors(midIntroPos, defaultCamPos, ease2);
      }

      camera.position.copy(currentPos);
      if (controlsRef.current) {
        controlsRef.current.target.copy(defaultTarget);
        controlsRef.current.update();
      }

      if (progress < 1.0) {
        introAnimRef.current = requestAnimationFrame(animateIntro);
      } else {
        onIntroComplete();
      }
    };

    introAnimRef.current = requestAnimationFrame(animateIntro);

    return () => {
      if (introAnimRef.current) cancelAnimationFrame(introAnimRef.current);
    };
  }, [isIntroActive, highIntroPos, midIntroPos, defaultCamPos, defaultTarget, camera, onIntroComplete]);

  // 2. Camera Reset Handler
  useEffect(() => {
    if (cameraResetTrigger > 0) {
      soundFx.playWhoosh();
      const startTime = performance.now();
      const startCam = camera.position.clone();
      const startTarget = controlsRef.current ? controlsRef.current.target.clone() : new THREE.Vector3(0, 0, 0);

      const animateReset = () => {
        const elapsed = (performance.now() - startTime) / 650;
        const t = Math.min(1.0, elapsed);
        const ease = 1 - Math.pow(1 - t, 3);

        camera.position.lerpVectors(startCam, defaultCamPos, ease);
        if (controlsRef.current) {
          controlsRef.current.target.lerpVectors(startTarget, defaultTarget, ease);
          controlsRef.current.update();
        }

        if (t < 1.0) {
          requestAnimationFrame(animateReset);
        }
      };
      requestAnimationFrame(animateReset);
    }
  }, [cameraResetTrigger, defaultCamPos, defaultTarget, camera]);

  // 3. Selection Fly-To Animation (Contextual camera framing)
  useEffect(() => {
    if (!targetFile || isIntroActive) return;
    const resolved = allBuildingsMap.get(targetFile.id) || allBuildingsMap.get(targetFile.path) || targetFile;
    if (resolved && resolved.x !== undefined && resolved.z !== undefined) {
      soundFx.playWhoosh();
      const destTarget = new THREE.Vector3(resolved.x * 0.15, 3.5, resolved.z * 0.15);
      const destCam = new THREE.Vector3(
        resolved.x * 0.15 + 30.0,
        32.0,
        resolved.z * 0.15 + 36.0
      );

      const startTime = performance.now();
      const startCam = camera.position.clone();
      const startTarget = controlsRef.current
        ? controlsRef.current.target.clone()
        : new THREE.Vector3(0, 0, 0);

      const animateCam = () => {
        const elapsed = (performance.now() - startTime) / 600;
        const t = Math.min(1.0, elapsed);
        const ease = 1 - Math.pow(1 - t, 3);

        camera.position.lerpVectors(startCam, destCam, ease);
        if (controlsRef.current) {
          controlsRef.current.target.lerpVectors(startTarget, destTarget, ease);
          controlsRef.current.update();
        }

        if (t < 1.0) {
          requestAnimationFrame(animateCam);
        }
      };
      requestAnimationFrame(animateCam);
    }
  }, [targetFile, allBuildingsMap, camera, isIntroActive]);

  // 4. District Zoom-in on Double-Click
  useEffect(() => {
    if (!focusedDistrict || isIntroActive) return;
    soundFx.playWhoosh();
    const destTarget = new THREE.Vector3(focusedDistrict.x, (focusedDistrict.maxBuildingHeight || 4) * 0.4, focusedDistrict.z);
    const radius = Math.max(focusedDistrict.width, focusedDistrict.depth) * 1.25;
    const destCam = new THREE.Vector3(
      focusedDistrict.x + radius * 0.65,
      radius * 0.75 + 6,
      focusedDistrict.z + radius * 0.70
    );

    const startTime = performance.now();
    const startCam = camera.position.clone();
    const startTarget = controlsRef.current ? controlsRef.current.target.clone() : new THREE.Vector3(0, 0, 0);

    const animateDistrict = () => {
      const elapsed = (performance.now() - startTime) / 600;
      const t = Math.min(1.0, elapsed);
      const ease = 1 - Math.pow(1 - t, 3);

      camera.position.lerpVectors(startCam, destCam, ease);
      if (controlsRef.current) {
        controlsRef.current.target.lerpVectors(startTarget, destTarget, ease);
        controlsRef.current.update();
      }

      if (t < 1.0) {
        requestAnimationFrame(animateDistrict);
      }
    };
    requestAnimationFrame(animateDistrict);
  }, [focusedDistrict, camera, isIntroActive]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      maxPolarAngle={Math.PI / 2.05}
      minDistance={5}
      maxDistance={290}
      autoRotate={presentationMode}
      autoRotateSpeed={0.65}
      onStart={() => {
        if (isIntroActive) onIntroComplete();
      }}
    />
  );
}

// Procedural Architectural Metropolis (All 10 Architectural Archetypes)
function ProceduralArchitecturalMetropolis({
  buildings,
  selectedFile,
  hoveredFile,
  colorMode,
  riskThreshold,
  maxHopDepth,
  searchQuery,
  selectedDirectory,
  lowPowerMode,
  onSelectFile,
  onHoverFile,
  onContextMenuFile,
}: {
  buildings: FileNode[];
  selectedFile: FileNode | null;
  hoveredFile: FileNode | null;
  colorMode: ColorMode;
  riskThreshold: number;
  maxHopDepth: number;
  searchQuery: string;
  selectedDirectory: string | null;
  lowPowerMode?: boolean;
  onSelectFile: (file: FileNode | null) => void;
  onHoverFile: (file: FileNode | null) => void;
  onContextMenuFile: (e: any, file: FileNode) => void;
}) {
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  // Shared Procedural Geometries for 10 Architectural Archetypes
  const archetypeGeometries = useMemo(() => createArchetypeGeometries(), []);

  // Shared Procedural Architectural Facade Shader Material
  const facadeMaterial = useMemo(() => createArchitecturalFacadeMaterial(), []);

  // Group buildings by deterministically assigned archetype
  const { buildingsByArchetype } = useMemo(() => {
    const groups: Record<BuildingArchetype, FileNode[]> = {
      glass_skyscraper: [],
      corporate_tower: [],
      stepped_industrial: [],
      brutalist_tech: [],
      research_facility: [],
      compact_residential: [],
      datacenter: [],
      multisection_complex: [],
      telecom_spire: [],
      monumental_landmark: [],
    };

    buildings.forEach((b, i) => {
      const arch = getBuildingArchetype(b, i);
      b.archetype = arch;
      groups[arch].push(b);
    });

    return { buildingsByArchetype: groups };
  }, [buildings]);

  // Map blast radius dependents by hop
  const dependentHopsMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!selectedFile) return map;
    const hops = selectedFile.blast_radius?.hops || {};
    for (let h = 1; h <= Math.min(3, maxHopDepth); h++) {
      const list = (hops as any)[h] || (hops as any)[String(h)] || [];
      for (const p of list) {
        map.set(p, h);
        map.set(p.replace(/^\//, ''), h);
        map.set(`/${p}`, h);
      }
    }
    return map;
  }, [selectedFile, maxHopDepth]);

  // InstancedMesh references for all 10 archetypes
  const meshRefs = useRef<Record<BuildingArchetype, THREE.InstancedMesh | null>>({
    glass_skyscraper: null,
    corporate_tower: null,
    stepped_industrial: null,
    brutalist_tech: null,
    research_facility: null,
    compact_residential: null,
    datacenter: null,
    multisection_complex: null,
    telecom_spire: null,
    monumental_landmark: null,
  });

  // Time-driven shader animations (crimson pulse, window flicker)
  useFrame(({ clock }) => {
    if (facadeMaterial.userData.shader && !lowPowerMode) {
      facadeMaterial.userData.shader.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  // Update instance transformations and colors
  useEffect(() => {
    ALL_ARCHETYPES.forEach((arch) => {
      const mesh = meshRefs.current[arch];
      const list = buildingsByArchetype[arch];
      if (!mesh || !list) return;

      const count = list.length;
      for (let i = 0; i < count; i++) {
        const b = list[i];
        const isHovered = hoveredFile && (b.id === hoveredFile.id || b.path === hoveredFile.path);

        // Hover spring lift: building lifts +0.4m smoothly
        const yOffset = isHovered ? 0.40 : 0.0;
        dummy.position.set(b.x || 0, yOffset, b.z || 0);
        dummy.scale.set(b.width || 1, b.height || 1, b.depth || 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);

        // Filter evaluation
        const matchesSearch = !searchQuery || b.path.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDir = !selectedDirectory || b.directory === selectedDirectory;
        const matchesRisk = b.risk_probability >= riskThreshold;
        const isFilteredOut = !matchesSearch || !matchesDir || !matchesRisk;

        const baseHex = getBuildingColorHex(b, colorMode);
        tempColor.set(baseHex);

        if (selectedFile) {
          if (b.id === selectedFile.id || b.path === selectedFile.path) {
            // High risk selected building stays vibrant neon crimson red, otherwise cyber cyan
            if (b.risk_probability >= 0.5 || b.is_hotspot) {
              tempColor.set('#f43f5e');
            } else {
              tempColor.set('#38bdf8');
            }
          } else if (dependentHopsMap.has(b.id) || dependentHopsMap.has(b.path)) {
            // Dependent building: color coded by hop
            const hop = dependentHopsMap.get(b.id) ?? dependentHopsMap.get(b.path);
            if (hop === 1) tempColor.set('#38bdf8'); // Direct cyan
            else if (hop === 2) tempColor.set('#c084fc'); // Indirect violet
            else tempColor.set('#fb7185'); // Transitive rose
          } else {
            // Unrelated buildings dim into deep midnight void
            tempColor.lerp(new THREE.Color('#030712'), 0.90);
          }
        } else if (isFilteredOut) {
          tempColor.lerp(new THREE.Color('#030610'), 0.92);
        } else if (isHovered) {
          tempColor.offsetHSL(0, 0, 0.35);
        }

        mesh.setColorAt(i, tempColor);
      }

      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true;
      }
    });
  }, [
    buildingsByArchetype,
    selectedFile,
    hoveredFile,
    colorMode,
    riskThreshold,
    searchQuery,
    selectedDirectory,
    dependentHopsMap,
    dummy,
    tempColor,
  ]);

  return (
    <group name="architectural-metropolis">
      {ALL_ARCHETYPES.map((arch) => {
        const list = buildingsByArchetype[arch];
        if (!list || list.length === 0) return null;

        return (
          <instancedMesh
            key={`archetype-mesh-${arch}`}
            ref={(el) => {
              meshRefs.current[arch] = el;
            }}
            args={[archetypeGeometries[arch], facadeMaterial, list.length]}
            onPointerMove={(e) => {
              e.stopPropagation();
              if (e.instanceId !== undefined && list[e.instanceId]) {
                const b = list[e.instanceId];
                if (hoveredFile?.id !== b.id) {
                  soundFx.playHoverTick();
                  onHoverFile(b);
                }
              }
            }}
            onPointerOut={() => onHoverFile(null)}
            onClick={(e) => {
              e.stopPropagation();
              if (e.instanceId !== undefined && list[e.instanceId]) {
                const clicked = list[e.instanceId];
                soundFx.playClick();
                onSelectFile(selectedFile?.id === clicked.id ? null : clicked);
              }
            }}
            onContextMenu={(e) => {
              e.stopPropagation();
              if (e.instanceId !== undefined && list[e.instanceId]) {
                onContextMenuFile(e, list[e.instanceId]);
              }
            }}
          />
        );
      })}
    </group>
  );
}

// District Frosted-Glass Plates with Floating Billboarded Labels (Strictly Above Buildings)
function CleanDistrictPlates({
  districts,
  hideHtmlLabels,
  onDistrictDoubleClick,
}: {
  districts: DistrictZone[];
  hideHtmlLabels?: boolean;
  onDistrictDoubleClick: (d: DistrictZone) => void;
}) {
  return (
    <group>
      {districts.map((d, i) => (
        <group
          key={`clean-district-${d.path}-${i}`}
          position={[d.x, -0.04, d.z]}
          onDoubleClick={(e) => {
            e.stopPropagation();
            onDistrictDoubleClick(d);
          }}
        >
          {/* Frosted Glass District Platform */}
          <mesh>
            <boxGeometry args={[d.width, 0.08, d.depth]} />
            <meshStandardMaterial
              color="#070d1a"
              roughness={0.42}
              metalness={0.65}
              transparent
              opacity={0.85}
            />
          </mesh>

          {/* Luminous Glowing Boundary Border */}
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(d.width, 0.08, d.depth)]} />
            <lineBasicMaterial color={d.color} transparent opacity={0.60} />
          </lineSegments>

          {/* Floating In-Scene District Label: Positioned STRICTLY ABOVE all buildings in this district */}
          {!hideHtmlLabels && d.fileCount !== 7 && (
            <Html
              position={[d.width * 0.38, (d.maxBuildingHeight || 4.0) + 3.8, -d.depth * 0.38]}
              center
              distanceFactor={44}
              zIndexRange={[1, 12]}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playClick();
                  onDistrictDoubleClick(d);
                }}
                className="cursor-pointer pointer-events-auto px-4 py-2 rounded-2xl bg-cyan-950/70 border border-cyan-400/80 shadow-[0_0_18px_rgba(6,182,212,0.55)] backdrop-blur-xl text-center select-none"
                title="District Platform"
              >
                <div className="font-bold text-xs text-cyan-200 font-mono tracking-wide">{d.name}</div>
                <div className="text-[10px] text-cyan-400/80 font-mono mt-0.5">{d.fileCount} files</div>
              </div>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}

// Procedural Sunset Twilight Sky Texture matching reference image
function createSunsetSkyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 512, 0, 0);
  grad.addColorStop(0.00, '#02050e'); // ground depth
  grad.addColorStop(0.30, '#040916'); // horizon base
  grad.addColorStop(0.42, '#ea580c'); // rich amber/orange sunset glow
  grad.addColorStop(0.50, '#9a3412'); // warm dusk rose
  grad.addColorStop(0.62, '#0c2d4a'); // twilight dusk cyan
  grad.addColorStop(0.80, '#030816'); // deep midnight navy
  grad.addColorStop(1.00, '#010206');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

export const CityScene: React.FC<CitySceneProps> = ({
  files,
  graphEdges = [],
  selectedFile,
  hoveredFile,
  colorMode,
  riskThreshold,
  maxHopDepth,
  searchQuery,
  selectedDirectory,
  presentationMode,
  lowPowerMode = false,
  cameraResetTrigger = 0,
  hideHtmlLabels = false,
  onSelectFile,
  onHoverFile,
}) => {
  const skyTexture = useMemo(() => createSunsetSkyTexture(), []);
  const { buildings, districts, bounds, isSparse } = useMemo(() => computeCityLayout(files), [files]);
  const [isIntroActive, setIsIntroActive] = useState(true);
  const [focusedDistrict, setFocusedDistrict] = useState<DistrictZone | null>(null);

  // Radial quick-action menu state
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    pos: { x: number; y: number } | null;
    file: FileNode | null;
  }>({
    isOpen: false,
    pos: null,
    file: null,
  });

  const {
    pinnedFiles,
    togglePinFile,
    showDecorativeSkyline,
    simulateFailure,
  } = useCityStore();

  const handleSkipIntro = useCallback(() => {
    setIsIntroActive(false);
  }, []);

  const allBuildingsMap = useMemo(() => {
    const map = new Map<string, FileNode>();
    for (const b of buildings) {
      map.set(b.path, b);
      map.set(b.id, b);
    }
    return map;
  }, [buildings]);

  const handleContextMenu = useCallback((e: any, file: FileNode) => {
    e.nativeEvent?.preventDefault?.();
    setContextMenu({
      isOpen: true,
      pos: { x: e.clientX, y: e.clientY },
      file,
    });
  }, []);

  const isFilePinned = useMemo(() => {
    if (!contextMenu.file) return false;
    return pinnedFiles.some((f) => f.id === contextMenu.file?.id || f.path === contextMenu.file?.path);
  }, [contextMenu.file, pinnedFiles]);

  return (
    <div
      className="relative w-full h-full select-none bg-[#02050e]"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Canvas
        camera={{ position: [30, 32, 36], fov: 36 }}
        dpr={lowPowerMode ? [1, 1] : [1, 2]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onPointerMissed={() => {
          onSelectFile(null);
          setFocusedDistrict(null);
          setContextMenu((prev) => ({ ...prev, isOpen: false }));
        }}
      >
        <primitive object={skyTexture} attach="background" />
        <fog attach="fog" args={['#050e22', 130, 340]} />

        {/* Directional, Ambient, & Hemisphere Lighting */}
        <ambientLight intensity={0.65} color="#fed7aa" />
        <directionalLight
          position={[70, 110, 60]}
          intensity={1.45}
          color="#f8fafc"
          castShadow={false}
        />
        <hemisphereLight args={['#38bdf8', '#010308', 0.55]} />
        <pointLight position={[0, 50, 0]} intensity={0.85} color="#06b6d4" distance={220} />

        {/* Dark Glossy Ground with Soft Reflections & Fading Grid (Zero Stray Dashes) */}
        <CyberCityGround lowPowerMode={lowPowerMode} />

        {/* Small Decorative Industrial & Environmental Details (Streetlights, Light Pools, Transformers) */}
        <EnvironmentalDetails
          districts={districts}
          buildings={buildings}
          lowPowerMode={lowPowerMode}
        />

        {/* Cinematic Atmospheric Searchlights */}
        <VolumetricSearchlights lowPowerMode={lowPowerMode} />

        {/* Distant Megalopolis Context Skyline (for small repos & depth) */}
        {showDecorativeSkyline && <SkylineBackdrop lowPowerMode={lowPowerMode} />}

        {/* Floating Drifting Dust / Firefly Particles */}
        <AtmosphericParticles lowPowerMode={lowPowerMode} />

        {/* Frosted Glass District Plates with Labels Strictly Above Buildings */}
        {/* In-Scene Floating 3D Billboard Badges for Buildings */}
        <InSceneBuildingBadges
          buildings={buildings}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
          hideHtmlLabels={hideHtmlLabels || presentationMode}
        />

        <CleanDistrictPlates
          districts={districts}
          hideHtmlLabels={hideHtmlLabels || presentationMode}
          onDistrictDoubleClick={(d) => setFocusedDistrict(d)}
        />

        {/* Top-Impact Landmark Beacons with Holographic Beams */}
        <LandmarkBeacons
          buildings={buildings}
          selectedFile={selectedFile}
          hideHtmlLabels={hideHtmlLabels || presentationMode}
          lowPowerMode={lowPowerMode}
        />

        {/* Ambient Real Dependency Skybridges & Conduits */}
        <DependencySkybridges
          graphEdges={graphEdges}
          allBuildingsMap={allBuildingsMap}
          selectedFile={selectedFile}
          lowPowerMode={lowPowerMode}
        />

        {/* Procedural Architectural Metropolis (All 10 Architectural Archetypes) */}
        <ProceduralArchitecturalMetropolis
          buildings={buildings}
          selectedFile={selectedFile}
          hoveredFile={hoveredFile}
          colorMode={colorMode}
          riskThreshold={riskThreshold}
          maxHopDepth={maxHopDepth}
          searchQuery={searchQuery}
          selectedDirectory={selectedDirectory}
          lowPowerMode={lowPowerMode}
          onSelectFile={onSelectFile}
          onHoverFile={onHoverFile}
          onContextMenuFile={handleContextMenu}
        />

        {/* Ground Selection Reticle & Holographic Column */}
        <SelectionMarker selectedFile={selectedFile} />

        {/* Signature Blast Radius: Shockwave Ring, Arcs, & Data Particles */}
        {selectedFile && (
          <BlastRadiusArcs
            selectedFile={selectedFile}
            allBuildingsMap={allBuildingsMap}
            maxHopDepth={maxHopDepth}
            lowPowerMode={lowPowerMode}
          />
        )}

        {/* Cinematic Camera Controller */}
        <CameraController
          targetFile={selectedFile}
          focusedDistrict={focusedDistrict}
          allBuildingsMap={allBuildingsMap}
          bounds={bounds}
          presentationMode={presentationMode}
          cameraResetTrigger={cameraResetTrigger}
          isIntroActive={isIntroActive}
          onIntroComplete={() => setIsIntroActive(false)}
        />

        {/* Selective Postprocessing: Bloom, Chromatic Aberration, & Vignette */}
        {!lowPowerMode && (
          <EffectComposer multisampling={4}>
            <Bloom
              luminanceThreshold={0.34}
              luminanceSmoothing={0.26}
              intensity={0.88}
              radius={0.46}
            />
            <ChromaticAberration
              offset={new THREE.Vector2(0.0011, 0.0011)}
              radialModulation
              modulationOffset={0.25}
            />
            <Vignette darkness={0.55} offset={0.32} />
          </EffectComposer>
        )}
      </Canvas>

      {/* Skip Cinematic Intro Pill */}
      {isIntroActive && (
        <button
          onClick={handleSkipIntro}
          className="absolute top-4 right-4 z-20 glass-panel px-3 py-1.5 rounded-full text-xs font-mono text-slate-300 hover:text-white border border-white/10 hover:border-cyan-500/50 transition-all flex items-center space-x-1.5 shadow-glass-panel"
        >
          <span>Skip Intro</span>
          <kbd className="text-[10px] text-slate-500 bg-black/40 px-1 py-0.5 rounded">Esc</kbd>
        </button>
      )}

      {/* Radial Quick-Action Context Menu */}
      <RadialContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.pos}
        file={contextMenu.file}
        isPinned={isFilePinned}
        onClose={() => setContextMenu((prev) => ({ ...prev, isOpen: false }))}
        onInspectBlastRadius={(file) => onSelectFile(file)}
        onSimulateFailure={(file) => simulateFailure(file)}
        onCopyPath={(file) => {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(file.path);
          }
        }}
        onTogglePin={(file) => togglePinFile(file)}
      />

      {/* Floating Hover Tooltip with Motion Spring */}
      <AnimatePresence>
        {hoveredFile && !contextMenu.isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="pointer-events-none absolute bottom-28 left-1/2 -translate-x-1/2 glass-panel px-4 py-2.5 rounded-2xl flex items-center space-x-4 border border-cyan-500/40 text-xs shadow-glow-cyan z-20 backdrop-blur-2xl bg-slate-950/90"
          >
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan animate-pulse" />
              <span className="font-mono text-slate-100 font-semibold">{hoveredFile.filename}</span>
            </div>
            <div className="h-3 w-px bg-white/15" />
            <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
              {hoveredFile.archetype && (
                <span className="text-cyan-400 font-sans capitalize">
                  {ARCHETYPE_NAMES[hoveredFile.archetype as BuildingArchetype] || hoveredFile.archetype}
                </span>
              )}
              <span>
                Risk:{' '}
                <b className={hoveredFile.risk_probability >= 0.5 ? 'text-accent-rose' : 'text-accent-emerald'}>
                  {(hoveredFile.risk_probability * 100).toFixed(0)}%
                </b>
              </span>
              <span>LOC: <b className="text-slate-200">{hoveredFile.loc}</b></span>
              <span>CC: <b className="text-slate-200">{hoveredFile.max_complexity.toFixed(1)}</b></span>
              <span>Impact: <b className="text-accent-amber">{hoveredFile.impact_score.toFixed(2)}</b></span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
