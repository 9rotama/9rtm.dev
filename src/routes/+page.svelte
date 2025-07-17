<script>
  import EmotiKun from "./_components/emoti-kun/emoti-kun.svelte";
  import Heading from "./_components/heading.svelte";
</script>

<main>
  <EmotiKun />
  <div class="font-display mt-10">
    <Heading text="me" />
    <div class="mt-4 text-center text-sm">
      くろたま といいます。web フロントをメインにやってます。m(_ _)m
    </div>
    <div class="mt-2 flex flex-row justify-center gap-4 text-sm">
      <a
        class="decoration-accent underline underline-offset-4"
        href="https://www.github.com/9rotama">github</a
      >
      <a
        class="decoration-accent underline underline-offset-4"
        href="https://unityroom.com/users/yvjut4emw1hza62bnif5">unityroom</a
      >
      <a
        class="decoration-accent underline underline-offset-4"
        href="https://zenn.dev/9rotama">zenn</a
      >
    </div>
  </div>
  <div class="mt-10">
    <Heading text="repos" subText="" />
  </div>
</main>
