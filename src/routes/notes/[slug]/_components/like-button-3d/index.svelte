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
  let hasTransitioned = $state(false);

  const canHover =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover)").matches;

  function handlePointerEnter() {
    if (canHover) isHovered = true;
  }
  function handlePointerLeave() {
    isHovered = false;
  }
  function handlePointerDown() {
    if (!canHover) isHovered = true;
  }
  function handlePointerUp() {
    if (!canHover) isHovered = false;
  }

  async function handleClick() {
    if (isLiked) return;

    hasTransitioned = true;
    isLiked = true;

    await postLike(slug);
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
    onpointerenter={handlePointerEnter}
    onpointerleave={handlePointerLeave}
    onpointerdown={handlePointerDown}
    onpointerup={handlePointerUp}
    class="flex cursor-pointer flex-row items-center gap-2 overflow-clip rounded-full transition-colors"
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
