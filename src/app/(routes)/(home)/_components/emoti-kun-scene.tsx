import {
  Center,
  Cloud,
  Float,
  OrbitControls,
  Sparkles,
  Text3D,
} from "@react-three/drei";
import { useState } from "react";

export function EmotiKunScene() {
  const [mouth] = useState("_");
  const [outlines] = useState({ left: "(", right: ")" });
  const [eyes] = useState({ left: "o", right: "o" });

  const emoti = `${outlines.left}${eyes.left}${mouth}${eyes.right}${outlines.right}`;

  return (
    <>
      <Center>
        <Float floatIntensity={2} rotationIntensity={2} speed={1.5}>
          <Text3D
            font="/three-fonts/michroma.json"
            height={0.1}
            scale={2.5}
            rotation={[0, -0.5 * Math.PI, 0]}
          >
            {emoti}
            <meshStandardMaterial
              attach="material"
              color={0xdd88ff}
              metalness={0.7}
              roughness={0.2}
              transparent
              opacity={1}
            />
          </Text3D>
        </Float>
      </Center>
      <OrbitControls makeDefault />
      <Sparkles scale={15} count={200} size={1} />
      <Cloud position={[6, 2, 6]} scale={1} opacity={0.3} />
      <Cloud
        position={[4, -5, 10]}
        scale={3}
        opacity={0.3}
        rotation={[0, 0.3 * Math.PI, 0]}
      />
      <Cloud
        position={[3, 0, -10]}
        scale={2}
        opacity={0.3}
        rotation={[0, -0.8 * Math.PI, 0]}
      />
      <hemisphereLight color={0x884488} groundColor={0x222255} intensity={3} />
      <pointLight color={0xffdddd} position={[3, 1, -3]} intensity={50} />
      <pointLight color={0xddddff} position={[-3, -1, 3]} intensity={50} />
    </>
  );
}
