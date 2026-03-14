<script lang="ts">
  import { ArrowRight } from "@lucide/svelte";
  import EmotiKun from "./_components/emoti-kun/emoti-kun.svelte";
  import Heading from "./_components/heading.svelte";
  import GitHub from "./_components/icons/github.svelte";
  import Zenn from "./_components/icons/zenn.svelte";
  import RepoCard from "./_components/repo-card.svelte";
  import Note from "./notes/_components/note.svelte";
  import { repos } from "./_lib/repos";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
</script>

<main>
  <EmotiKun />
  <div class="mt-10">
    <Heading text="me" />
    <div class="mt-4 flex flex-row items-center justify-center gap-8">
      <enhanced:img
        src="./_img/avatar.png"
        alt="avatar"
        class="mt-4 h-32 w-32 rounded-full"
      />
      <div class="flex flex-col items-start">
        <div class="mt-4 font-bold">9rotama / くろたま</div>
        <div class="text-muted mt-1 text-sm">
          front-end developer<br class="sm:hidden" />
          <a
            href="https://www.fuller-inc.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-foreground decoration-accent font-bold underline underline-offset-4 transition-colors duration-100 hover:decoration-3"
            >@fuller-inc</a
          >
        </div>
        <div class="mt-4 flex flex-row items-center gap-2 text-sm">
          <a
            class="size-6"
            href="https://github.com/9rotama"
            aria-label="GitHubプロフィールを開く"><GitHub /></a
          >
          <a
            class="size-5"
            href="https://zenn.dev/9rotama"
            aria-label="Zennプロフィールを開く"><Zenn /></a
          >
        </div>
      </div>
    </div>
    <p class="text-muted mt-6 text-center text-sm leading-relaxed">
      人に優しいインタラクションやcreative codingに興味があります。<br />
      リズムゲームが好きです。
    </p>
  </div>

  {#if data.latestNote}
    <div class="mt-10">
      <Heading text="latest note" />
      <div class="mt-4">
        <Note data={data.latestNote} align="center" />
      </div>
      <a
        href="/notes"
        class="group text-muted hover:text-foreground font-display mt-2 flex items-center justify-center gap-2 text-sm transition-colors"
      >
        <span>view all notes</span>
        <ArrowRight
          class="size-4 transition-transform ease-out group-hover:translate-x-1"
        />
      </a>
    </div>
  {/if}

  <div class="mt-10">
    <Heading text="crafts" subText="" />
    <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2">
      {#each repos as repo (repo.id)}
        {#if repo.display}
          <RepoCard data={repo} />
        {/if}
      {/each}
    </div>
  </div>
</main>
