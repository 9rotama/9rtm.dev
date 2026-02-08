<script lang="ts">
  import { Canvas } from "@threlte/core";
  import { postLike } from "../../_lib/like-api";
  import { getLikedNotes, setLiked } from "../../_lib/liked-notes";
  import LikeScene from "./like-scene.svelte";

  interface Props {
    slug: string;
  }

  const { slug }: Props = $props();

  // eslint-disable-next-line svelte/prefer-writable-derived
  let isLiked = $state(false);
  let isHovered = $state(false);
  let mousePosition = $state({ x: -1, y: 1 });
  let hasTransitioned = $state(false);

  $effect(() => {
    isLiked = getLikedNotes()[slug] ?? false;
  });

  async function handleClick() {
    if (isLiked) return;

    // 楽観的更新
    hasTransitioned = true;
    isLiked = true;
    setLiked(slug, true);

    const success = await postLike(slug);
    if (!success) {
      isLiked = false;
      setLiked(slug, false);
    }
  }

  function handleMouseMove(event: MouseEvent) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    mousePosition = {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((event.clientY - rect.top) / rect.height) * 2 + 1,
    };
  }
</script>

<button
  onclick={handleClick}
  onmouseenter={() => (isHovered = true)}
  onmouseleave={() => (isHovered = false)}
  onmousemove={handleMouseMove}
  disabled={isLiked}
  class={[
    "from-card-background-vivid to-card-background-vivid-dark hover:from-card-background-dark hover:to-card-background-vivid bg-gradient-to-b",
    "border-border flex cursor-pointer flex-row items-center gap-2 rounded-full border p-2 px-4 transition-colors disabled:cursor-default",
  ]}
>
  <div class="size-10">
    <Canvas>
      <LikeScene {isLiked} {isHovered} {mousePosition} />
    </Canvas>
  </div>
  <div
    class="text-muted relative w-12 text-center text-sm font-bold tracking-wider"
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
</button>
