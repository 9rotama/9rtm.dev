<script lang="ts">
  import { T, useTask } from "@threlte/core";
  import { Clock } from "three";
  import EmotiKunFloorFrag from "./emoti-kun-floor.frag?raw";
  import EmotiKunFloorVert from "./emoti-kun-floor.vert?raw";

  const clock = new Clock();
  let time = $state(0);

  useTask(
    (delta) => {
      time += delta;
    },
    { autoStart: true },
  );
</script>

<T.Mesh rotation={[Math.PI * -0.4, 0, 0]} position={[0, -3, -1]}>
  <T.PlaneGeometry args={[8,8]} />
  <T.ShaderMaterial
    fragmentShader={EmotiKunFloorFrag}
    vertexShader={EmotiKunFloorVert}
    uniforms={{
      u_time: { value: 0 },
    }}
    uniforms.u_time.value={time}

  />
</T.Mesh>