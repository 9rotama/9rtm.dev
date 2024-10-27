"use client";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { KaomojiKunScene } from "./scene";

export default function EmotiKun() {
  return (
    <Canvas style={{ width: "100vw", height: "200px" }}>
      <Suspense fallback={null}>
        <KaomojiKunScene />
      </Suspense>
    </Canvas>
  );
}
