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
  class="group to-card-background-dark from-card-background-vivid-light hover:to-card-background-vivid-light hover:from-card-background-dark border-border rounded-lg border bg-gradient-to-b p-1.5 transition-colors"
  aria-label="Copy code"
>
  {#if copied}
    <Check class="text-muted size-4" />
  {:else}
    <Copy class="text-muted size-4" />
  {/if}
</button>
