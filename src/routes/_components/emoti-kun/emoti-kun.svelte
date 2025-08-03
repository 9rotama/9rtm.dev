<script lang="ts">
  import { Canvas } from "@threlte/core";
  import EmotiKunScene from "./emoti-kun-scene.svelte";
</script>

<div
  class="mx-auto mt-8 aspect-[5/3] w-full max-w-[600px] overflow-clip rounded-lg"
>
  <Canvas>
    <EmotiKunScene />
  </Canvas>
</div>
