<script lang="ts">
  type Props = {
    text: string;
    subText?: string;
  };
  let { text, subText }: Props = $props();
</script>

<div class="flex flex-col items-center gap-2">
  <div class="flex flex-row items-center justify-center gap-2">
    <img
      alt="title frame"
      src="title-frame.svg"
      class="size-3 -scale-x-100 animate-pulse"
    />
    <h2 class="font-display">
      <span
        class="from-foreground via-foreground to-accent bg-gradient-to-b bg-clip-text text-lg tracking-tighter text-transparent"
      >
        {text}
      </span>
    </h2>
    <img alt="title frame" src="title-frame.svg" class="size-3 animate-pulse" />
  </div>
  {#if subText}
    <p class="text-muted text-sm tracking-tighter">{subText}</p>
  {/if}
</div>
