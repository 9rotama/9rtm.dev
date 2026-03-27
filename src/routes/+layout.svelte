<script lang="ts">
  import { PUBLIC_BASE_URL } from "$env/static/public";
  import "@fontsource-variable/mona-sans";
  import "@fontsource/iosevka/400.css";
  import "@fontsource/iosevka/700.css";
  import "@fontsource/m-plus-1/400.css";
  import "@fontsource/m-plus-1/700.css";

  import { ModeWatcher } from "mode-watcher";
  import "../app.css";
  import Footer from "./_components/footer.svelte";
  import NavBar from "./_components/nav-bar.svelte";
  let { children, data } = $props();

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "9rtm.dev",
    url: PUBLIC_BASE_URL,
    author: {
      "@type": "Person",
      name: "9rotama",
      url: "https://github.com/9rotama",
      jobTitle: "web developer",
    },
  });
</script>

<svelte:head>
  <link rel="canonical" href={data.canonicalUrl} />
  <link
    rel="alternate"
    type="application/rss+xml"
    title="9rtm.dev"
    href="/rss.xml"
  />
  <title>9rtm.dev</title>
  <meta
    name="description"
    content="9rotama / くろたまのプロフィール・技術ブログ。フロントエンド開発やThree.jsについて書いています。"
  />
  <meta name="twitter:card" content="summary" />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html '<script type="application/ld+json">' + jsonLd + "<" + "/script>"}
</svelte:head>

<ModeWatcher />
<div class="mx-auto flex min-h-screen max-w-2xl flex-col px-4 pb-28">
  <div class="mx-2 flex-1">
    {@render children()}
  </div>
  <div class="mt-30">
    <Footer />
  </div>
</div>
<NavBar />
