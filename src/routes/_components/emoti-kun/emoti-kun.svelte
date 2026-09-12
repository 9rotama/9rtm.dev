<script lang="ts">
  import { Canvas } from "@threlte/core";
  import EmotiKunScene from "./emoti-kun-scene.svelte";

  let hovered = $state(false);
</script>

<div
  onpointerenter={() => (hovered = true)}
  onpointerleave={() => (hovered = false)}
  role="img"
>
  <Canvas>
    <EmotiKunScene {hovered} />
  </Canvas>
</div>
