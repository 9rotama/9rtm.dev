<script lang="ts">
  let {
    tag,
    active = false,
  }: {
    tag?: string;
    active?: boolean;
  } = $props();
</script>

<div
  class="border-border/50 from-background to-accent/20 font-display rounded-full border bg-gradient-to-b px-3 py-1 text-xs transition-colors duration-150
    {active
    ? 'to-accent/50 text-foreground'
    : 'text-muted hover:text-foreground'}"
>
  {#if tag}
    <span class="mr-0.5">#</span>{tag}
  {:else}
    all
  {/if}
</div>
