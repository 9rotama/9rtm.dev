<script lang="ts">
  import { Canvas } from "@threlte/core";
  import LikeScene from "./like-scene.svelte";

  interface Props {
    isLiked: boolean;
    isHovered: boolean;
  }

  const { isLiked, isHovered }: Props = $props();
</script>

<Canvas autoRender={false}>
  <LikeScene {isLiked} {isHovered} />
</Canvas>
