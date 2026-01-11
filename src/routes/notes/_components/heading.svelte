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

<svelte:element this={`h${level}`} {id} class="group flex items-center">
  <span>{@render children()}</span>
  {#if id}
    <button
      onclick={copyLink}
      class="text-muted hover:text-foreground ml-2 opacity-0 transition-opacity group-hover:opacity-100"
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
