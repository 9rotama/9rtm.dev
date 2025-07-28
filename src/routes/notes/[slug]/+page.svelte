<script lang="ts">
  import { ArrowLeft, Clock } from "@lucide/svelte";
  import { formatDate } from "date-fns";
  import type { PageProps } from "./$types";
  const { data }: PageProps = $props();
</script>

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
      class="from-foreground via-foreground to-accent mt-4 bg-gradient-to-b bg-clip-text text-[1.7rem] font-bold tracking-tight text-transparent"
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
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <article class="markdown mt-8">{@html data.html}</article>
</main>
