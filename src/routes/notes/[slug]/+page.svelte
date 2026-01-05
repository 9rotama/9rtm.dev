<script lang="ts">
  import { PUBLIC_BASE_URL } from "$env/static/public";
  import { ArrowLeft, Clock } from "@lucide/svelte";
  import { formatDate } from "date-fns";
  import { mount, unmount } from "svelte";
  import CopyButton from "../../_components/copy-button.svelte";
  import type { PageProps } from "./$types";
  const { data }: PageProps = $props();

  const ogpUrl = new URL(
    `/notes/${encodeURIComponent(data.slug)}/ogp.webp`,
    PUBLIC_BASE_URL,
  ).toString();

  let articleElement: HTMLElement | undefined = $state();
  let copyButtons: ReturnType<typeof mount>[] = [];

  $effect(() => {
    if (!articleElement) return;

    // Clean up previous buttons
    copyButtons.forEach((button) => unmount(button));
    copyButtons = [];

    // Add copy buttons to all pre code blocks
    const preElements = articleElement.querySelectorAll("pre");
    preElements.forEach((pre) => {
      const code = pre.querySelector("code");
      if (!code) return;

      const codeText = code.textContent || "";

      // Make pre relative for absolute positioning
      pre.style.position = "relative";

      // Create container for button
      const buttonContainer = document.createElement("div");
      pre.appendChild(buttonContainer);

      // Mount CopyButton component
      const button = mount(CopyButton, {
        target: buttonContainer,
        props: { code: codeText },
      });
      copyButtons.push(button);
    });

    return () => {
      copyButtons.forEach((button) => unmount(button));
      copyButtons = [];
    };
  });
</script>

<svelte:head>
  <title>{data.metadata.title} | 9rtm.dev</title>
  <meta property="og:title" content={data.metadata.title} />
  <meta property="og:image" content={ogpUrl} />
</svelte:head>

<a
  href="/notes"
  class="group text-muted hover:text-foreground absolute top-4 left-4 flex items-center gap-2 text-sm"
>
  <ArrowLeft
    class="size-5 transition-transform ease-out group-hover:-translate-x-1 group-hover:transform"
  /> back to index
</a>
<main class="mx-auto mt-16">
  <div class="flex flex-col items-center">
    <p class="text-6xl">{data.metadata.emoji}</p>
    <h1
      class=" to-heading-foreground-shade text-heading-foreground mt-4 bg-clip-text text-2xl font-bold tracking-tight"
    >
      {data.metadata.title}
    </h1>

    <div class="text-muted mt-2 flex flex-row items-center gap-2 text-sm">
      <Clock class="size-4" />{formatDate(
        data.metadata.published_at,
        "MMM dd, yyyy",
      )}
    </div>
  </div>
  <div
    class="from-border/0 via-border to-border/0 mt-8 h-[1px] w-full bg-gradient-to-r"
  ></div>
  <article bind:this={articleElement} class="markdown mt-8">
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html data.html}
  </article>
</main>
