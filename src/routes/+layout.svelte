<script lang="ts">
  import "@fontsource/exo-2";
  import "@fontsource/m-plus-2";
  import "@fontsource/michroma";
  import "../app.css";
  import Footer from "./_components/footer.svelte";
  import Header from "./_components/header.svelte";

  let { children } = $props();
</script>

<svelte:head>
  <title>9rtm.dev</title>
  <meta name="description" content="9rotamaの個人サイト" />
</svelte:head>

<div class="mx-auto max-w-2xl px-4">
  <Header />
  <div
    class="border-accent/20 from-header-background-upper/20 via-background to-header-background-upper/20 mx-2 mb-10 rounded-lg border-x border-b bg-gradient-to-r p-4"
  >
    {@render children()}
  </div>
  <Footer />
</div>
