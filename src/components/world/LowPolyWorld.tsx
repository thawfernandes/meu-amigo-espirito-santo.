import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Cloud, Clouds, Stars, Environment } from "@react-three/drei";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";

/**
 * Low-poly floating-island scene inspired by Monument Valley.
 * Pure procedural — no external assets needed.
 */
const FALLBACK = (
  <div
    className="absolute inset-0"
    style={{
      background: "linear-gradient(to bottom, #1a1340 0%, #3d2a6b 50%, #f6a06b 100%)",
    }}
  />
);

export function LowPolyWorld({ interactive = true }: { interactive?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [webglLost, setWebglLost] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted || webglLost) return FALLBACK;

  return (
    <Canvas
      className="!absolute !inset-0"
      camera={{ position: [0, 3.2, 9], fov: 42 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        scene.fog = new THREE.FogExp2(0xf3b48a, 0.05);
        scene.background = new THREE.Color(0xf3b48a);

        // Quando o contexto WebGL for perdido, cai no fallback do gradiente
        gl.domElement.addEventListener("webglcontextlost", () => setWebglLost(true));
      }}
    >
      <SkyGradient />
      <hemisphereLight args={["#ffd9a8", "#3a2466", 0.9]} />
      <directionalLight position={[6, 8, 4]} intensity={1.6} color="#ffe2b0" castShadow={false} />
      <ambientLight intensity={0.25} color="#b78cff" />

      <CameraDrift interactive={interactive} />

      <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.6}>
        <Island position={[0, 0, 0]} />
      </Float>
      <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.5}>
        <Island position={[-4.5, -1.4, -3]} scale={0.55} hue={0.55} />
      </Float>
      <Float speed={0.9} rotationIntensity={0.1} floatIntensity={0.55}>
        <Island position={[4.2, -0.9, -2.5]} scale={0.7} hue={0.05} />
      </Float>
      <Float speed={0.7} rotationIntensity={0.08} floatIntensity={0.4}>
        <Island position={[6, 1.4, -7]} scale={0.4} hue={0.2} />
      </Float>

      <Clouds material={THREE.MeshBasicMaterial} limit={50}>
        <Cloud
          seed={1}
          bounds={[8, 1.5, 4]}
          segments={20}
          volume={3}
          color="#fff1d8"
          opacity={0.55}
          position={[-5, 4, -6]}
          fade={30}
        />
        <Cloud
          seed={2}
          bounds={[8, 1.5, 4]}
          segments={20}
          volume={3}
          color="#ffd5a8"
          opacity={0.5}
          position={[6, 5, -8]}
          fade={30}
        />
        <Cloud
          seed={3}
          bounds={[6, 1.2, 3]}
          segments={16}
          volume={2.5}
          color="#ffe8c8"
          opacity={0.5}
          position={[0, 6, -10]}
          fade={30}
        />
      </Clouds>

      <Birds />
      <Particles count={80} />
      <Stars radius={50} depth={20} count={1200} factor={2} fade speed={0.6} />
      <Environment preset="sunset" />
    </Canvas>
  );
}

function SkyGradient() {
  const ref = useRef<THREE.Mesh>(null);
  return (
    <mesh ref={ref} scale={[60, 60, 60]} renderOrder={-1}>
      <sphereGeometry args={[1, 32, 16]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={{
          top: { value: new THREE.Color("#1f1554") },
          mid: { value: new THREE.Color("#d6638a") },
          bot: { value: new THREE.Color("#ffc88a") },
        }}
        vertexShader={`varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);} `}
        fragmentShader={`varying vec3 vP; uniform vec3 top; uniform vec3 mid; uniform vec3 bot; void main(){ float h = normalize(vP).y * 0.5 + 0.5; vec3 c = mix(bot, mid, smoothstep(0.0,0.55,h)); c = mix(c, top, smoothstep(0.55,1.0,h)); gl_FragColor = vec4(c,1.0);} `}
      />
    </mesh>
  );
}

function CameraDrift({ interactive }: { interactive: boolean }) {
  const mouse = useRef({ x: 0, y: 0 });
  useEffect(() => {
    if (!interactive) return;
    const h = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", h);
    return () => window.removeEventListener("pointermove", h);
  }, [interactive]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const tx = Math.sin(t * 0.12) * 0.6 + mouse.current.x * 0.8;
    const ty = 3.2 + Math.sin(t * 0.18) * 0.15 - mouse.current.y * 0.4;
    state.camera.position.x += (tx - state.camera.position.x) * 0.03;
    state.camera.position.y += (ty - state.camera.position.y) * 0.03;
    state.camera.lookAt(0, 0.3, 0);
  });
  return null;
}

