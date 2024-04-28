"use client";
import { Canvas } from "@react-three/fiber";
import { Center, Float, OrbitControls, Text3D } from "@react-three/drei";

export default function KaomojiKun() {
  return (
    <Canvas style={{ width: "100%", height: "200px" }}>
      <KaomojiKunMesh />
    </Canvas>
  );
}

const kaomojis = [
  "(=_=)",
  "(>_<)",
  "(+_+)",
  "(o_o)",
  "($_$)",
  "(@_@)",
  "(#_#)",
];

function KaomojiKunMesh() {
  return (
    <>
      <Center>
        <Float>
          <Text3D
            font="/fonts/noto_sans_bold.json"
            height={0.1}
            scale={2.5}
            rotation={[0, -0.5 * Math.PI, 0]}
          >
            {kaomojis[0]}
            <meshPhongMaterial attach="material" color={0xffffff} />
          </Text3D>
        </Float>
        <OrbitControls makeDefault />
      </Center>
      <ambientLight color={0xff99ff}></ambientLight>
    </>
  );
}
