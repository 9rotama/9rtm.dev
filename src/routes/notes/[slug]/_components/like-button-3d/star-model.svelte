<script lang="ts">
  import { T, useTask } from "@threlte/core";
  import { useGltf } from "@threlte/extras";
  import { mode } from "mode-watcher";
  import { Color } from "three";
  import { getLikeButtonColors } from "./colors";

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

  const colors = $derived(
    getLikeButtonColors(mode.current === "dark" ? "dark" : "light"),
  );

  const color = $derived(isLiked ? colors.starLiked : colors.starUnliked);

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
      emissive={new Color(colors.starEmissive)}
      emissiveIntensity={isLiked ? 2.0 : mode.current !== "dark" ? 1.0 : 0}
    />
  </T.Mesh>
{/if}
