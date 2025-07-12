<script lang="ts">
  import "@fontsource/exo-2";
  import "@fontsource/m-plus-2";
  import "@fontsource/michroma";
  import "../app.css";
  import Header from "./_components/header.svelte";

  let { children } = $props();
</script>

<main class="mx-auto max-w-2xl px-8">
  <Header />
  {@render children()}
</main>
