<script lang="ts">
  import Heading from "./heading.svelte";
  import type { Snippet } from "svelte";

  const { id, children }: { id?: string; children: Snippet } = $props();
</script>

<Heading level={6} {id}>{@render children()}</Heading>
