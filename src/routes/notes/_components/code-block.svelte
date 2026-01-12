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
  class="code-block border-border group bg-pre-background relative mt-8 mb-8 rounded-lg border p-0 inset-shadow-[0_8px_16px_rgba(2,0,5,0.4)]"
  data-lang={lang}
  onpointerdown={handlePointerDown}
>
  {#if lang}<span
      class="text-muted bg-background border-border font-code ml-2 inline-block rounded-b-md border border-t-0 px-2 py-1 align-top text-xs drop-shadow-[0_8px_8px_rgba(2,0,5,0.4)]"
      >{lang}</span
    >{/if}
  <pre class="m-0 border-none bg-transparent"><code
      class="font-code m-0 block overflow-x-auto bg-transparent p-4 pt-2 text-sm"
      >{@render children()}</code
    ></pre>
  <div
    class="copy-button-wrapper absolute top-2 right-2 drop-shadow-[0_8px_8px_rgba(2,0,5,0.4)] transition-opacity"
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
