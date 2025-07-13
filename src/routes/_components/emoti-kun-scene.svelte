<script lang="ts">
  import { T } from "@threlte/core";
  import EmotiKunFloor from "./emoti-kun-floor.svelte";
</script>

<T.Mesh >
  <T.SphereGeometry args={[2, 64, 64]} />
  <T.MeshStandardMaterial color="#2f1b41" />
</T.Mesh>
<EmotiKunFloor />
<T.PointLight position={[2, 2, 4]} intensity={10} color="#fff" />
<T.HemisphereLight intensity={2} color="#bc84f1" />
