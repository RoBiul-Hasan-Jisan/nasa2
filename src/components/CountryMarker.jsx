import React from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";

const latLonToVector3 = (lat, lon, radius) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

export default function CountryMarker({ country, onClick }) {
  const pos = latLonToVector3(country.lat, country.lon, 2.6);

  return (
    <mesh position={pos} onClick={onClick}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshStandardMaterial color="yellow" />
      <Html distanceFactor={10}>
        <div style={{ color: "white", fontSize: "12px" }}>{country.name}</div>
      </Html>
    </mesh>
  );
}
