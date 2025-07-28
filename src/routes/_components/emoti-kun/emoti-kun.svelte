<script lang="ts">
  import { Canvas } from "@threlte/core";
  import EmotiKunScene from "./emoti-kun-scene.svelte";
</script>

<div
  class="mx-auto aspect-square w-full max-w-[600px] overflow-clip rounded-lg md:aspect-[4/3]"
>
  <Canvas>
    <EmotiKunScene />
  </Canvas>
</div>
