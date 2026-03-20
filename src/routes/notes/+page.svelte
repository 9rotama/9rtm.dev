<script lang="ts">
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { page } from "$app/state";
  import type { PageProps } from "./$types";
  import GradientBorder from "../_components/gradient-border.svelte";
  import Note from "./_components/note.svelte";
  import Tag from "./_components/tag.svelte";
  import Mascot from "./_components/mascot.svelte";

  let { data }: PageProps = $props();

  const selectedTag = $derived(
    browser ? page.url.searchParams.get("tag") : null,
  );

  const allTags = $derived.by(() => {
    const tagSet = new Set<string>();
    for (const note of data.notes) {
      for (const tag of note.tags) {
        tagSet.add(tag);
      }
    }
    return [...tagSet].sort();
  });

  const filteredNotes = $derived.by(() => {
    if (!selectedTag) return data.notes;
    return data.notes.filter((note) => note.tags.includes(selectedTag));
  });

  function selectTag(tag: string | null) {
    const url = new URL(page.url);
    if (tag) {
      url.searchParams.set("tag", tag);
    } else {
      url.searchParams.delete("tag");
    }
    goto(url, { replaceState: true, noScroll: true });
  }
</script>

<main class="relative mx-auto mt-16 max-w-lg">
  <div class="flex flex-row items-center justify-center gap-2">
    <img
      alt="title frame"
      src="/title-frame.svg"
      class="size-5 -scale-x-100 animate-pulse"
    />
    <h1
      class="font-display from-heading-foreground via-heading-foreground to-heading-foreground-shade bg-gradient-to-b bg-clip-text text-xl text-transparent"
    >
      notes
    </h1>
    <img
      alt="title frame"
      src="/title-frame.svg"
      class="size-5 animate-pulse"
    />
  </div>
  <p class="text-muted mt-4 text-center text-sm tracking-widest">
    雑記・備忘録
  </p>
  <div class="mt-10 flex flex-col items-center">
    <div class="flex flex-wrap justify-center gap-2">
      <button onclick={() => selectTag(null)}>
        <Tag active={selectedTag === null} />
      </button>
      {#each allTags as tag (tag)}
        <button onclick={() => selectTag(tag)}>
          <Tag {tag} active={selectedTag === tag} />
        </button>
      {/each}
    </div>

    <div class="mt-16 flex w-full flex-col">
      {#each filteredNotes as note, i (i)}
        <Note data={note} />
        <GradientBorder />
        <!--↓svelteが動的ルート用のOGPをクロールさせるための空リンク-->
        <a
          class="hidden"
          href={`/notes/${encodeURIComponent(note.slug)}/ogp.webp`}
          aria-label="ogp"
        ></a>
      {/each}
    </div>
  </div>
  <div class="mx-auto mt-16 size-[230px]">
    <Mascot />
  </div>
</main>

<svelte:head>
  <title>notes | 9rtm.dev</title>
  <meta property="og:title" content="notes | 9rtm.dev" />
</svelte:head>
