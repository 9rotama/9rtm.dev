<script>
  import { Moon } from "@lucide/svelte";
  import Title from "./title.svelte";
</script>

<div class="fixed top-0 left-0 isolate flex w-full flex-col items-center px-2">
  <header
    class="font-display border-accent/30 from-header-background-upper to-header-background-lower grid w-full max-w-2xl grid-cols-3 items-center justify-between rounded-b-xl border-x border-b bg-gradient-to-b px-4 py-2"
  >
    <div class="justify-self-start">
      <button
        class="hover:bg-accent/10 grid place-items-center rounded-full p-1"
      >
        <Moon class="fill-foreground stroke-0" />
      </button>
    </div>
    <div class="justify-self-center">
      <a href="/" class="w-full">
        <Title />
      </a>
    </div>

    <div class="justify-self-end">
      <a href="/notes" class="text-sm">notes</a>
    </div>
  </header>
</div>
