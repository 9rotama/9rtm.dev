<script lang="ts">
  import { T, useLoader } from "@threlte/core";
  import { Align, Text3DGeometry } from "@threlte/extras";
  import { createTimeline, eases } from "animejs";
  import { onMount } from "svelte";
  import { FontLoader } from "three/examples/jsm/Addons.js";
  const emotiLowerPos = { x: 0, y: 1.5, z: 0 };

  let meshPos: { x: number; y: number; z: number } = $state(emotiLowerPos);
  let meshScale: { x: number; y: number; z: number } = $state({
    x: 1,
    y: 1,
    z: 1,
  });

  let meshRotation: { x: number; y: number; z: number } = $state({
    x: 0,
    y: 0,
    z: 0,
  });
  let font = useLoader(FontLoader).load("/fonts/noto_sans_jp.json");

  onMount(() => {
    const tl = createTimeline({ loop: true })
      .add(meshPos, {
        y: [emotiLowerPos.y + 1.3, emotiLowerPos.y + 0.2],
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
        y: [emotiLowerPos.y + 0.2, emotiLowerPos.y + 1.3],
        ease: eases.outCubic,
        duration: 500,
      });

    const tlRotation = createTimeline({ loop: true })
      .add(meshRotation, {
        y: [0, Math.PI / 12],
        ease: eases.inOutCubic,
        duration: 1000,
      })
      .add(meshRotation, {
        y: [Math.PI / 12, 0],
        ease: eases.inOutCubic,
        duration: 1000,
      })
      .add(meshRotation, {
        y: [0, -Math.PI / 12],
        ease: eases.inOutCubic,
        duration: 1000,
      })
      .add(meshRotation, {
        y: [-Math.PI / 12, 0],
        ease: eases.inOutCubic,
        duration: 1000,
      });

    tl.play();
    tlRotation.play();
  });
</script>

<T.Mesh
  position={[meshPos.x, meshPos.y, meshPos.z]}
  scale={[meshScale.x, meshScale.y, meshScale.z]}
  rotation={[meshRotation.x, meshRotation.y, meshRotation.z]}
  material.opacity={1}
  material.refractionRatio={0.98}
  material.transparent={false}
  ><Align>
    {#snippet children({ align })}
      {#if $font}
        <T.Mesh oncreate={align} position={[0, 0, 0]}>
          <Text3DGeometry text="(｡･_･｡)" font={$font} size={1.8} depth={0.3} />
          <T.MeshPhysicalMaterial
            color="#a23bcb"
            metalness={0.5}
            roughness={0.1}
          />
        </T.Mesh>
      {/if}
    {/snippet}
  </Align>
</T.Mesh>
