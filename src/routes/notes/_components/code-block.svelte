<script lang="ts">
  import type { Snippet } from "svelte";
  import CopyButton from "../../_components/copy-button.svelte";

  const {
    lang,
    code,
    children,
  }: { lang?: string; code: string; children: Snippet } = $props();
</script>

<div class="code-block group relative" data-lang={lang}>
  {@render children()}
  <div
    class="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
  >
    <CopyButton {code} />
  </div>
</div>
