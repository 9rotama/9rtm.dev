<script>
  import EmotiKun from "./_components/emoti-kun/emoti-kun.svelte";
  import Heading from "./_components/heading.svelte";
  import GitHub from "./_components/icons/github.svelte";
  import Zenn from "./_components/icons/zenn.svelte";
</script>

<main>
  <EmotiKun />
  <div class="mt-10">
    <Heading text="me" />
    <div class="mt-4 flex flex-row items-center justify-center gap-8">
      <img
        src="./avatar.png"
        alt="avatar"
        class="mt-4 h-32 w-32 rounded-full"
      />
      <div class="flex flex-col items-start">
        <div class="mt-4 text-lg">9rotama / くろたま</div>
        <div class="text-muted mt-1 text-sm">web front & gl</div>
        <div class="mt-4 flex flex-row items-center gap-2 text-sm">
          <a class="size-6" href="https://github.com/9rotama"><GitHub /></a>
          <a class="size-5" href="https://zenn.dev/9rotama"><Zenn /></a>
        </div>
      </div>
    </div>
  </div>
  <div class="mt-10">
    <Heading text="repos" subText="" />
  </div>
</main>
