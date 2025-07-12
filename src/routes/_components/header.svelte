<script>
  import { Moon } from "@lucide/svelte";
  import Title from "./title.svelte";
</script>

<header
  class="border-accent/30 flex flex-row items-center justify-between rounded-b-xl border-x border-b px-4 py-2 bg-gradient-to-b from-accent/10 to-accent/5"
>
  <button class="hover:bg-accent/10 grid place-items-center rounded-full p-1">
    <Moon class="fill-muted stroke-0" />
  </button>
  <a href="/">
    <Title />
  </a>

  <a href="/notes">notes</a>
</header>
