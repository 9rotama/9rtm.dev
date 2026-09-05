<script lang="ts">
  import { onMount } from "svelte";
  import { postLike } from "../../_lib/like-api";
  import {
    getLikedFromStorage,
    setLikedToStorage,
  } from "../../_lib/like-storage";

  interface Props {
    slug: string;
  }

  const { slug }: Props = $props();

  let isLiked = $state(!!getLikedFromStorage()[slug]);
  let isHovered = $state(false);
  let hasTransitioned = $state(false);
  let container = $state<HTMLDivElement>();
  let LikeScene = $state<
    null | typeof import("./like-scene-wrapper.svelte").default
  >(null);

  onMount(() => {
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        void import("./like-scene-wrapper.svelte").then((module) => {
          LikeScene = module.default;
        });
        observer.disconnect();
      },
      { rootMargin: "200px" },
    );
    observer.observe(container);
    return () => observer.disconnect();
  });

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
    setLikedToStorage(slug, true);

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
    type="button"
    onclick={handleClick}
    onpointerenter={handlePointerEnter}
    onpointerleave={handlePointerLeave}
    onpointerdown={handlePointerDown}
    onpointerup={handlePointerUp}
    aria-label={isLiked ? "いいね済み" : "この記事にいいねする"}
    aria-pressed={isLiked}
    class="focus-visible:outline-accent flex cursor-pointer flex-row items-center gap-2 overflow-clip rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
  >
    <div bind:this={container} aria-hidden="true" class="size-20">
      {#if LikeScene}
        <LikeScene {isLiked} {isHovered} />
      {/if}
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
