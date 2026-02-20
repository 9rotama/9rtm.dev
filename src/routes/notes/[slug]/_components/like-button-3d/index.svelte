<script lang="ts">
  import { Canvas } from "@threlte/core";
  import { postLike } from "../../_lib/like-api";
  import LikeScene from "./like-scene.svelte";

  interface Props {
    slug: string;
  }

  const { slug }: Props = $props();

  let isLiked = $state(false);
  let isHovered = $state(false);
  // let mousePosition = $state({ x: -1, y: 1 });
  let hasTransitioned = $state(false);

  async function handleClick() {
    if (isLiked) return;

    // 楽観的更新
    hasTransitioned = true;
    isLiked = true;

    const success = await postLike(slug);
    if (!success) {
      isLiked = false;
    }
  }

  // function handleMouseMove(event: MouseEvent) {
  //   const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  //   mousePosition = {
  //     x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
  //     y: -((event.clientY - rect.top) / rect.height) * 2 + 1,
  //   };
  // }
</script>

<div class="flex flex-col items-center gap-3">
  <button
    onclick={handleClick}
    onmouseenter={() => (isHovered = true)}
    onmouseleave={() => (isHovered = false)}
    disabled={isLiked}
    class="flex cursor-pointer flex-row items-center gap-2 overflow-clip rounded-full transition-colors disabled:cursor-default"
  >
    <div class="size-20">
      <Canvas autoRender={false}>
        <LikeScene {isLiked} {isHovered} />
      </Canvas>
    </div>
  </button>

  <div
    class="text-muted font-display relative w-12 text-center text-xs tracking-wider"
  >
    <span
      class={[
        "absolute inset-0",
        isLiked ? "opacity-0" : "opacity-100",
        hasTransitioned && isLiked && "animate-blurred-fade-out",
      ]}
    >
      like
    </span>
    <span
      class={[
        isLiked ? "opacity-100" : "opacity-0",
        hasTransitioned && isLiked && "animate-blurred-fade-in",
      ]}
    >
      liked!
    </span>
  </div>
</div>
