<script lang="ts">
  import { formatDate } from "date-fns";
  import Zenn from "../../_components/icons/zenn.svelte";
  import type { Note } from "../_lib/note";

  let { data }: { data: Note } = $props();
</script>

<a
  href={data.href}
  target={data.platform !== "self" ? "_blank" : undefined}
  rel={data.platform !== "self" ? "noopener noreferrer" : undefined}
  class="group relative -mx-4 flex flex-row items-center gap-6 rounded-lg px-4 py-4"
>
  <div
    class="from-card-background-vivid absolute inset-0 -z-10 rounded-lg bg-radial-[ellipse_at_bottom] to-transparent to-70% opacity-0 transition-opacity duration-200 group-hover:opacity-100"
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
  <div class="flex flex-col items-start gap-2">
    <span class="text-md line-clamp-2 font-bold">
      {data.title}
    </span>
    <div class="text-muted flex flex-row items-center gap-2 text-xs">
      {formatDate(data.publishedAt, "MMM dd, yyyy")}
      <span class="size-4">
        {#if data.platform === "zenn"}
          <Zenn />
        {/if}
      </span>
    </div>
  </div>
</a>
