<script lang="ts">
  import { T } from "@threlte/core";
  import { Float } from "@threlte/extras";
  import EmotiKunFloor from "./emoti-kun-floor.svelte";
</script>

<Float floatIntensity={[2, 2, 2]} speed={5} rotationIntensity={2}>
  <T.Mesh position={[0, -0.2, 0]}>
    <T.SphereGeometry args={[2, 64, 64]} />
    <T.MeshStandardMaterial color="#301c3c" roughness={0.75} />
  </T.Mesh>
</Float>
<EmotiKunFloor />

<T.PointLight position={[2, 2, 4]} intensity={30} color="#bc84f1" />
<T.HemisphereLight args={["#8d42a3", "#cc7ee3", 3]} />
