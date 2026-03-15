<script lang="ts">
  import { Upload } from "@lucide/svelte";
  import { formatDate } from "date-fns";
  import Zenn from "../../_components/icons/zenn.svelte";
  import type { Note } from "../_lib/note";
  import Tag from "./tag.svelte";

  let {
    data,
    align = "left",
    showExcerpt = false,
  }: {
    data: Note;
    align?: "left" | "center";
    showExcerpt?: boolean;
  } = $props();
</script>

<a
  href={data.href}
  target={data.platform !== "self" ? "_blank" : undefined}
  rel={data.platform !== "self" ? "noopener noreferrer" : undefined}
  class={[
    "group relative isolate flex rounded-lg px-4 py-4",
    align === "center"
      ? "flex-col items-center gap-3 text-center"
      : "-mx-4 flex-row items-center gap-6",
  ]}
>
  <div
    class="from-active-lighting absolute inset-0 -z-10 rounded-lg bg-radial-[ellipse_at_bottom] to-transparent to-70% opacity-0 transition-opacity duration-200 group-hover:opacity-100"
  ></div>
  {#if data.thumbnail.type === "emoji"}
    <span class="text-4xl">{data.thumbnail.emoji}</span>
  {:else}
    <img
      src={data.thumbnail.href}
      alt="thumbnail"
      class="h-16 w-16 object-cover"
    />
  {/if}
  <div
    class={[
      "flex flex-col gap-2",
      align === "center" ? "items-center" : "items-start",
    ]}
  >
    <span class="text-md line-clamp-2 font-bold">
      {data.title}
    </span>
    <div class="text-muted flex flex-row items-center gap-2 text-xs">
      <span class="flex items-center gap-1">
        <Upload class="size-3" />{formatDate(data.publishedAt, "MMM dd, yyyy")}
      </span>
      <span class="size-4">
        {#if data.platform === "zenn"}
          <Zenn />
        {/if}
      </span>
    </div>
    {#if showExcerpt && data.excerpt}
      <p class="text-muted line-clamp-2 text-xs leading-relaxed">
        {data.excerpt}
      </p>
    {/if}
    {#if data.tags.length > 0}
      <div class="flex flex-wrap gap-1">
        {#each data.tags as tag (tag)}
          <Tag {tag} size="sm" variant="plain" />
        {/each}
      </div>
    {/if}
  </div>
</a>
