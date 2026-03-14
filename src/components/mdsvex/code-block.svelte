<script lang="ts">
  import type { Snippet } from "svelte";
  import CopyButton from "../../routes/_components/copy-button.svelte";

  const {
    lang,
    filename,
    code,
    children,
  }: { lang?: string; filename?: string; code: string; children: Snippet } =
    $props();

  const displayLabel = filename ?? lang;

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
  class="code-block border-border-solid group bg-pre-background inset-shadow-shadow relative mt-8 mb-8 rounded-lg border p-0 inset-shadow-sm"
  data-lang={lang}
  onpointerdown={handlePointerDown}
>
  {#if displayLabel}<span
      class="text-muted bg-background border-border font-code drop-shadow-shadow ml-2 inline-block rounded-b-md border border-t-0 px-2 py-1 align-top text-xs tracking-tighter drop-shadow-sm"
      >{displayLabel}</span
    >{/if}
  <pre class="m-0 border-none bg-transparent"><code
      class="font-code m-0 block overflow-x-auto bg-transparent p-4 pt-2 text-sm"
      >{@render children()}</code
    ></pre>
  <div
    class="copy-button-wrapper drop-shadow-shadow absolute top-2 right-2 drop-shadow transition-opacity"
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
