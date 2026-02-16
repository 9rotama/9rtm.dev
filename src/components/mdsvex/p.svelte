<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  const {
    children,
    ...rest
  }: HTMLAttributes<HTMLParagraphElement> & { children: Snippet } = $props();
</script>

<p {...rest} class="mb-4 text-base/8">
  {@render children()}
</p>
