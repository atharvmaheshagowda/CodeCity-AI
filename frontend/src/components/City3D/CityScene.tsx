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
import { SkylineBackdrop, DistantMegalopolisHorizon } from './SkylineBackdrop';
import { DependencySkybridges } from './DependencySkybridges';
import { CouplingTunnels } from './CouplingTunnels';
import { SmellArcs } from './SmellArcs';
import { ActivePathBeam } from './ActivePathBeam';
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

// Cinematic Camera Controller with Inertial Damping, Centered Focus & Ambient Drift
function CameraController({
  targetFile,
  focusedDistrict,
  allBuildingsMap,
  bounds,
  presentationMode,
  cameraResetTrigger = 0,
  isIntroActive,
  onIntroComplete,
  lowPowerMode = false,
}: {
  targetFile: FileNode | null;
  focusedDistrict: DistrictZone | null;
  allBuildingsMap: Map<string, FileNode>;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  presentationMode: boolean;
  cameraResetTrigger?: number;
  isIntroActive: boolean;
  onIntroComplete: () => void;
  lowPowerMode?: boolean;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const introAnimRef = useRef<number | null>(null);
  const lastInteractionRef = useRef<number>(performance.now());
  const prevTargetFileRef = useRef<FileNode | null>(null);

  // Compute optimal default overview framing adapted to actual repository bounds
  const { defaultCamPos, defaultTarget, highIntroPos, midIntroPos } = useMemo(() => {
    const centerX = (bounds.minX + bounds.maxX) * 0.5;
    const centerZ = (bounds.minZ + bounds.maxZ) * 0.5;
    const spanX = Math.max(16, bounds.maxX - bounds.minX);
    const spanZ = Math.max(16, bounds.maxZ - bounds.minZ);
    const maxSpan = Math.max(spanX, spanZ);

    // Target slightly shifted along screen-X to account for persistent left HUD drawer
    const target = new THREE.Vector3(centerX - 1.2, 3.2, centerZ);

    // Dynamic camera distance tailored to repository footprint
    const camDist = Math.max(38, Math.min(88, maxSpan * 1.55));

    return {
      defaultCamPos: new THREE.Vector3(centerX + camDist * 0.72, camDist * 0.76, centerZ + camDist * 0.82),
      defaultTarget: target,
      // High establishing altitude: looking across the distant skyline
      highIntroPos: new THREE.Vector3(centerX + camDist * 1.05, camDist * 1.20, centerZ + camDist * 1.15),
      // Mid descent point sweeping over the districts
      midIntroPos: new THREE.Vector3(centerX + camDist * 0.85, camDist * 0.95, centerZ + camDist * 0.95),
    };
  }, [bounds]);

  // Track user interaction to intelligently suspend idle camera drift
  useEffect(() => {
    const onUserActive = () => {
      lastInteractionRef.current = performance.now();
    };

    window.addEventListener('pointerdown', onUserActive, { passive: true });
    window.addEventListener('wheel', onUserActive, { passive: true });
    window.addEventListener('keydown', onUserActive, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', onUserActive);
      window.removeEventListener('wheel', onUserActive);
      window.removeEventListener('keydown', onUserActive);
    };
  }, []);

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

  // 3. Selection Fly-To Animation (Contextual camera framing & smooth deselect return)
  useEffect(() => {
    if (isIntroActive) return;

    if (targetFile) {
      const resolved = allBuildingsMap.get(targetFile.id) || allBuildingsMap.get(targetFile.path) || targetFile;
      if (resolved && resolved.x !== undefined && resolved.z !== undefined) {
        soundFx.playWhoosh();
        const bHeight = resolved.height || 4;
        const destTarget = new THREE.Vector3(resolved.x - 1.2, bHeight * 0.45, resolved.z);
        const focusDist = Math.max(18, Math.min(38, bHeight * 1.85));
        const destCam = new THREE.Vector3(
          resolved.x + focusDist * 0.65,
          bHeight * 0.55 + focusDist * 0.60,
          resolved.z + focusDist * 0.75
        );

        const startTime = performance.now();
        const startCam = camera.position.clone();
        const startTarget = controlsRef.current ? controlsRef.current.target.clone() : new THREE.Vector3(0, 0, 0);

        const animateCam = () => {
          const elapsed = (performance.now() - startTime) / 620;
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
    } else if (prevTargetFileRef.current && !targetFile) {
      // Smooth return to overview when file is deselected
      const startTime = performance.now();
      const startCam = camera.position.clone();
      const startTarget = controlsRef.current ? controlsRef.current.target.clone() : new THREE.Vector3(0, 0, 0);

      const animateReturn = () => {
        const elapsed = (performance.now() - startTime) / 550;
        const t = Math.min(1.0, elapsed);
        const ease = 1 - Math.pow(1 - t, 3);

        camera.position.lerpVectors(startCam, defaultCamPos, ease);
        if (controlsRef.current) {
          controlsRef.current.target.lerpVectors(startTarget, defaultTarget, ease);
          controlsRef.current.update();
        }

        if (t < 1.0) {
          requestAnimationFrame(animateReturn);
        }
      };
      requestAnimationFrame(animateReturn);
    }

    prevTargetFileRef.current = targetFile;
  }, [targetFile, allBuildingsMap, camera, isIntroActive, defaultCamPos, defaultTarget]);

  // 4. District Zoom-in on Double-Click
  useEffect(() => {
    if (!focusedDistrict || isIntroActive) return;
    soundFx.playWhoosh();
    const destTarget = new THREE.Vector3(focusedDistrict.x - 1.0, (focusedDistrict.maxBuildingHeight || 4) * 0.4, focusedDistrict.z);
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

  // 5. Cinematic Ambient Idle Drift
  useFrame((_, delta) => {
    if (
      !targetFile &&
      !focusedDistrict &&
      !isIntroActive &&
      !presentationMode &&
      !lowPowerMode &&
      controlsRef.current
    ) {
      const idleTime = performance.now() - lastInteractionRef.current;
      if (idleTime > 3800) {
        // Slow orbital drift at ~0.0006 rad/frame
        const driftSpeed = 0.035 * delta;
        const cam = camera.position;
        const tgt = controlsRef.current.target;
        const dx = cam.x - tgt.x;
        const dz = cam.z - tgt.z;
        const cos = Math.cos(driftSpeed);
        const sin = Math.sin(driftSpeed);
        cam.x = tgt.x + (dx * cos - dz * sin);
        cam.z = tgt.z + (dx * sin + dz * cos);
        controlsRef.current.update();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      maxPolarAngle={Math.PI / 2.15}
      minDistance={10}
      maxDistance={140}
      onChange={() => {
        lastInteractionRef.current = performance.now();
      }}
      onStart={() => {
        lastInteractionRef.current = performance.now();
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
  const {
    activeLayers,
    breakingChangeResult,
    commitRiskResult,
    testImpactResult,
    timelapseResult,
    timelapseMonthIndex,
    simulatedFailedFile,
    simulateResult,
  } = useCityStore();

  // Map cascading failure dependents by hop
  const failureHopsMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!simulatedFailedFile) return map;
    if (simulateResult?.hops) {
      for (let h = 1; h <= 3; h++) {
        const steps = (simulateResult.hops as any)[h] || (simulateResult.hops as any)[String(h)] || [];
        for (const step of steps) {
          const p = step.file || step.file_path;
          if (p) {
            map.set(p, h);
            map.set(p.replace(/^\//, ''), h);
            map.set(`/${p}`, h);
          }
        }
      }
    } else {
      const hops = simulatedFailedFile.blast_radius?.hops || {};
      for (let h = 1; h <= 3; h++) {
        const list = (hops as any)[h] || (hops as any)[String(h)] || [];
        for (const p of list) {
          map.set(p, h);
          map.set(p.replace(/^\//, ''), h);
          map.set(`/${p}`, h);
        }
      }
    }
    return map;
  }, [simulatedFailedFile, simulateResult]);
  const tempColor = useMemo(() => new THREE.Color(), []);

  // Shared Procedural Geometries for 10 Architectural Archetypes
  const archetypeGeometries = useMemo(() => createArchetypeGeometries(), []);

  // Distinct Procedural Architectural Facade Shader Materials for each Archetype
  const facadeMaterials = useMemo(() => {
    const mats: Record<BuildingArchetype, THREE.MeshStandardMaterial> = {} as any;
    ALL_ARCHETYPES.forEach((arch) => {
      mats[arch] = createArchitecturalFacadeMaterial(arch);
    });
    return mats;
  }, []);

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

  // Time-driven shader animations across all archetype materials (crimson pulse, window flicker)
  useFrame(({ clock }) => {
    if (!lowPowerMode) {
      const time = clock.getElapsedTime();
      ALL_ARCHETYPES.forEach((arch) => {
        const mat = facadeMaterials[arch];
        if (mat && mat.userData.shader) {
          mat.userData.shader.uniforms.uTime.value = time;
        }
      });
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

        // Dynamic Timelapse Height Scaling & Wireframe Foundation
        let targetHeight = b.height || 1;
        let isUnborn = false;

        if (timelapseResult && timelapseResult.snapshots && timelapseResult.snapshots.length > 0) {
          const snapshot = timelapseResult.snapshots[timelapseMonthIndex];
          if (snapshot && snapshot.active_files) {
            const historical = snapshot.active_files[b.path];
            if (historical) {
              targetHeight = Math.max(1.2, Math.min(18.0, (historical.loc / 80.0) * 2.2));
            } else {
              targetHeight = 0.18;
              isUnborn = true;
            }
          }
        }

        // Hover spring lift: building lifts +0.4m smoothly
        const yOffset = isHovered ? 0.40 : 0.0;
        dummy.position.set(b.x || 0, isUnborn ? 0.04 : yOffset, b.z || 0);
        dummy.scale.set(b.width || 1, targetHeight, b.depth || 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);

        // Filter evaluation
        const matchesSearch = !searchQuery || b.path.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDir = !selectedDirectory || b.directory === selectedDirectory;
        const matchesRisk = b.risk_probability >= riskThreshold;
        const isFilteredOut = !matchesSearch || !matchesDir || !matchesRisk;

        const baseHex = getBuildingColorHex(b, colorMode);
        tempColor.set(baseHex);

        if (isUnborn) {
          // Unborn module at this git history milestone: flat wireframe foundation
          tempColor.set('#060b18');
        } else if (simulatedFailedFile) {
          // CASCADING FAILURE SIMULATION OVERLAY
          if (b.id === simulatedFailedFile.id || b.path === simulatedFailedFile.path) {
            // Failed origin building: pulsing warning crimson hazard
            tempColor.set('#ef4444');
          } else if (failureHopsMap.has(b.id) || failureHopsMap.has(b.path)) {
            const hop = failureHopsMap.get(b.id) ?? failureHopsMap.get(b.path) ?? 1;
            if (hop === 1) tempColor.set('#f97316'); // Direct failure dependent: Amber
            else if (hop === 2) tempColor.set('#e11d48'); // Indirect failure: Crimson
            else tempColor.set('#be123c'); // Transitive failure: Ruby
          } else {
            // Unrelated buildings dim cleanly
            tempColor.lerp(new THREE.Color('#030712'), 0.90);
          }
        } else if (breakingChangeResult && breakingChangeResult.broken_callers?.some((c) => c.caller_file === b.path)) {
          // Broken caller: strobing orange highlight
          tempColor.set('#f97316');
        } else if (commitRiskResult && commitRiskResult.touched_files?.includes(b.path)) {
          // PR touched file: pulsing violet
          tempColor.set('#c084fc');
        } else if (activeLayers.dangerZones && testImpactResult?.uncovered_danger_zones?.includes(b.path)) {
          // Untested danger zone: hazard amber
          tempColor.set('#f59e0b');
        } else if (
          activeLayers.busFactor &&
          (b.dominant_contributor_share ?? (b.distinct_authors === 1 ? 1.0 : 0.8)) >= 0.80 &&
          b.risk_probability >= 0.50
        ) {
          // Bus factor danger layer: pulsing rose-amber
          tempColor.set('#fb7185');
        } else if (selectedFile) {
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
    activeLayers.dangerZones,
    activeLayers.busFactor,
    breakingChangeResult,
    commitRiskResult,
    testImpactResult,
    timelapseResult,
    timelapseMonthIndex,
    simulatedFailedFile,
    simulateResult,
    failureHopsMap,
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
            args={[archetypeGeometries[arch], facadeMaterials[arch], list.length]}
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

// Procedural Nocturnal Sky Texture (Deep Navy, Indigo, & Midnight Teal Atmospheric Depth)
function createSunsetSkyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 512, 0, 0);
  grad.addColorStop(0.00, '#010308'); // Horizon abyss
  grad.addColorStop(0.24, '#030816'); // Distant ground baseline
  grad.addColorStop(0.38, '#071830'); // Atmospheric midnight teal/navy horizon haze
  grad.addColorStop(0.52, '#0c2744'); // Soft nocturnal Rayleigh glow
  grad.addColorStop(0.68, '#051124'); // Deep indigo transition
  grad.addColorStop(0.85, '#020612'); // Midnight navy
  grad.addColorStop(1.00, '#010206'); // Void zenith

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  return new THREE.CanvasTexture(canvas);
}

function createNeonSkyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 512, 0, 0);
  grad.addColorStop(0.00, '#020410');
  grad.addColorStop(0.25, '#050a22');
  grad.addColorStop(0.42, '#180a38'); // Electric violet twilight
  grad.addColorStop(0.55, '#0a2342'); // Cyan horizon accent
  grad.addColorStop(0.70, '#07102e'); // Deep blue
  grad.addColorStop(0.85, '#030514');
  grad.addColorStop(1.00, '#010208');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  return new THREE.CanvasTexture(canvas);
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
  const {
    pinnedFiles,
    togglePinFile,
    showDecorativeSkyline,
    simulatedFailedFile,
    simulateResult,
    simulateFailure,
    activeLayers,
    couplingResult,
    smellsResult,
    shortestPathResult,
    theme,
    setMaxHopDepth,
  } = useCityStore();

  const skyTexture = useMemo(() => (theme === 'neon' ? createNeonSkyTexture() : createSunsetSkyTexture()), [theme]);
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
          if (simulatedFailedFile) simulateFailure(null);
        }}
      >
        <primitive object={skyTexture} attach="background" />
        <fog attach="fog" args={[theme === 'neon' ? '#091533' : '#050e22', theme === 'neon' ? 100 : 130, 340]} />

        {/* Directional, Ambient, & Hemisphere Lighting (Calibrated for nocturnal contrast) */}
        <ambientLight intensity={theme === 'neon' ? 0.38 : 0.26} color={theme === 'neon' ? '#38bdf8' : '#cbd5e1'} />
        <directionalLight
          position={[65, 95, 55]}
          intensity={theme === 'neon' ? 0.95 : 0.68}
          color="#e2e8f0"
          castShadow={false}
        />
        <hemisphereLight args={[theme === 'neon' ? '#6366f1' : '#38bdf8', '#020617', theme === 'neon' ? 0.45 : 0.30]} />
        <pointLight position={[0, 45, 0]} intensity={theme === 'neon' ? 0.50 : 0.32} color={theme === 'neon' ? '#38bdf8' : '#0ea5e9'} distance={theme === 'neon' ? 220 : 180} />

        {/* Dark Glossy Ground with Soft Reflections & Fading Grid (Zero Stray Dashes) */}
        <CyberCityGround districts={districts} buildings={buildings} lowPowerMode={lowPowerMode} />

        {/* Small Decorative Industrial & Environmental Details (Streetlights, Light Pools, Transformers) */}
        <EnvironmentalDetails
          districts={districts}
          buildings={buildings}
          lowPowerMode={lowPowerMode}
        />

        {/* Cinematic Atmospheric Searchlights */}
        <VolumetricSearchlights lowPowerMode={lowPowerMode} />

        {/* Distant Megalopolis Context Skyline (for small repos & depth) */}
        {/* 360-Degree Distant Megalopolis Horizon (Situated at R = 140-185m in the far horizon) */}
        {showDecorativeSkyline && <DistantMegalopolisHorizon lowPowerMode={lowPowerMode} />}
        {showDecorativeSkyline && isSparse && <SkylineBackdrop lowPowerMode={lowPowerMode} />}

        {/* Floating Drifting Dust / Firefly Particles */}
        <AtmosphericParticles lowPowerMode={lowPowerMode} />

        {/* Frosted Glass District Plates with Labels Strictly Above Buildings */}
        {/* In-Scene Floating 3D Billboard Badges for Buildings */}
        <InSceneBuildingBadges
          buildings={buildings}
          districts={districts}
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
        {activeLayers.skybridges && (
          <DependencySkybridges
            graphEdges={graphEdges}
            allBuildingsMap={allBuildingsMap}
            selectedFile={selectedFile}
            hoveredFile={hoveredFile}
            lowPowerMode={lowPowerMode}
          />
        )}

        {/* Hidden Co-Change Coupling Tunnels (B1) */}
        {activeLayers.coupling && couplingResult?.pairs && (
          <CouplingTunnels
            pairs={couplingResult.pairs}
            allBuildingsMap={allBuildingsMap}
            selectedFile={selectedFile}
            lowPowerMode={lowPowerMode}
          />
        )}

        {/* Architecture Smell Loops (C3) */}
        {activeLayers.smells && smellsResult?.smells && (
          <SmellArcs
            smells={smellsResult.smells}
            allBuildingsMap={allBuildingsMap}
            lowPowerMode={lowPowerMode}
          />
        )}

        {/* Shortest Path Routing Beam (A5) */}
        {activeLayers.path && shortestPathResult && (
          <ActivePathBeam
            result={shortestPathResult}
            allBuildingsMap={allBuildingsMap}
            lowPowerMode={lowPowerMode}
          />
        )}

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

        {/* Signature Blast Radius or Cascading Failure Arcs */}
        {simulatedFailedFile ? (
          <BlastRadiusArcs
            selectedFile={simulatedFailedFile}
            allBuildingsMap={allBuildingsMap}
            maxHopDepth={maxHopDepth}
            isFailureSimulation={true}
            lowPowerMode={lowPowerMode}
          />
        ) : selectedFile ? (
          <BlastRadiusArcs
            selectedFile={selectedFile}
            allBuildingsMap={allBuildingsMap}
            maxHopDepth={maxHopDepth}
            isFailureSimulation={false}
            lowPowerMode={lowPowerMode}
          />
        ) : null}

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
          lowPowerMode={lowPowerMode}
        />

        {/* Selective Postprocessing: Bloom, Chromatic Aberration, & Vignette */}
        {!lowPowerMode && (
          <EffectComposer multisampling={4}>
            <Bloom
              luminanceThreshold={theme === 'neon' ? 0.78 : 0.84}
              luminanceSmoothing={0.18}
              intensity={theme === 'neon' ? 0.68 : 0.44}
              radius={0.32}
            />
            <ChromaticAberration
              offset={new THREE.Vector2(0.0006, 0.0006)}
              radialModulation
              modulationOffset={0.30}
            />
            <Vignette darkness={0.42} offset={0.38} />
          </EffectComposer>
        )}
      </Canvas>

      {/* Cascading Failure Simulation Top Banner */}
      <AnimatePresence>
        {simulatedFailedFile && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2 rounded-2xl glass-panel border border-rose-500/50 bg-slate-950/95 shadow-[0_0_24px_rgba(244,63,94,0.35)] backdrop-blur-2xl"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-bold font-mono text-rose-400 uppercase tracking-wider">
                Failure Simulation Active
              </span>
            </div>
            <div className="h-4 w-px bg-white/15" />
            <div className="text-xs font-mono text-slate-300">
              Origin: <strong className="text-white font-semibold">{simulatedFailedFile.filename}</strong>
              <span className="text-slate-500 mx-1.5">•</span>
              <span className="text-rose-300">
                {simulateResult?.total_dependents ?? simulatedFailedFile.blast_radius?.total_count ?? 0} Dependents Reached
              </span>
              {simulateResult?.at_risk_tests_count !== undefined && simulateResult.at_risk_tests_count > 0 && (
                <>
                  <span className="text-slate-500 mx-1.5">•</span>
                  <span className="text-amber-300">{simulateResult.at_risk_tests_count} Tests at Risk</span>
                </>
              )}
            </div>

            {/* Hop Depth Filter Buttons */}
            <div className="flex items-center space-x-1 bg-black/50 px-2 py-1 rounded-xl border border-white/10 text-[10px] font-mono">
              <span className="text-slate-400 mr-1 select-none">Hops:</span>
              {[1, 2, 3].map((h) => (
                <button
                  key={h}
                  onClick={() => {
                    soundFx.playClick();
                    setMaxHopDepth(h);
                  }}
                  className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                    maxHopDepth === h
                      ? 'bg-rose-500/30 text-rose-200 border border-rose-500/50 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={`Limit propagation reachability to ${h} hop(s)`}
                >
                  {h}
                </button>
              ))}
            </div>

            {/* Reachability Disclaimer Badge */}
            <span
              className="hidden lg:inline-flex px-2 py-0.5 rounded-lg bg-slate-900/80 text-[10px] text-slate-400 border border-white/10 font-sans"
              title="Deterministic reachability: an import relationship indicates interface exposure, not an unconditional production runtime exception."
            >
              Static Reachability
            </span>

            <button
              onClick={() => {
                soundFx.playClick();
                simulateFailure(null);
              }}
              className="ml-1 px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 border border-rose-500/40 text-[11px] font-mono transition-all flex items-center gap-1.5 cursor-pointer"
              title="Exit failure simulation (Esc)"
            >
              <span>Exit Simulation</span>
              <kbd className="text-[9px] bg-black/40 px-1 py-0.5 rounded text-rose-300">Esc</kbd>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
