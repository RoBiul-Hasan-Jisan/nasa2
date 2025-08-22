// Country.jsx
import React, { Suspense, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Html, Sphere, Stars } from "@react-three/drei";
import { TextureLoader } from "three";
import { motion, AnimatePresence } from "framer-motion";
import countryData from "../data/countryData";
import DataSection from "../components/DataSection";

// ------------------------
// Icon/marker component
// ------------------------
function GlobeIcon({ lat, lng, type, value }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);

  const radius = 2;
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  useFrame(() => {
    if (ref.current) {
      ref.current.scale.setScalar(
        1 + Math.sin(Date.now() * 0.005) * 0.2
      ); // pulsing effect
    }
  });

  let color, emoji;
  switch (type) {
    case "climate":
      color = "#ff4444";
      emoji = "🌡️";
      break;
    case "disasters":
      color = "#ffaa00";
      emoji = "🔥";
      break;
    case "urban":
      color = "#66ccff";
      emoji = "🏙️";
      break;
    default:
      color = "white";
      emoji = "❓";
  }

  return (
    <group position={[x, y, z]}>
      <mesh
        ref={ref}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
        />
      </mesh>
      {hovered && (
        <Html position={[0, 0.3, 0]} center>
          <div className="bg-black/70 px-3 py-1 rounded-lg text-sm font-medium">
            {emoji} {value}
          </div>
        </Html>
      )}
    </group>
  );
}

// ------------------------
// Realistic Globe Surface
// ------------------------
function GlobeSurface() {
  const colorMap = useLoader(TextureLoader, "/textures/earth_daymap.png");
  const bumpMap = useLoader(TextureLoader, "/textures/earth_bump.png");
  const specularMap = useLoader(TextureLoader, "/textures/earth_specular.png");

  return (
    <Sphere args={[2, 64, 64]}>
      <meshPhongMaterial
        map={colorMap}
        bumpMap={bumpMap}
        bumpScale={0.05}
        specularMap={specularMap}
        specular={0x444444}
      />
    </Sphere>
  );
}

// ------------------------
// Globe component
// ------------------------
function Globe({ country, activeSection }) {
  const data = countryData[country];
  if (!data) return null;

  const positions = {
    climate: { lat: 40, lng: -100 },
    disasters: { lat: 38, lng: -95 },
    urban: { lat: 37, lng: -90 },
  };

  const sections = {
    climate: data.climate.map((item, i) => ({
      ...item,
      lat: positions.climate.lat + i * 2,
      lng: positions.climate.lng + i * 4,
    })),
    disasters: data.disasters.map((item, i) => ({
      ...item,
      lat: positions.disasters.lat + i * 2,
      lng: positions.disasters.lng + i * 4,
    })),
    urban: data.urban.map((item, i) => ({
      ...item,
      lat: positions.urban.lat + i * 2,
      lng: positions.urban.lng + i * 4,
    })),
  };

  return (
    <>
      <GlobeSurface />
      {activeSection &&
        sections[activeSection].map((item, i) => (
          <GlobeIcon
            key={i}
            lat={item.lat}
            lng={item.lng}
            type={activeSection}
            value={item.label + ": " + item.value}
          />
        ))}
    </>
  );
}

// ------------------------
// Main Country Page
// ------------------------
export default function Country() {
  const { country } = useParams();
  const data = countryData[country];
  const [activeSection, setActiveSection] = useState("climate");

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <h2>Data for "{country}" not available.</h2>
      </div>
    );
  }

  const sectionButtons = [
    { id: "climate", label: "🌡️ Climate Change", color: "bg-red-600" },
    { id: "disasters", label: "🔥 Disasters", color: "bg-yellow-500" },
    { id: "urban", label: "🏙️ Urban Growth", color: "bg-blue-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 p-6 text-white">
      <h1 className="text-4xl font-bold mb-6">{country}</h1>

      {/* Section Buttons */}
      <div className="flex gap-3 mb-6">
        {sectionButtons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => setActiveSection(btn.id)}
            className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 
              ${activeSection === btn.id ? btn.color : "bg-gray-700 hover:bg-gray-600"}`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Layout: Globe top, data bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3D Globe */}
        <div className="h-96 lg:h-[600px] w-full rounded-lg overflow-hidden shadow-xl">
          <Canvas camera={{ position: [0, 3, 8], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={1} />
            <Suspense fallback={null}>
              <Stars radius={50} depth={50} count={5000} factor={4} fade />
              <Globe country={country} activeSection={activeSection} />
            </Suspense>
            <OrbitControls enableZoom enablePan enableRotate autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </div>

        {/* Data Panels */}
        <div className="space-y-6 overflow-y-auto max-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <DataSection
  title={
    activeSection === "climate"
      ? "🌡️ Climate Change"
      : activeSection === "disasters"
      ? "🔥 Disasters"
      : "🏙️ Urban Growth"
  }
  data={data[activeSection]} // <-- Pass the raw array from countryData
/>

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
