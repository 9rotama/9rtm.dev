<script lang="ts">
  import type { HTMLVideoAttributes } from "svelte/elements";

  type Props = HTMLVideoAttributes & {
    title?: string;
    width?: number;
    height?: number;
    autoplay?: boolean;
    controls?: boolean;
  };

  const {
    title,
    width,
    height,
    autoplay = true,
    controls = false,
    ...rest
  }: Props = $props();
</script>

<figure class="mt-8 mb-8 flex flex-col items-center">
  <video
    {...rest}
    {width}
    {height}
    {autoplay}
    loop={autoplay}
    muted={autoplay}
    {controls}
    playsinline
    class="rounded-lg"
  ></video>
  {#if title}
    <figcaption class="text-muted mt-2 text-center text-sm">
      {title}
    </figcaption>
  {/if}
</figure>
