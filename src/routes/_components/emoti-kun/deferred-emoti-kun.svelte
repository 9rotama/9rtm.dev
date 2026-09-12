<script lang="ts">
  import { onMount } from "svelte";

  let container = $state<HTMLDivElement>();
  let EmotiKun = $state<null | typeof import("./emoti-kun.svelte").default>(
    null,
  );

  onMount(() => {
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        void import("./emoti-kun.svelte").then((module) => {
          EmotiKun = module.default;
        });
        observer.disconnect();
      },
      { rootMargin: "200px" },
    );
    observer.observe(container);
    return () => observer.disconnect();
  });
</script>

<div
  bind:this={container}
  class="mx-auto mt-8 aspect-[5/3] w-full max-w-[600px] overflow-clip rounded-2xl mask-y-from-90% mask-y-to-100% mask-x-from-90% mask-x-to-100%"
>
  {#if EmotiKun}
    <EmotiKun />
  {/if}
</div>
