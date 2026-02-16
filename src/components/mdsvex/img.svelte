<script lang="ts">
  import type { HTMLImgAttributes } from "svelte/elements";

  const { title, ...rest }: HTMLImgAttributes = $props();
</script>

<figure class="mt-8 mb-8">
  <img {...rest} class="border-border-solid rounded-lg border" />
  {#if title}
    <figcaption class="text-muted mt-2 text-center text-sm">
      {title}
    </figcaption>
  {/if}
</figure>
