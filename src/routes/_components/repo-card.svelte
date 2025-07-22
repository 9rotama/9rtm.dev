<script lang="ts">
  import { ExternalLinkIcon } from "@lucide/svelte";
  import type { Repo } from "../_lib/repos";
  import Github from "./icons/github.svelte";

  interface Props {
    data: Repo;
  }

  let { data }: Props = $props();
</script>

<div
  class="to-card-background-lower from-card-background border-border/50 flex size-full flex-col rounded-xl border bg-gradient-to-b px-4 pt-3 pb-4 shadow-sm"
>
  <div class="flex grow flex-col items-start gap-1">
    <div class="flex w-full flex-row content-between">
      <div class="text-muted w-full text-xs font-bold tracking-wider">
        {data.type}
      </div>
      <div class="flex flex-row gap-2">
        {#if data.githubLink}
          <a class="size-4" href={data.githubLink.href}>
            <Github />
          </a>
        {/if}
        {#if data.links}
          {#each data.links as link (link.href)}
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              <ExternalLinkIcon class="size-4" />
            </a>
          {/each}
        {/if}
      </div>
    </div>
    <div class="font-bold">{data.name}</div>
    <div class="text-muted text-sm">{data.description}</div>
  </div>
  <div class="font-code mt-2 flex flex-row items-center gap-2 text-xs">
    {#each data.techs as tech (tech)}
      <span
        class="bg-foreground/10 text-muted rounded-full px-2 py-1 drop-shadow-2xl"
        >{tech}</span
      >
    {/each}
  </div>
</div>
