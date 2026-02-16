<script lang="ts">
  import { T, useThrelte } from "@threlte/core";
  import { Color } from "three";
  import StarModel from "./star-model.svelte";

  const { scene } = useThrelte();
  scene.background = new Color("#0e0d17");

  interface Props {
    isLiked: boolean;
    isHovered: boolean;
    mousePosition: { x: number; y: number };
  }

  const { isLiked, isHovered, mousePosition }: Props = $props();

  // カーソル位置に基づいてライトの位置を計算
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const lightPosition = $derived({
    x: mousePosition.x * 2,
    y: mousePosition.y * 2,
    z: 3,
  });

  console.log(isHovered);
</script>

<T.PerspectiveCamera makeDefault fov={70} position={[0, 0, 5]} />

<StarModel {isLiked} />