function Island({ position = [0, 0, 0] as [number, number, number], scale = 1, hue = 0 }) {
  const trees = useMemo(() => {
    const arr: { x: number; z: number; s: number; tint: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + Math.random() * 0.4;
      const r = 0.6 + Math.random() * 0.9;
      arr.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        s: 0.6 + Math.random() * 0.5,
        tint: Math.random() * 0.2 - 0.1,
      });
    }
    return arr;
  }, []);

  const ground = new THREE.Color().setHSL(0.32 + hue * 0.3, 0.55, 0.45);
  const rock = new THREE.Color().setHSL(0.08 + hue, 0.45, 0.35);

  return (
    <group position={position} scale={scale}>
      {/* Top grass cap */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.1, 1.9, 0.55, 6]} />
        <meshStandardMaterial color={ground} flatShading roughness={0.95} />
      </mesh>
      {/* Rock body */}
      <mesh position={[0, -1.2, 0]}>
        <coneGeometry args={[1.95, 2.6, 6]} />
        <meshStandardMaterial color={rock} flatShading roughness={1} />
      </mesh>
      {/* Path */}
      <mesh position={[0, 0.39, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.55, 16, 1, 0, Math.PI]} />
        <meshStandardMaterial color="#e9c08b" flatShading roughness={1} />
      </mesh>
      {/* Trees */}
      {trees.map((t, i) => (
        <Tree key={i} position={[t.x, 0.38, t.z]} scale={t.s} tint={t.tint} />
      ))}
      {/* Lantern */}
      <Lantern position={[1.1, 0.4, -0.6]} />
    </group>
  );
}

function Tree({
  position,
  scale,
  tint,
}: {
  position: [number, number, number];
  scale: number;
  tint: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.z = Math.sin(s.clock.elapsedTime * 1.2 + position[0]) * 0.04;
  });
  const leaf = new THREE.Color().setHSL(0.32 + tint, 0.6, 0.42);
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 0.5, 6]} />
        <meshStandardMaterial color="#6b4a2a" flatShading />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <coneGeometry args={[0.35, 0.7, 6]} />
        <meshStandardMaterial color={leaf} flatShading />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <coneGeometry args={[0.25, 0.55, 6]} />
        <meshStandardMaterial color={leaf.clone().offsetHSL(0, 0, 0.05)} flatShading />
      </mesh>
    </group>
  );
}

function Lantern({ position }: { position: [number, number, number] }) {
  const light = useRef<THREE.PointLight>(null);
  useFrame((s) => {
    if (light.current) light.current.intensity = 1.2 + Math.sin(s.clock.elapsedTime * 4) * 0.2;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.3, 6]} />
        <meshStandardMaterial color="#3a2a18" flatShading />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[0.16, 0.22, 0.16]} />
        <meshStandardMaterial color="#ffd58a" emissive="#ffb45a" emissiveIntensity={1.6} />
      </mesh>
      <pointLight
        ref={light}
        position={[0, 0.35, 0]}
        color="#ffb45a"
        intensity={1.4}
        distance={2.4}
        decay={2}
      />
    </group>
  );
}

function Birds() {
  const group = useRef<THREE.Group>(null);
  const birds = useMemo(
    () =>
      new Array(5).fill(0).map((_, i) => ({
        r: 4 + Math.random() * 2,
        y: 2 + Math.random() * 2,
        s: 0.4 + Math.random() * 0.3,
        o: (i / 5) * Math.PI * 2,
      })),
    [],
  );
  useFrame((s) => {
    if (!group.current) return;
    group.current.children.forEach((c, i) => {
      const b = birds[i];
      const t = s.clock.elapsedTime * b.s + b.o;
      c.position.set(Math.cos(t) * b.r, b.y + Math.sin(t * 2) * 0.2, Math.sin(t) * b.r - 3);
      c.rotation.y = -t + Math.PI / 2;
      c.scale.setScalar(0.06 + Math.sin(t * 8) * 0.02);
    });
  });
  return (
    <group ref={group}>
      {birds.map((_, i) => (
        <mesh key={i}>
          <coneGeometry args={[1, 2.5, 4]} />
          <meshBasicMaterial color="#3a2466" />
        </mesh>
      ))}
    </group>
  );
}

function Particles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = Math.random() * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
      speeds[i] = 0.2 + Math.random() * 0.4;
    }
    return { positions, speeds };
  }, [count]);
  useFrame((s) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * 0.01;
      arr[i * 3] += Math.sin(s.clock.elapsedTime + i) * 0.003;
      if (arr[i * 3 + 1] > 6) arr[i * 3 + 1] = 0;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#fff2c8"
        size={0.08}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
