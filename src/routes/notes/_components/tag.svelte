<script lang="ts">
  let {
    tag,
    active = false,
    size = "md",
    variant = "filled",
  }: {
    tag?: string;
    active?: boolean;
    size?: "sm" | "md";
    variant?: "filled" | "plain";
  } = $props();
</script>

<div
  class={[
    "font-display border-border/50 rounded-full border transition-colors duration-150",
    size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
    variant === "filled" && " from-background to-accent/20  bg-gradient-to-b",
    active
      ? "to-accent/50 text-foreground"
      : "text-muted hover:text-foreground",
  ]}
>
  {#if tag}
    <span class="mr-0.5">#</span>{tag}
  {:else}
    all
  {/if}
</div>
