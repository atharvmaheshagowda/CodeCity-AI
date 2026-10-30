import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import * as BGU from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useFrame } from '@react-three/fiber';
import type { DistrictZone, FileNode } from '../../types';

interface EnvironmentalDetailsProps {
  districts: DistrictZone[];
  buildings: FileNode[];
  lowPowerMode?: boolean;
}

/**
 * Creates a procedural circular gradient texture for soft cyan ground light pools.
 * 100% offline and procedural.
 */
function createLightPoolTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(56, 189, 248, 0.60)');
  gradient.addColorStop(0.3, 'rgba(6, 182, 212, 0.30)');
  gradient.addColorStop(0.65, 'rgba(14, 165, 233, 0.08)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Procedural Environmental Details matching reference UI:
 * - Miniature streetlights along district perimeters and inter-district avenues
 * - Soft cyan circular ground light pools on wet asphalt
 * - Stylized cyber/pine trees along plazas and avenue medians
 * - Electrical transformer cabinets & substation boxes with diagnostic LEDs
 * - Perimeter sensor masts & relay nodes
 */
export const EnvironmentalDetails: React.FC<EnvironmentalDetailsProps> = ({
  districts,
  buildings,
  lowPowerMode = false,
}) => {
  const streetLightMeshRef = useRef<THREE.InstancedMesh>(null);
  const lightPoolMeshRef = useRef<THREE.InstancedMesh>(null);
  const transformerMeshRef = useRef<THREE.InstancedMesh>(null);
  const relayNodeMeshRef = useRef<THREE.InstancedMesh>(null);
  const treeMeshRef = useRef<THREE.InstancedMesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // 1. Streetlight Geometry: Merged slender post + angled luminaire head
  const streetLightGeo = useMemo(() => {
    const post = new THREE.BoxGeometry(0.1, 2.2, 0.1);
    post.translate(0, 1.1, 0);

    const arm = new THREE.BoxGeometry(0.08, 0.08, 0.55);
    arm.translate(0, 2.15, 0.22);

    const head = new THREE.BoxGeometry(0.18, 0.06, 0.28);
    head.translate(0, 2.12, 0.45);

    const merged = BGU.mergeGeometries([post, arm, head]);
    post.dispose();
    arm.dispose();
    head.dispose();
    return merged;
  }, []);

  // 2. Transformer Cabinet Geometry: Main body + vented cap + diagnostic junction box
  const transformerGeo = useMemo(() => {
    const body = new THREE.BoxGeometry(0.75, 0.85, 0.6);
    body.translate(0, 0.425, 0);

    const topCap = new THREE.BoxGeometry(0.82, 0.1, 0.66);
    topCap.translate(0, 0.87, 0);

    const ventPlate = new THREE.BoxGeometry(0.55, 0.35, 0.06);
    ventPlate.translate(0, 0.45, 0.31);

    const merged = BGU.mergeGeometries([body, topCap, ventPlate]);
    body.dispose();
    topCap.dispose();
    ventPlate.dispose();
    return merged;
  }, []);

  // 3. Perimeter Sensor / Relay Mast Geometry
  const relayNodeGeo = useMemo(() => {
    const base = new THREE.BoxGeometry(0.3, 0.25, 0.3);
    base.translate(0, 0.125, 0);

    const mast = new THREE.CylinderGeometry(0.04, 0.05, 1.4, 8);
    mast.translate(0, 0.85, 0);

    const emitterRing = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 8);
    emitterRing.translate(0, 1.45, 0);

    const merged = BGU.mergeGeometries([base, mast, emitterRing]);
    base.dispose();
    mast.dispose();
    emitterRing.dispose();
    return merged;
  }, []);

  // 4. Ground Light Pool Geometry: Flat circle lying on asphalt
  const lightPoolGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(3.6, 3.6);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  // 5. Stylized Tree Geometry: Trunk + Multi-tiered pine foliage
  const treeGeo = useMemo(() => {
    const trunk = new THREE.CylinderGeometry(0.08, 0.12, 0.7, 6);
    trunk.translate(0, 0.35, 0);

    const foliage1 = new THREE.ConeGeometry(0.55, 1.2, 6);
    foliage1.translate(0, 1.2, 0);

    const foliage2 = new THREE.ConeGeometry(0.42, 1.0, 6);
    foliage2.translate(0, 1.8, 0);

    const merged = BGU.mergeGeometries([trunk, foliage1, foliage2]);
    trunk.dispose();
    foliage1.dispose();
    foliage2.dispose();
    return merged;
  }, []);

  // Materials
  const streetLightMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0f172a',
        metalness: 0.88,
        roughness: 0.24,
        emissive: '#0284c7',
        emissiveIntensity: 0.45,
      }),
    []
  );

  const lightPoolTexture = useMemo(() => createLightPoolTexture(), []);
  const lightPoolMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: lightPoolTexture,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [lightPoolTexture]
  );

  const transformerMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1e293b',
        metalness: 0.75,
        roughness: 0.38,
        emissive: '#10b981',
        emissiveIntensity: 0.35,
      }),
    []
  );

  const relayNodeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#090d16',
        metalness: 0.9,
        roughness: 0.2,
        emissive: '#38bdf8',
        emissiveIntensity: 0.55,
      }),
    []
  );

  const treeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#064e3b',
        roughness: 0.82,
        metalness: 0.12,
        emissive: '#022c22',
        emissiveIntensity: 0.25,
      }),
    []
  );

  // Compute layout coordinates for environmental elements based on districts
  const { streetLights, lightPools, transformers, relays, trees } = useMemo(() => {
    const sLights: { x: number; z: number; rotY: number }[] = [];
    const pools: { x: number; z: number }[] = [];
    const tFormers: { x: number; z: number; rotY: number }[] = [];
    const rNodes: { x: number; z: number }[] = [];
    const tList: { x: number; z: number; scale: number }[] = [];

    if (!districts || districts.length === 0) {
      return { streetLights: sLights, lightPools: pools, transformers: tFormers, relays: rNodes, trees: tList };
    }

    districts.forEach((d) => {
      const hw = d.width * 0.5 + 0.9;
      const hd = d.depth * 0.5 + 0.9;

      // 4 District perimeter corners get Streetlights + Light Pools
      const corners = [
        { x: d.x - hw, z: d.z - hd, rotY: Math.PI * 0.25 },
        { x: d.x + hw, z: d.z - hd, rotY: -Math.PI * 0.25 },
        { x: d.x + hw, z: d.z + hd, rotY: -Math.PI * 0.75 },
        { x: d.x - hw, z: d.z + hd, rotY: Math.PI * 0.75 },
      ];

      corners.forEach((c) => {
        sLights.push(c);
        const forwardX = Math.sin(c.rotY) * 0.45;
        const forwardZ = Math.cos(c.rotY) * 0.45;
        pools.push({ x: c.x + forwardX, z: c.z + forwardZ });
      });

      // Midpoint Industrial Transformers (placed along district edges)
      tFormers.push({
        x: d.x + hw + 0.3,
        z: d.z,
        rotY: -Math.PI * 0.5,
      });

      // Perimeter Relays (opposite side entrance)
      rNodes.push({
        x: d.x - hw - 0.3,
        z: d.z,
      });

      // Trees scattered along district perimeter corners and road medians matching reference image
      tList.push({ x: -14.2, z: 6.2, scale: 1.15 });
      tList.push({ x: -14.8, z: 8.8, scale: 0.95 });
      tList.push({ x: -6.0, z: 12.8, scale: 1.10 });
      tList.push({ x: -3.5, z: 12.8, scale: 0.88 });
      tList.push({ x: 4.5, z: 12.8, scale: 1.05 });
      tList.push({ x: 6.8, z: 12.8, scale: 0.92 });
      tList.push({ x: 12.8, z: 4.8, scale: 1.05 });
      tList.push({ x: 12.8, z: 6.8, scale: 0.90 });
      tList.push({ x: -5.5, z: -4.5, scale: 1.00 });
      tList.push({ x: 5.5, z: -4.5, scale: 0.95 });
      tList.push({ x: -14.5, z: -4.5, scale: 1.10 });

      // Extra corridor streetlights
      if (d.width > 10) {
        sLights.push({ x: d.x, z: d.z - hd, rotY: 0 });
        pools.push({ x: d.x, z: d.z - hd + 0.45 });
        sLights.push({ x: d.x, z: d.z + hd, rotY: Math.PI });
        pools.push({ x: d.x, z: d.z + hd - 0.45 });
      }
    });

    return {
      streetLights: sLights,
      lightPools: pools,
      transformers: tFormers,
      relays: rNodes,
      trees: tList,
    };
  }, [districts]);

  // Position instances
  React.useEffect(() => {
    // 1. Streetlights
    if (streetLightMeshRef.current && streetLights.length > 0) {
      streetLights.forEach((s, i) => {
        dummy.position.set(s.x, 0, s.z);
        dummy.rotation.set(0, s.rotY, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        streetLightMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      streetLightMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. Light Pools
    if (lightPoolMeshRef.current && lightPools.length > 0) {
      lightPools.forEach((p, i) => {
        dummy.position.set(p.x, 0.025, p.z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        lightPoolMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      lightPoolMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 3. Transformers
    if (transformerMeshRef.current && transformers.length > 0) {
      transformers.forEach((t, i) => {
        dummy.position.set(t.x, 0, t.z);
        dummy.rotation.set(0, t.rotY, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        transformerMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      transformerMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 4. Relay nodes
    if (relayNodeMeshRef.current && relays.length > 0) {
      relays.forEach((r, i) => {
        dummy.position.set(r.x, 0, r.z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        relayNodeMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      relayNodeMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 5. Trees
    if (treeMeshRef.current && trees.length > 0) {
      trees.forEach((t, i) => {
        dummy.position.set(t.x, 0, t.z);
        dummy.rotation.set(0, Math.random() * Math.PI, 0);
        dummy.scale.set(t.scale, t.scale, t.scale);
        dummy.updateMatrix();
        treeMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      treeMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [streetLights, lightPools, transformers, relays, trees, dummy]);

  // Subtle breathing pulse on light pools
  useFrame(({ clock }) => {
    if (!lowPowerMode && lightPoolMat) {
      const pulse = 0.70 + 0.08 * Math.sin(clock.getElapsedTime() * 1.8);
      lightPoolMat.opacity = pulse;
    }
  });

  if (!districts || districts.length === 0) return null;

  return (
    <group name="environmental-details">
      {/* 1. Streetlights */}
      {streetLights.length > 0 && (
        <instancedMesh
          ref={streetLightMeshRef}
          args={[streetLightGeo, streetLightMat, streetLights.length]}
          frustumCulled={false}
        />
      )}

      {/* 2. Soft Cyan Ground Light Pools */}
      {lightPools.length > 0 && (
        <instancedMesh
          ref={lightPoolMeshRef}
          args={[lightPoolGeo, lightPoolMat, lightPools.length]}
          frustumCulled={false}
        />
      )}

      {/* 3. Electrical Transformers */}
      {transformers.length > 0 && (
        <instancedMesh
          ref={transformerMeshRef}
          args={[transformerGeo, transformerMat, transformers.length]}
          frustumCulled={false}
        />
      )}

      {/* 4. Communication Relay Masts */}
      {relays.length > 0 && (
        <instancedMesh
          ref={relayNodeMeshRef}
          args={[relayNodeGeo, relayNodeMat, relays.length]}
          frustumCulled={false}
        />
      )}

      {/* 5. Stylized Trees / Vegetation */}
      {trees.length > 0 && (
        <instancedMesh
          ref={treeMeshRef}
          args={[treeGeo, treeMat, trees.length]}
          frustumCulled={false}
        />
      )}
    </group>
  );
};
