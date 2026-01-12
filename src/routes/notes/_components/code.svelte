<script lang="ts">
  import type { Snippet } from "svelte";

  const { children }: { children: Snippet } = $props();
</script>

<code
  class="bg-pre-background font-code border-border mx-1 inline rounded-lg border px-1 py-0.5 text-[0.9em]"
>
  {@render children()}
</code>
