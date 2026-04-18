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
</script>

<div
  class="code-block border-border-solid bg-pre-background inset-shadow-shadow relative mt-8 mb-8 rounded-lg border p-0 inset-shadow-sm"
  data-lang={lang}
>
  <div class="mx-2 flex items-start justify-between gap-2">
    {#if displayLabel}<span
        class="text-muted bg-background border-border font-code drop-shadow-shadow inline-block rounded-b-md border border-t-0 px-2 py-1 align-top text-xs tracking-tighter drop-shadow-sm"
        >{displayLabel}</span
      >{/if}
    <CopyButton
      {code}
      class="drop-shadow-shadow rounded-t-none rounded-b-md border-t-0 px-2 py-1 drop-shadow-sm"
    />
  </div>
  <pre class="m-0 border-none bg-transparent"><code
      class="font-code m-0 block overflow-x-auto bg-transparent p-4 pt-3 text-sm"
      >{@render children()}</code
    ></pre>
</div>
