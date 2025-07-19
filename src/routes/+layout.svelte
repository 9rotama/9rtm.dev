<script lang="ts">
  import "@fontsource-variable/funnel-display";
  import "@fontsource-variable/m-plus-1";
  import "../app.css";
  import Footer from "./_components/footer.svelte";

  let { children } = $props();
</script>

<svelte:head>
  <title>9rtm.dev</title>
  <meta name="description" content="9rotamaの個人サイト" />
</svelte:head>

<div class="mx-auto max-w-2xl px-4">
  <div class="mx-2">
    {@render children()}
  </div>
  <div class="mt-20">
    <Footer />
  </div>
</div>
