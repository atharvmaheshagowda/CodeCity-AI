import React, { useMemo } from 'react';
import * as THREE from 'three';

interface SkylineBackdropProps {
  lowPowerMode?: boolean;
}

/**
 * Creates a procedural 100% offline AAA Cyberpunk Sunset Skyline texture
 * featuring warm sunset orange horizon glow, twilight gradient, and distant highrise silhouettes
 * with lit golden & cyan window slits.
 */
function createCyberSkylineTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 1. Rich Sunset Twilight Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 512, 0, 0);
  skyGrad.addColorStop(0.00, '#02050e'); // Deep asphalt base
  skyGrad.addColorStop(0.25, '#040b1a'); // Distant horizon fog base
  skyGrad.addColorStop(0.38, '#f97316'); // Radiant amber-orange sunset blaze
  skyGrad.addColorStop(0.48, '#c2410c'); // Warm sunset fire
  skyGrad.addColorStop(0.60, '#4c1d95'); // Sunset purple/violet dusk transition
  skyGrad.addColorStop(0.74, '#0c4a6e'); // Twilight cyan/navy
  skyGrad.addColorStop(0.90, '#030712'); // Deep midnight sky
  skyGrad.addColorStop(1.00, '#010308');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // 2. Horizon Volumetric Light Haze
  const hazeGrad = ctx.createRadialGradient(512, 340, 30, 512, 340, 500);
  hazeGrad.addColorStop(0.0, 'rgba(251, 146, 60, 0.50)');
  hazeGrad.addColorStop(0.4, 'rgba(234, 88, 12, 0.25)');
  hazeGrad.addColorStop(0.8, 'rgba(14, 165, 233, 0.08)');
  hazeGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = hazeGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // 3. Procedural Distant Skyscrapers with lit window slits
  let seed = 177;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const numTowers = 65;
  for (let i = 0; i < numTowers; i++) {
    const tx = (i / numTowers) * 1024 + (rnd() - 0.5) * 10;
    const tw = 10 + rnd() * 20;
    const th = 45 + rnd() * 115;
    const ty = 345 - th;

    // Dark metallic skyscraper silhouette
    ctx.fillStyle = '#060d1b';
    ctx.fillRect(tx - tw / 2, ty, tw, th);

    // Glowing window slit bands
    const floors = Math.floor(th / 5.5);
    for (let f = 0; f < floors; f++) {
      if (rnd() > 0.38) {
        const fy = ty + f * 5.5 + 1.5;
        const isCyan = rnd() > 0.68;
        ctx.fillStyle = isCyan ? 'rgba(56, 189, 248, 0.90)' : 'rgba(253, 224, 71, 0.92)';
        ctx.fillRect(tx - tw / 2 + 1.5, fy, tw - 3, 2);
      }
    }

    // Rooftop antenna with red hazard beacon
    if (rnd() > 0.45) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(tx - 0.8, ty - 10, 1.6, 10);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(tx - 1.5, ty - 12, 3, 2.5);
    }
  }

  // 4. Soft Top Edge Alpha Fade (prevents hard horizontal clipping line)
  ctx.globalCompositeOperation = 'destination-in';
  const alphaGrad = ctx.createLinearGradient(0, 0, 0, 512);
  alphaGrad.addColorStop(0.00, 'rgba(0, 0, 0, 0)');
  alphaGrad.addColorStop(0.20, 'rgba(0, 0, 0, 0.7)');
  alphaGrad.addColorStop(0.35, 'rgba(0, 0, 0, 1)');
  alphaGrad.addColorStop(1.00, 'rgba(0, 0, 0, 1)');
  ctx.fillStyle = alphaGrad;
  ctx.fillRect(0, 0, 1024, 512);
  ctx.globalCompositeOperation = 'source-over';

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates procedural 3D neon billboard sign for the Archway: "CodeCity AI"
 */
function createCodeCitySignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
  ctx.roundRect(4, 4, 504, 120, 16);
  ctx.fill();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.95)';
  ctx.lineWidth = 4;
  ctx.roundRect(4, 4, 504, 120, 16);
  ctx.stroke();

  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 18;

  ctx.font = 'bold 52px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CodeCity AI', 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export const SkylineBackdrop: React.FC<SkylineBackdropProps> = ({ lowPowerMode = false }) => {
  const skylineTexture = useMemo(() => createCyberSkylineTexture(), []);
  const signTexture = useMemo(() => createCodeCitySignTexture(), []);

  return (
    <group name="cinematic-backdrop">
      {/* 1. Panoramic Sunset Sky & Megalopolis Billboard Plane */}
      <mesh
        position={[-30, 22, -38]}
        rotation={[-0.42, 0.65, 0.28]}
      >
        <planeGeometry args={[165, 90]} />
        <meshBasicMaterial
          map={skylineTexture}
          depthWrite={false}
          transparent
          opacity={0.98}
        />
      </mesh>

      {/* 2. Monumental Gateway Arch with Glowing "CodeCity AI" Neon Billboard (Left Sky) */}
      <group position={[-11.5, 0, -20.5]} rotation={[0, 0.72, 0]}>
        {/* Left Column Tower */}
        <mesh position={[-3.6, 10.5, 0]}>
          <boxGeometry args={[3.0, 21, 3.6]} />
          <meshStandardMaterial
            color="#050c18"
            metalness={0.85}
            roughness={0.25}
            emissive="#0284c7"
            emissiveIntensity={0.35}
          />
        </mesh>

        {/* Right Column Tower */}
        <mesh position={[3.6, 10.5, 0]}>
          <boxGeometry args={[3.0, 21, 3.6]} />
          <meshStandardMaterial
            color="#050c18"
            metalness={0.85}
            roughness={0.25}
            emissive="#0284c7"
            emissiveIntensity={0.35}
          />
        </mesh>

        {/* Horizontal Connecting Skybridge Span */}
        <mesh position={[0, 19.5, 0]}>
          <boxGeometry args={[10.2, 3.4, 4.0]} />
          <meshStandardMaterial
            color="#081426"
            metalness={0.88}
            roughness={0.22}
            emissive="#06b6d4"
            emissiveIntensity={0.45}
          />
        </mesh>

        {/* Glowing "CodeCity AI" 3D Neon Sign */}
        <mesh position={[0, 19.5, 2.1]}>
          <planeGeometry args={[8.5, 2.1]} />
          <meshBasicMaterial
            map={signTexture}
            transparent
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* 3. Futuristic Circular Stadium / Arena (Right Background) */}
      <group position={[17.0, 0.1, -13.0]}>
        {/* Raised Circular Arena Base */}
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[13, 15, 2.2, 32]} />
          <meshStandardMaterial color="#040914" metalness={0.78} roughness={0.32} />
        </mesh>

        {/* Outer Glowing Cyan Ring */}
        <mesh position={[0, 2.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[11.5, 12.8, 32]} />
          <meshBasicMaterial color="#06b6d4" toneMapped={false} />
        </mesh>

        {/* Mid Glowing Cyan Ring */}
        <mesh position={[0, 2.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[8.0, 9.0, 32]} />
          <meshBasicMaterial color="#38bdf8" toneMapped={false} />
        </mesh>

        {/* Center Glowing Hub */}
        <mesh position={[0, 2.30, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[3.8, 32]} />
          <meshBasicMaterial color="#0284c7" toneMapped={false} />
        </mesh>

        {/* Stadium Floodlight */}
        <pointLight position={[0, 6, 0]} intensity={1.5} distance={50} color="#38bdf8" />
      </group>
    </group>
  );
};
