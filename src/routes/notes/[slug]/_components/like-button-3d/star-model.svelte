<script lang="ts">
  import { T, useTask } from "@threlte/core";
  import { useGltf } from "@threlte/extras";
  import { Color } from "three";
  import { LIKE_BUTTON_COLORS } from "./colors";

  interface Props {
    isLiked: boolean;
    x?: number;
    y?: number;
    z?: number;
    rotY?: number;
    scale?: number;
  }

  const {
    isLiked,
    x = 0,
    y = 0,
    z = 0,
    rotY = 0,
    scale = 0.9,
  }: Props = $props();

  const gltf = useGltf("/models/star3.glb");

  const color = $derived(
    isLiked ? LIKE_BUTTON_COLORS.starLiked : LIKE_BUTTON_COLORS.starUnliked,
  );

  // ふよふよアニメーション
  let time = $state(0);

  useTask((delta) => {
    time += delta;
  });
</script>

{#if $gltf}
  <T.Mesh
    geometry={$gltf.nodes.Star001?.geometry}
    position.x={x}
    position.y={y + Math.sin(time * 2) * 0.1}
    position.z={z}
    rotation.y={rotY}
    {scale}
  >
    <T.MeshPhysicalMaterial
      metalness={0}
      roughness={0}
      {color}
      emissive={new Color(LIKE_BUTTON_COLORS.starEmissive)}
      emissiveIntensity={isLiked ? 2.0 : 0}
    />
  </T.Mesh>
{/if}
