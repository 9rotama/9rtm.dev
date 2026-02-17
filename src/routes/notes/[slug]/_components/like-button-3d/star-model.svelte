<script lang="ts">
  import { T, useTask } from "@threlte/core";
  import { useGltf } from "@threlte/extras";
  import { Color } from "three";

  interface Props {
    isLiked: boolean;
  }

  const { isLiked }: Props = $props();

  const gltf = useGltf("/models/star3.glb");

  const color = $derived(isLiked ? "#eee" : "#bbb");

  // ふよふよアニメーション
  let time = 0;
  let posY = $state(0);

  useTask((delta) => {
    time += delta;
    posY = Math.sin(time * 2) * 0.2;
  });
</script>

{#if $gltf}
  <T.Mesh
    geometry={$gltf.nodes.Star001?.geometry}
    position.y={posY}
    scale={0.8}
  >
    <T.MeshPhysicalMaterial
      metalness={0}
      roughness={0}
      {color}
      emissive={new Color("#769")}
      emissiveIntensity={isLiked ? 2.0 : 0}
    />
  </T.Mesh>
{/if}
