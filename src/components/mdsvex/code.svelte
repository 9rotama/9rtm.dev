<script lang="ts">
  import type { Snippet } from "svelte";

  const { children }: { children: Snippet } = $props();
</script>

<code
  class="bg-pre-background font-code border-border text-code-foreground mx-0.75 inline rounded-md border px-1 py-0.25 text-[0.9em]"
>
  {@render children()}
</code>
