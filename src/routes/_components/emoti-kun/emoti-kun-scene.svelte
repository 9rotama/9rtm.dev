<script lang="ts">
  import { T } from "@threlte/core";
  import { createTimeline, eases } from "animejs";
  import { onMount } from "svelte";
  import EmotiKunFloor from "./emoti-kun-floor.svelte";
  const emotiLowerPos = { x: 0, y: 2.5, z: 0 };

  let meshPos: { x: number; y: number; z: number } = $state(emotiLowerPos);
  let meshScale: { x: number; y: number; z: number } = $state({
    x: 1,
    y: 1,
    z: 1,
  });

  onMount(() => {
    const tlPos = createTimeline({ loop: true })
      .add(meshPos, {
        y: [emotiLowerPos.y + 1.0, emotiLowerPos.y + 0.2],
        ease: eases.inCubic,
        duration: 500,
      })
      .add(meshPos, {
        y: [emotiLowerPos.y + 0.2, emotiLowerPos.y],
        ease: eases.outCubic,
        duration: 500,
      })
      .add(
        meshScale,
        {
          x: [1, 1.1],
          y: [1, 0.9],
          ease: eases.outCubic,
          duration: 500,
        },
        "-=500",
      )
      .add(meshPos, {
        y: [emotiLowerPos.y, emotiLowerPos.y + 0.2],
        ease: eases.inCubic,
        duration: 500,
      })
      .add(
        meshScale,
        {
          x: [1.1, 1],
          y: [0.9, 1],
          ease: eases.inCubic,
          duration: 500,
        },
        "-=500",
      )
      .add(meshPos, {
        y: [emotiLowerPos.y + 0.2, emotiLowerPos.y + 1.0],
        ease: eases.outCubic,
        duration: 500,
      });

    tlPos.play();
  });
</script>

<T.Mesh
  position={[meshPos.x, meshPos.y, meshPos.z]}
  scale={[meshScale.x, meshScale.y, meshScale.z]}
  castShadow={false}
  receiveShadow={false}
>
  <T.SphereGeometry args={[2.5, 64, 64]} />
  <T.MeshStandardMaterial
    color="#301c3c"
    roughness={0.6957}
    metalness={0.3804}
  />
</T.Mesh>
<EmotiKunFloor />

<T.PerspectiveCamera
  makeDefault
  fov={50}
  position={[0, 4, 10]}
  rotation={[-Math.PI / 30, 0, 0]}
/>

<T.PointLight
  position={[2, 6, 4]}
  intensity={50}
  color="#bc84f1"
  castShadow
  distance={0}
/>
<T.AmbientLight intensity={5} color="#a658ae" />
<T.RectAreaLight
  position={[0, -0.1, 0]}
  rotation={[Math.PI / 2, 0, 0]}
  intensity={1.5}
  width={5}
  height={5}
  visible
  color="#c494e2"
/>
