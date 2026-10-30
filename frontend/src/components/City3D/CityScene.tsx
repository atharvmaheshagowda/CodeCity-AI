import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';

import type { FileNode, ColorMode, GraphEdge, DistrictZone } from '../../types';
import { computeCityLayout, getBuildingColorHex } from '../../utils/cityLayout';
import {
  ALL_TOWER_STYLES,
  TowerStyle,
  getTowerStyle,
  createCleanTowerGeometries,
  createCleanFacadeMaterial,
  TOWER_STYLE_NAMES,
} from './cleanTowers';
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

    const camDist = Math.max(28, Math.min(125, maxSpan * 1.35));
    const target = new THREE.Vector3(0, 0, 0);

    return {
      defaultCamPos: new THREE.Vector3(camDist * 0.70, camDist * 0.72, camDist * 0.82),
      defaultTarget: target,
      // High establishing altitude: looking across the distant skyline
      highIntroPos: new THREE.Vector3(camDist * 1.8, camDist * 1.9, camDist * 1.8),
      // Mid descent point sweeping over the districts
      midIntroPos: new THREE.Vector3(camDist * 1.1, camDist * 1.0, camDist * 1.3),
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
      const bHeight = resolved.height || 2;
      const destTarget = new THREE.Vector3(resolved.x, bHeight * 0.5, resolved.z);
      const destCam = new THREE.Vector3(
        resolved.x + Math.max(12, (resolved.width || 2) * 4.2),
        bHeight + 9.5,
        resolved.z + Math.max(14, (resolved.depth || 2) * 4.5)
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

// Procedural Clean Architectural Metropolis (5 Clean Tower Styles)
function ProceduralCleanMetropolis({
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

  // Shared Procedural Geometries for 5 Clean Tower Styles (No barrels, no spires)
  const towerGeometries = useMemo(() => createCleanTowerGeometries(), []);

  // Shared Procedural Clean Facade Shader Material
  const facadeMaterial = useMemo(() => createCleanFacadeMaterial(), []);

  // Group buildings by deterministically assigned style
  const { buildingsByStyle } = useMemo(() => {
    const groups: Record<TowerStyle, FileNode[]> = {
      monolith_tower: [],
      setback_highrise: [],
      cantilever_tower: [],
      twin_column_tower: [],
      landmark_monument: [],
    };

    buildings.forEach((b, i) => {
      const style = getTowerStyle(b, i);
      b.archetype = style;
      groups[style].push(b);
    });

    return { buildingsByStyle: groups };
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

  // InstancedMesh references for each style
  const meshRefs = useRef<Record<TowerStyle, THREE.InstancedMesh | null>>({
    monolith_tower: null,
    setback_highrise: null,
    cantilever_tower: null,
    twin_column_tower: null,
    landmark_monument: null,
  });

  // Time-driven shader animations (crimson pulse, window flicker)
  useFrame(({ clock }) => {
    if (facadeMaterial.userData.shader && !lowPowerMode) {
      facadeMaterial.userData.shader.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  // Update instance transformations and colors
  useEffect(() => {
    ALL_TOWER_STYLES.forEach((style) => {
      const mesh = meshRefs.current[style];
      const list = buildingsByStyle[style];
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
            // Selected building: high-intensity primary cyber cyan
            tempColor.set('#38bdf8');
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
    buildingsByStyle,
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
    <group>
      {ALL_TOWER_STYLES.map((style) => {
        const list = buildingsByStyle[style];
        if (!list || list.length === 0) return null;

        return (
          <instancedMesh
            key={`clean-tower-mesh-${style}`}
            ref={(el) => {
              meshRefs.current[style] = el;
            }}
            args={[towerGeometries[style], facadeMaterial, list.length]}
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
          {!hideHtmlLabels && (
            <Html
              position={[0, (d.maxBuildingHeight || 4.0) + 5.5, 0]}
              center
              distanceFactor={45}
              zIndexRange={[1, 8]}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playClick();
                  onDistrictDoubleClick(d);
                }}
                className="cursor-pointer pointer-events-auto px-2.5 py-0.5 rounded-full bg-slate-950/85 border border-cyan-400/30 text-[9px] font-mono text-slate-300 backdrop-blur-md whitespace-nowrap shadow-glass-panel hover:border-cyan-400/60 hover:text-white transition-all select-none scale-90"
                title="Double-click to zoom into district"
              >
                <span className="text-cyan-400 font-bold mr-1">/</span>
                <span className="font-semibold">{d.name}</span>
                <span className="text-[8px] text-slate-400 ml-1.5 font-sans">
                  ({d.fileCount} {d.fileCount === 1 ? 'file' : 'files'})
                </span>
              </div>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
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
        camera={{ position: [36, 42, 48], fov: 42 }}
        dpr={lowPowerMode ? [1, 1] : [1, 2]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onPointerMissed={() => {
          onSelectFile(null);
          setFocusedDistrict(null);
          setContextMenu((prev) => ({ ...prev, isOpen: false }));
        }}
      >
        <color attach="background" args={['#02050e']} />
        <fog attach="fog" args={['#02050e', 70, 280]} />

        {/* Directional, Ambient, & Hemisphere Lighting */}
        <ambientLight intensity={0.48} />
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

        {/* Cinematic Atmospheric Searchlights */}
        <VolumetricSearchlights lowPowerMode={lowPowerMode} />

        {/* Distant Megalopolis Context Skyline (for small repos & depth) */}
        {showDecorativeSkyline && <SkylineBackdrop lowPowerMode={lowPowerMode} />}

        {/* Floating Drifting Dust / Firefly Particles */}
        <AtmosphericParticles lowPowerMode={lowPowerMode} />

        {/* Frosted Glass District Plates with Labels Strictly Above Buildings */}
        <CleanDistrictPlates
          districts={districts}
          hideHtmlLabels={hideHtmlLabels || !!selectedFile || presentationMode}
          onDistrictDoubleClick={(d) => setFocusedDistrict(d)}
        />

        {/* Top-Impact Landmark Beacons with Holographic Beams */}
        <LandmarkBeacons
          buildings={buildings}
          selectedFile={selectedFile}
          hideHtmlLabels={hideHtmlLabels || !!selectedFile || presentationMode}
          lowPowerMode={lowPowerMode}
        />

        {/* Ambient Real Dependency Skybridges & Conduits */}
        <DependencySkybridges
          graphEdges={graphEdges}
          allBuildingsMap={allBuildingsMap}
          selectedFile={selectedFile}
          lowPowerMode={lowPowerMode}
        />

        {/* Procedural Clean Architectural Metropolis */}
        <ProceduralCleanMetropolis
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
              luminanceThreshold={0.32}
              luminanceSmoothing={0.28}
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
                  {TOWER_STYLE_NAMES[hoveredFile.archetype as TowerStyle] || hoveredFile.archetype}
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
