<script lang="ts">
  import { Search } from "@lucide/svelte";
  import type { PageProps } from "./$types";
  import Note from "./_components/note.svelte";

  let { data }: PageProps = $props();

  let searchQuery = $state("");

  const filteredNotes = $derived.by(() => {
    if (!searchQuery.trim()) return data.notes;

    const query = searchQuery.toLowerCase();
    const filtered = data.notes.filter((note) =>
      note.title.toLowerCase().includes(query),
    );

    return filtered;
  });
</script>

<main class="mx-auto mt-16 max-w-lg">
  <div class="flex flex-row items-center justify-center gap-2">
    <img
      alt="title frame"
      src="title-frame.svg"
      class="size-5 -scale-x-100 animate-pulse"
    />
    <h1
      class="from-foreground via-foreground to-accent bg-gradient-to-b bg-clip-text text-2xl font-bold tracking-wider text-transparent"
    >
      notes
    </h1>
    <img alt="title frame" src="title-frame.svg" class="size-5 animate-pulse" />
  </div>
  <p class="text-muted mt-4 text-center text-sm tracking-widest">
    雑記 & zennなど
  </p>
  <div class="mt-10 flex flex-col items-center">
    <label
      class="bg-muted/10 ring-muted/30 flex w-full max-w-[400px] flex-row items-center gap-2 rounded-full px-4 py-2 ring-1 focus-within:ring-2"
    >
      <Search class="text-muted size-5" />
      <input
        type="search"
        placeholder="search notes..."
        class="placeholder-muted w-full max-w-[400px] text-sm shadow-sm focus:outline-none"
        bind:value={searchQuery}
      />
    </label>

    <div class="mt-16 flex w-full flex-col">
      {#each filteredNotes as note, i (i)}
        <Note data={note} />
        <div
          class="from-border/0 via-border to-border/0 h-[1px] w-full bg-gradient-to-r"
        ></div>
      {/each}
    </div>
  </div>
</main>

<svelte:head>
  <title>notes | 9rtm.dev</title>
</svelte:head>
