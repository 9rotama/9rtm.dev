<script lang="ts">
  import { T, useTask, useThrelte } from "@threlte/core";
  import { Stars } from "@threlte/extras";
  import { Color } from "three";
  import EmotiKunFloor from "./emoti-kun-floor.svelte";
  import EmotiKunText from "./emoti-kun-text.svelte";

  const { scene } = useThrelte();
  scene.background = new Color("#0f0b1e");

  // Animation state for rotating spheres
  let time = $state(0);

  useTask((delta) => {
    time += delta;
  });

  const sphereCount = 6;
  const radius = 5;
  const sphereColor = "#ffbbff";
</script>

<EmotiKunText />
<EmotiKunFloor />

{#each Array(sphereCount).keys() as i (i)}
  {@const angle = (i / sphereCount) * Math.PI * 2 + time * 0.1}
  {@const x = Math.cos(angle) * radius}
  {@const z = Math.sin(angle) * radius}
  {@const y = 1.0 + Math.sin(time * 2 + i) * 0.1}

  <T.Mesh position={[x, y, z]} rotation={[time * 0.1, time * 0.2, 0]}>
    <T.SphereGeometry args={[0.8, 32, 32]} />
    <T.MeshPhysicalMaterial
      color={sphereColor}
      metalness={0}
      roughness={0}
      transmission={1.0}
      ior={1.5}
      thickness={0.8}
    />
  </T.Mesh>
{/each}
<T.PerspectiveCamera
  makeDefault
  fov={50}
  position={[0, 3, 8]}
  rotation={[-Math.PI * 0.08, 0, 0]}
/>
<T.PointLight position={[0, 3, 4]} intensity={20} color="#bc84f1" visible />
<T.RectAreaLight
  position={[0, -0.1, 0]}
  rotation={[Math.PI / 2, 0, 0]}
  intensity={5}
  width={5}
  height={5}
  visible
  color="#c494e2"
/>

<Stars count={600} lightness={0.5} opacity={0.5} radius={50} factor={8} />
