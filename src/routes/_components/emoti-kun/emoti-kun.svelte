<script lang="ts">
  import { Canvas } from "@threlte/core";
  import EmotiKunScene from "./emoti-kun-scene.svelte";
</script>

<div
  class={[
    "mx-auto mt-8 aspect-[5/3] w-full max-w-[600px] overflow-clip rounded-2xl",
    "mask-x-from-90% mask-x-to-100%",
    "mask-y-from-90% mask-y-to-100%",
  ]}
>
  <Canvas>
    <EmotiKunScene />
  </Canvas>
</div>
