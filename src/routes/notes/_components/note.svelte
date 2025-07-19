<script lang="ts">
  import { formatDate } from "date-fns";
  import Zenn from "../../_components/icons/zenn.svelte";
  import type { Note } from "../_lib/note";

  let { data }: { data: Note } = $props();
</script>

<div class="flex flex-row items-center gap-6 py-4">
  {#if data.thumbnail.type === "emoji"}
    <span class="text-5xl">{data.thumbnail.emoji}</span>
  {:else}
    <img
      src={data.thumbnail.href}
      alt="thumbnail"
      class="h-16 w-16 object-cover"
    />
  {/if}
  <div class="flex flex-col items-start gap-2">
    <a
      href={data.href}
      target={data.platform !== "self" ? "_blank" : undefined}
      rel={data.platform !== "self" ? "noopener noreferrer" : undefined}
      class="line-clamp-2 text-lg font-bold decoration-dotted hover:underline"
    >
      {data.title}
    </a>
    <div class="text-muted flex flex-row items-center gap-2 text-sm">
      {formatDate(data.publishedAt, "yyyy / MM / dd")}
      <span class="size-4">
        {#if data.platform === "zenn"}
          <Zenn />
        {/if}
      </span>
    </div>
  </div>
</div>
