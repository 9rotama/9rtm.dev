"use client";
import { Canvas } from "@react-three/fiber";
import { EmotiKunScene } from "./emoti-kun-scene";

export default function EmotiKun() {
  return (
    <Canvas style={{ width: "100%", height: "200px" }}>
      <EmotiKunScene />
    </Canvas>
  );
}
