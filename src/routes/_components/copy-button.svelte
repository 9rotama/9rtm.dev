<script lang="ts">
  import { Check, Copy } from "@lucide/svelte";

  const { code }: { code: string } = $props();
  let copied = $state(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2000);
  }
</script>

<button
  onclick={copyCode}
  class="hover:bg-card-background-vivid rounded-lg p-2 transition-colors"
  aria-label="Copy code"
>
  {#if copied}
    <Check class="text-foreground size-4" />
  {:else}
    <Copy class="text-muted hover:text-foreground size-4" />
  {/if}
</button>
