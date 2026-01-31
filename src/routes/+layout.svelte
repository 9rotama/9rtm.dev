<script lang="ts">
  import { onNavigate } from "$app/navigation";
  import "@fontsource-variable/funnel-display";
  import "@fontsource-variable/geist-mono";
  import "@fontsource-variable/m-plus-1";
  import "../app.css";
  import Footer from "./_components/footer.svelte";
  import { PUBLIC_BASE_URL } from "$env/static/public";
  let { children, data } = $props();

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    // Skip animation if navigating to the same page
    if (navigation.from?.url.pathname === navigation.to?.url.pathname) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<svelte:head>
  <link rel="canonical" href={data.canonicalUrl} />
  <title>9rtm.dev</title>
  <meta name="description" content="9rotamaの個人サイト" />
  <meta property="og:title" content="9rtm.dev" />
  <meta
    property="og:image"
    content={new URL(`/ogp.webp`, PUBLIC_BASE_URL).toString()}
  />
  <meta name="twitter:card" content="summary" />
</svelte:head>

<div class="mx-auto max-w-2xl px-4 pb-12">
  <div class="mx-2">
    {@render children()}
  </div>
  <div class="mt-30">
    <Footer />
  </div>
</div>
