<script lang="ts">
  import "@fontsource/exo-2";
  import "@fontsource/m-plus-2";
  import "@fontsource/michroma";
  import "../app.css";
  import Header from "./_components/header.svelte";

  let { children } = $props();
</script>

<div class="mx-auto max-w-2xl px-4">
  <Header />
  <div class="mt-10">
    {@render children()}
  </div>
</div>
