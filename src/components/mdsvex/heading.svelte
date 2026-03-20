<script lang="ts">
  import { Check, Link } from "@lucide/svelte";
  import type { Snippet } from "svelte";

  type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

  const {
    level,
    id,
    children,
  }: { level: HeadingLevel; id?: string; children: Snippet } = $props();

  const iconSize: Record<HeadingLevel, string> = {
    1: "size-6",
    2: "size-5",
    3: "size-4",
    4: "size-4",
    5: "size-3.5",
    6: "size-3.5",
  };

  const headingStyles: Record<HeadingLevel, string> = {
    1: "mt-20 mb-8 text-3xl tracking-tight font-bold",
    2: "mt-18 mb-6 text-2xl tracking-tight font-bold",
    3: "mt-12 mb-4 text-xl tracking-tight font-bold",
    4: "mt-6 mb-4 text-lg tracking-tight font-bold",
    5: "mt-6 mb-4 text-base tracking-tight font-bold",
    6: "mt-6 mb-4 text-base tracking-tight font-bold",
  };

  let copied = $state(false);

  async function copyLink() {
    if (!id) return;
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    await navigator.clipboard.writeText(url);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2000);
  }
</script>

<svelte:element
  this={`h${level}`}
  {id}
  class="text-heading-foreground group flex items-center {headingStyles[level]}"
>
  <span>{@render children()}</span>
  {#if id}
    <button
      onclick={copyLink}
      class="text-muted hover:text-foreground ml-2 opacity-0 transition-opacity duration-100 group-hover:opacity-100"
      aria-label="Copy link to section"
    >
      {#if copied}
        <Check class={iconSize[level]} />
      {:else}
        <Link class={iconSize[level]} />
      {/if}
    </button>
  {/if}
</svelte:element>
