<script lang="ts">
  import { PUBLIC_BASE_URL } from "$env/static/public";
  import { ArrowLeft, Upload } from "@lucide/svelte";
  import { formatDate } from "date-fns";
  import type { PageProps } from "./$types";
  import LikeButton from "./_components/like-button-3d/index.svelte";
  const { data }: PageProps = $props();

  const ogpUrl = new URL(
    `/notes/${encodeURIComponent(data.slug)}/ogp.webp`,
    PUBLIC_BASE_URL,
  ).toString();

  const Component = $derived(data.component);
</script>

<svelte:head>
  <title>{data.metadata.title} | 9rtm.dev</title>
  <meta property="og:title" content={data.metadata.title} />
  <meta property="og:image" content={ogpUrl} />
</svelte:head>

<a
  href="/notes"
  class="group text-muted hover:text-foreground font-display absolute top-4 left-4 flex items-center gap-2 text-sm"
>
  <ArrowLeft
    class="size-5 transition-transform ease-out group-hover:-translate-x-1 group-hover:transform"
  /> <span>back to index</span>
</a>
<main class="mx-auto mt-16">
  <div class="flex flex-col items-center">
    <p class="text-6xl">{data.metadata.emoji}</p>
    <h1
      class=" to-heading-foreground-shade text-heading-foreground font-body mt-4 bg-clip-text text-2xl font-bold tracking-tight"
    >
      {data.metadata.title}
    </h1>

    <div class="text-muted mt-2 flex flex-row items-center gap-2 text-sm">
      <Upload class="size-4" />{formatDate(
        data.metadata.published_at,
        "MMM dd, yyyy",
      )}
    </div>
  </div>
  <div
    class="from-border/0 via-border to-border/0 mt-8 h-[1px] w-full bg-gradient-to-r"
  ></div>
  <div class="mt-8">
    <article class="markdown">
      <Component />
    </article>
  </div>
  <div class="mt-12 flex justify-center">
    <LikeButton slug={data.slug} />
  </div>
</main>
