import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html, Environment } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";

// Country data
const countries = [
  { name: "USA", lat: 37.1, lon: -95.7 },
  { name: "Bangladesh", lat: -23.7, lon: 90.4 },
  { name: "Brazil", lat: -14.2, lon: -51.9 },
  { name: "Australia", lat: -25.3, lon: 133.8 },
  { name: "India", lat: -20.6, lon: 78.9 },
  { name: "China", lat: 35.8, lon: 104.1 },
  { name: "UK", lat: 55.3, lon: -3.4 },
  { name: "Canada", lat: 56.1, lon: -106.3 },
  { name: "Japan", lat: 36.2, lon: 138.3 },
  { name: "South Africa", lat: -30.6, lon: 22.9 },
];

// Convert latitude/longitude to 3D coordinates
function latLonToVector3(lat, lon, radius = 2.5) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return [x, y, z];
}

// Rotating Earth with warm glow
function EarthModel() {
  const ref = useRef();
  const { scene } = useGLTF("/models/realistic_3d_earth_model_with_4k_textures.glb");

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.0008; // slow rotation
  });

  return (
    <>
      <primitive ref={ref} object={scene} scale={1.3} />
      {/* Warm atmosphere */}
      <mesh scale={1.36}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial
          color="#ff9900"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
    </>
  );
}

// Procedural starfield
function Starfield({ count = 3000 }) {
  const points = useRef();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 300;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 300;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 300;
  }
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.2} sizeAttenuation />
    </points>
  );
}

export default function Globe() {
  const navigate = useNavigate();
  const markerRefs = useRef([]);

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      style={{ height: "100vh", background: "radial-gradient(circle at center, #220011, #000000)" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffbb88" />
      <directionalLight position={[-5, 5, -5]} intensity={0.8} color="#ffaa66" />

      <Suspense fallback={null}>
        <Environment preset="sunset" background={false} />
        <Starfield count={3000} />
        <EarthModel />

        {/* Country markers */}
        {countries.map((c, i) => {
          const [x, y, z] = latLonToVector3(c.lat, c.lon, 2.52);
          return (
            <group key={i} position={[x, y, z]}>
              <mesh
                ref={(el) => (markerRefs.current[i] = el)}
                onClick={() => navigate(`/country/${c.name}`)}
                onPointerOver={() => markerRefs.current[i]?.material.color.set("#ff4444")}
                onPointerOut={() => markerRefs.current[i]?.material.color.set("#ffd700")}
              >
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial color="#ffd700" emissive="#ff6600" />
              </mesh>
              <Html
                position={[0, 0.1, 0]}
                style={{
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "bold",
                  textShadow: "0 0 8px black",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}
                center
              >
                {c.name}
              </Html>
            </group>
          );
        })}
      </Suspense>

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        enableRotate={true}
        rotateSpeed={0.5}
        zoomSpeed={0.6}
        dampingFactor={0.1}
      />
    </Canvas>
  );
}
