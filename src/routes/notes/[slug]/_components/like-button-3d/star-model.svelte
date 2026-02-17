<script lang="ts">
  import { T } from "@threlte/core";
  import { useGltf } from "@threlte/extras";

  interface Props {
    isLiked: boolean;
  }

  const { isLiked }: Props = $props();

  const gltf = useGltf("/models/star.glb");

  const color = $derived(isLiked ? "#EDF" : "#EDF");

  // いいね時の回転アニメーション
  let rotation = $state(0);
</script>

{#if $gltf}
  <T.Mesh geometry={$gltf.nodes.Star001?.geometry} rotation.y={rotation}>
    <T.MeshBasicMaterial {color} wireframe />
  </T.Mesh>
{/if}
