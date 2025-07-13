<script lang="ts">
  import "@fontsource/exo-2";
  import "@fontsource/m-plus-2";
  import "@fontsource/michroma";
  import "../app.css";
  import Header from "./_components/header.svelte";

  let { children } = $props();
</script>

<svelte:head>
  <title>9rtm.dev</title>
  <meta name="description" content="9rotamaの個人サイト" />
</svelte:head>

<div class="mx-auto max-w-2xl px-4">
  <Header />
  {@render children()}
</div>
