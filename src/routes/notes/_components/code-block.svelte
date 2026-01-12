<script lang="ts">
  import type { Snippet } from "svelte";
  import CopyButton from "../../_components/copy-button.svelte";

  const {
    lang,
    code,
    children,
  }: { lang?: string; code: string; children: Snippet } = $props();

  let isActive = $state(false);

  function handlePointerDown(e: PointerEvent) {
    if (e.pointerType === "touch") {
      e.stopPropagation();
      isActive = true;
    }
  }

  function handlePointerDownOutside(e: PointerEvent) {
    if (e.pointerType === "touch") {
      e.stopPropagation();
      isActive = false;
    }
  }
</script>

<svelte:window onpointerdown={handlePointerDownOutside} />

<div
  class="code-block bg-pre-background border-border group relative mt-8 mb-8 rounded-lg border"
  data-lang={lang}
  onpointerdown={handlePointerDown}
>
  {#if lang}
    <span class="text-muted block px-4 pt-2 text-xs">{lang}</span>
  {/if}
  <pre class="m-0 border-none bg-transparent">
    <code
      class="font-code m-0 block overflow-x-auto bg-transparent p-4 pb-2 text-sm"
      >{@render children()}</code
    >
  </pre>
  <div
    class="copy-button-wrapper absolute top-2 right-2 transition-opacity"
    class:active={isActive}
  >
    <CopyButton {code} />
  </div>
</div>

<style>
  .copy-button-wrapper {
    opacity: 0;
  }

  /* PC: ホバーで表示 */
  @media (hover: hover) {
    .group:hover .copy-button-wrapper {
      opacity: 1;
    }
  }

  /* タッチデバイス: タップで表示 */
  @media (hover: none) {
    .copy-button-wrapper.active {
      opacity: 1;
    }
  }
</style>
