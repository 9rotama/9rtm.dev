"use client";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { KaomojiKunScene } from "./scene";
import styles from "./canvas.module.css";

export default function EmotiKun() {
  return (
    <Canvas className={styles.canvas}>
      <Suspense fallback={null}>
        <KaomojiKunScene />
      </Suspense>
    </Canvas>
  );
}
