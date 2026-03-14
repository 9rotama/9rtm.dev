<script lang="ts">
  import { ArrowLeft, ArrowRight } from "@lucide/svelte";

  type NavNote = { slug: string; title: string };
  type Direction = "prev" | "next";

  let {
    prevNote,
    nextNote,
  }: {
    prevNote: NavNote | null;
    nextNote: NavNote | null;
  } = $props();
</script>

{#snippet navItem(note: NavNote, direction: Direction)}
  {@const isPrev = direction === "prev"}
  <a
    href="/notes/{note.slug}"
    class="group text-muted hover:text-foreground relative flex min-w-0 flex-1 flex-col gap-1 rounded-lg p-4 transition-colors duration-200
      {isPrev ? '' : 'items-end'}"
  >
    <!-- hover時の背景グラデーション -->
    <div
      class="from-card-background-vivid-light/70 absolute inset-0 -z-10 rounded-lg to-transparent mask-y-from-70% mask-y-to-100% opacity-0 transition-opacity duration-200 group-hover:opacity-100
        {isPrev ? 'bg-gradient-to-r' : 'bg-gradient-to-l'}"
    ></div>
    <!-- グラデーションborder -->
    <div
      class="from-border/0 via-border to-border/0 absolute inset-y-0 w-[1px] bg-gradient-to-b
        {isPrev ? 'left-0' : 'right-0'}"
    ></div>
    <span class="font-display flex items-center gap-1 text-xs">
      {#if isPrev}
        <ArrowLeft
          class="size-3 transition-transform group-hover:-translate-x-1"
        />
        prev
      {:else}
        next
        <ArrowRight
          class="size-3 transition-transform group-hover:translate-x-1"
        />
      {/if}
    </span>
    <span class="truncate text-sm">{note.title}</span>
  </a>
{/snippet}

{#if prevNote || nextNote}
  <div class="mt-16 flex items-stretch justify-between gap-4">
    {#if prevNote}
      {@render navItem(prevNote, "prev")}
    {:else}
      <div class="flex-1"></div>
    {/if}
    {#if nextNote}
      {@render navItem(nextNote, "next")}
    {:else}
      <div class="flex-1"></div>
    {/if}
  </div>
{/if}
