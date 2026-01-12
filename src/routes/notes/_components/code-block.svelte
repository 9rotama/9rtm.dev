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
  class="code-block group relative"
  data-lang={lang}
  onpointerdown={handlePointerDown}
>
  {@render children()}
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
