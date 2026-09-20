<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  const { children, ...rest }: HTMLAnchorAttributes & { children: Snippet } =
    $props();
</script>

<a
  {...rest}
  class="text-link decoration-link/30 hover:text-foreground underline underline-offset-4 transition-colors duration-100 hover:decoration-2"
>
  {@render children()}
</a>
