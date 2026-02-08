<script lang="ts">
  import { T } from "@threlte/core";
  import { useGltf } from "@threlte/extras";

  interface Props {
    isLiked: boolean;
  }

  const { isLiked }: Props = $props();

  const gltf = useGltf("/models/star.glb");

  const color = $derived(isLiked ? "#F9F0FF" : "#808080");

  // いいね時の回転アニメーション
  let rotation = $state(0);
</script>

{#if $gltf}
  <T.Mesh
    geometry={$gltf.nodes.Star001?.geometry}
    rotation.y={rotation}
    position.y={0}
  >
    <T.MeshStandardMaterial {color} />
  </T.Mesh>
{/if}
