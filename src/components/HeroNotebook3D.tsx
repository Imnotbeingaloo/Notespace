import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "framer-motion";

/**
 * Hero signature moment: a real 3D open notebook lying at a shallow angle.
 * One page lifts, arcs over the spine and settles, then the cycle repeats.
 * Everything is generated procedurally (no model files) so it stays light.
 */

const PAGE_W = 1.5;
const PAGE_H = 2.0;

/** Cream ruled-paper texture drawn on a 2D canvas. */
function useRuledTexture(withMarginRule = true) {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 384;
    c.height = 512;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fbf6ec";
    ctx.fillRect(0, 0, c.width, c.height);

    // subtle grain
    for (let i = 0; i < 2200; i++) {
      ctx.fillStyle = `rgba(120,105,85,${Math.random() * 0.045})`;
      ctx.fillRect(Math.random() * c.width, Math.random() * c.height, 1, 1);
    }

    // ruled lines
    ctx.strokeStyle = "rgba(40,55,90,0.16)";
    ctx.lineWidth = 1.4;
    for (let y = 56; y < c.height - 24; y += 30) {
      ctx.beginPath();
      ctx.moveTo(26, y);
      ctx.lineTo(c.width - 26, y);
      ctx.stroke();
    }

    if (withMarginRule) {
      ctx.strokeStyle = "rgba(196,92,62,0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(58, 18);
      ctx.lineTo(58, c.height - 18);
      ctx.stroke();

      // handwriting-ish ink marks
      ctx.strokeStyle = "rgba(48,62,110,0.5)";
      ctx.lineWidth = 3.2;
      ctx.lineCap = "round";
      const rows = [86, 116, 146, 206, 236, 296, 326, 356];
      rows.forEach((y, i) => {
        const len = [200, 250, 150, 230, 170, 260, 210, 130][i];
        ctx.beginPath();
        ctx.moveTo(72, y);
        for (let x = 72; x < 72 + len; x += 14) {
          ctx.lineTo(x, y + Math.sin(x * 0.35 + i) * 1.6);
        }
        ctx.stroke();
      });

      // ochre highlighter sweep
      ctx.fillStyle = "rgba(197,143,42,0.28)";
      ctx.fillRect(72, 196, 190, 16);
    }

    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [withMarginRule]);
}

function Page({
  texture,
  x,
  y,
  rotation = 0,
}: {
  texture: THREE.Texture;
  x: number;
  y: number;
  rotation?: number;
}) {
  return (
    <mesh position={[x, y, 0]} rotation={[0, 0, rotation]} castShadow receiveShadow>
      <boxGeometry args={[PAGE_W, PAGE_H, 0.012]} />
      <meshStandardMaterial
        attach="material-0"
        color="#f3ead9"
        roughness={0.95}
      />
      <meshStandardMaterial attach="material-1" color="#f3ead9" roughness={0.95} />
      <meshStandardMaterial attach="material-2" color="#f6efe1" roughness={0.95} />
      <meshStandardMaterial attach="material-3" color="#f6efe1" roughness={0.95} />
      <meshStandardMaterial attach="material-4" map={texture} roughness={0.92} />
      <meshStandardMaterial attach="material-5" color="#efe5d2" roughness={0.95} />
    </mesh>
  );
}

/** The page that lifts, arcs across the spine and settles. */
function TurningPage({ texture, reduce }: { texture: THREE.Texture; reduce: boolean }) {
  const pivot = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!pivot.current || reduce) return;
    const CYCLE = 9;
    const t = clock.getElapsedTime() % CYCLE;
    const TURN = 3.2;
    let p = 0;
    if (t < 1.6) p = 0;
    else if (t < 1.6 + TURN) {
      const k = (t - 1.6) / TURN;
      // ease-in-out
      p = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    } else p = 1;
    pivot.current.rotation.y = -p * Math.PI;
    // slight lift at mid-turn so it doesn't clip the stack
    pivot.current.position.z = Math.sin(p * Math.PI) * 0.14;
  });

  return (
    <group ref={pivot} position={[0, 0, 0.05]}>
      <mesh position={[PAGE_W / 2, 0, 0]} castShadow>
        <boxGeometry args={[PAGE_W, PAGE_H, 0.01]} />
        <meshStandardMaterial attach="material-0" color="#f3ead9" roughness={0.95} />
        <meshStandardMaterial attach="material-1" color="#f3ead9" roughness={0.95} />
        <meshStandardMaterial attach="material-2" color="#f6efe1" roughness={0.95} />
        <meshStandardMaterial attach="material-3" color="#f6efe1" roughness={0.95} />
        <meshStandardMaterial attach="material-4" map={texture} roughness={0.9} />
        <meshStandardMaterial attach="material-5" color="#ece1cc" roughness={0.95} />
      </mesh>
    </group>
  );
}

function Notebook({ reduce }: { reduce: boolean }) {
  const group = useRef<THREE.Group>(null);
  const left = useRuledTexture(true);
  const right = useRuledTexture(false);

  useFrame(({ clock, pointer }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    const drift = reduce ? 0 : Math.sin(t * 0.4) * 0.05;
    group.current.rotation.z = -0.22 + drift * 0.4;
    group.current.rotation.x = -0.95 + (reduce ? 0 : pointer.y * 0.08 + drift * 0.3);
    group.current.rotation.y = reduce ? 0.2 : 0.2 + pointer.x * 0.12;
  });

  return (
    <group ref={group} rotation={[-0.95, 0.2, -0.22]}>
      {/* cover under the pages */}
      <mesh position={[0, -0.02, -0.09]} receiveShadow castShadow>
        <boxGeometry args={[PAGE_W * 2 + 0.16, PAGE_H + 0.16, 0.09]} />
        <meshStandardMaterial color="#1d3f52" roughness={0.55} metalness={0.05} />
      </mesh>

      {/* page stacks */}
      <Page texture={left} x={-PAGE_W / 2 - 0.005} y={0} />
      <Page texture={right} x={PAGE_W / 2 + 0.005} y={0} />

      <TurningPage texture={right} reduce={reduce} />

      {/* spine shadow */}
      <mesh position={[0, 0, 0.062]}>
        <planeGeometry args={[0.16, PAGE_H]} />
        <meshBasicMaterial color="#2a2318" transparent opacity={0.18} />
      </mesh>

      {/* indigo ribbon bookmark trailing off the bottom edge */}
      <mesh position={[0.42, -PAGE_H / 2 - 0.34, -0.05]}>
        <planeGeometry args={[0.12, 0.95]} />
        <meshStandardMaterial color="hsl(232 46% 42%)" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* sage elastic band across the right page */}
      <mesh position={[PAGE_W * 0.98, 0, 0.03]}>
        <planeGeometry args={[0.055, PAGE_H + 0.3]} />
        <meshStandardMaterial color="hsl(150 22% 46%)" roughness={0.8} />
      </mesh>
    </group>
  );
}

export function HeroNotebook3D({ className = "" }: { className?: string }) {
  const reduce = !!useReducedMotion();

  return (
    <div
      aria-hidden
      className={`pointer-events-none select-none ${className}`}
    >
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0.2, 5.4], fov: 34 }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.85} />
          <directionalLight position={[3, 4, 5]} intensity={1.15} />
          <directionalLight position={[-4, -1, 2]} intensity={0.35} color="#c9d4ff" />
          <Notebook reduce={reduce} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default HeroNotebook3D;
