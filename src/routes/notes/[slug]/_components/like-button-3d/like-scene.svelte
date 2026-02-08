<script lang="ts">
  import { T } from "@threlte/core";
  import StarModel from "./star-model.svelte";

  interface Props {
    isLiked: boolean;
    isHovered: boolean;
    mousePosition: { x: number; y: number };
  }

  const { isLiked, isHovered, mousePosition }: Props = $props();

  // カーソル位置に基づいてライトの位置を計算
  const lightPosition = $derived({
    x: mousePosition.x * 2,
    y: mousePosition.y * 2,
    z: 3,
  });

  console.log(isHovered);
</script>

<T.PerspectiveCamera makeDefault fov={50} position={[0, 0, 5]} />
<T.AmbientLight intensity={0.3} />
<T.PointLight
  position={[lightPosition.x, lightPosition.y, lightPosition.z]}
  intensity={15}
  color="#bc84f1"
  visible
/>

<StarModel {isLiked} />
