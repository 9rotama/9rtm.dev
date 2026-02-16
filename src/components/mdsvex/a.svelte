<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  const { children, ...rest }: HTMLAnchorAttributes & { children: Snippet } =
    $props();
</script>

<a
  {...rest}
  class="text-foreground hover:text-foreground decoration-accent font-bold underline underline-offset-4 transition-colors duration-100 hover:decoration-3"
>
  {@render children()}
</a>
