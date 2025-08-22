import React, { Suspense, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Sphere, Stars } from "@react-three/drei";
import countryData from "../data/countryData";
import DataSection from "../components/DataSection";

// Icon/particle component for each dataset
function GlobeIcon({ lat, lng, type, value }) {
  const ref = useRef();

  const radius = 2;
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.01; // slow rotation
      ref.current.position.y += Math.sin(Date.now() * 0.002) * 0.001; // small up/down float
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
      <mesh ref={ref}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} />
      </mesh>
      <Html position={[0, 0.2, 0]} center>
        <div className="text-white text-sm font-bold">{emoji} {value}</div>
      </Html>
    </group>
  );
}

// Globe component with dataset visualization
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
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial color="#0a0a0a" roughness={1} metalness={0.1} />
      </Sphere>

      {activeSection && sections[activeSection].map((item, i) => (
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

// Main Country Page
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 p-8 text-white">
      <h1 className="text-4xl font-bold mb-6">{country}</h1>

      {/* Section Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          className={`px-4 py-2 rounded-lg font-bold ${
            activeSection === "climate" ? "bg-red-600" : "bg-gray-700"
          }`}
          onClick={() => setActiveSection("climate")}
        >
          🌡️ Climate Change
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-bold ${
            activeSection === "disasters" ? "bg-yellow-500" : "bg-gray-700"
          }`}
          onClick={() => setActiveSection("disasters")}
        >
          🔥 Disasters
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-bold ${
            activeSection === "urban" ? "bg-blue-500" : "bg-gray-700"
          }`}
          onClick={() => setActiveSection("urban")}
        >
          🏙️ Urban Growth
        </button>
      </div>

      {/* Text Panel */}
      <div className="mb-12">
        <DataSection
          title={activeSection === "climate" ? "🌡️ Climate Change" : activeSection === "disasters" ? "🔥 Disasters" : "🏙️ Urban Growth"}
          content={data[activeSection].map((item, i) => (
            <div key={i} className="mb-2">
              <span className="font-semibold">{item.label}:</span> {item.value}
            </div>
          ))}
        />
      </div>

      {/* 3D Globe */}
      <Canvas camera={{ position: [0, 3, 8], fov: 50 }} style={{ height: "600px" }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Stars radius={50} depth={50} count={5000} factor={4} fade />
          <Globe country={country} activeSection={activeSection} />
        </Suspense>
        <OrbitControls enableZoom enablePan enableRotate rotateSpeed={0.4} />
      </Canvas>
    </div>
  );
}
