import {
  Center,
  Cloud,
  Float,
  OrbitControls,
  Sparkles,
  Text3D,
  useTexture,
} from "@react-three/drei";
import { useState } from "react";

const kaomojis = [
  "(=_=)",
  "(>_<)",
  "(+_+)",
  "(o_o)",
  "($_$)",
  "(@_@)",
  "(#_#)",
];

export function KaomojiKunScene() {
  const [mouth, setMouth] = useState("_");
  const [outlines, setOutlines] = useState({ left: "(", right: ")" });
  const [eyes, setEyes] = useState({ left: ">", right: "<" });
  const hat = useTexture("/santa-hat.png");

  const emoti = `${outlines.left}${eyes.left}${mouth}${eyes.right}${outlines.right}`;

  return (
    <>
      <Center>
        <Float floatIntensity={2} rotationIntensity={2} speed={1.5}>
          <Text3D
            font="/fonts/noto_sans_bold.json"
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
        position={[0, 14, 5]}
        scale={1.8}
        opacity={0.3}
        rotation={[0, -0.4 * Math.PI, 0]}
      />
      <Cloud
        position={[-5, -12, -2]}
        scale={2}
        opacity={0.3}
        rotation={[0, 0.5 * Math.PI, 0]}
      />
      <Cloud
        position={[-10, 4, 13]}
        scale={2}
        opacity={0.3}
        rotation={[0, 0.5 * Math.PI, 0]}
      />
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
      <Cloud
        position={[10, 8, -15]}
        scale={2.5}
        opacity={0.3}
        rotation={[0, -0.2 * Math.PI, 0]}
      />
      <Cloud
        position={[8, 13, 8]}
        scale={2}
        opacity={0.3}
        rotation={[0, 0.2 * Math.PI, 0]}
      />

      <hemisphereLight color={0x884488} groundColor={0x222255} intensity={3} />
      <pointLight color={0xffdddd} position={[3, 1, -3]} intensity={50} />
      <pointLight color={0xddddff} position={[-3, -1, 3]} intensity={50} />
    </>
  );
}
