<script lang="ts">
  import { T, useTask } from "@threlte/core";
  import EmotiKunFloorFrag from "./emoti-kun-floor.frag?raw";
  import EmotiKunFloorVert from "./emoti-kun-floor.vert?raw";

  let time = $state(0);

  useTask(
    (delta) => {
      time += delta;
    },
    { autoStart: true },
  );
</script>

<T.Mesh
  rotation={[Math.PI * -0.5, 0, 0]}
  position={[0, 0, 0]}
  receiveShadow
  castShadow={false}
>
  <T.PlaneGeometry args={[10, 10]} />
  <T.ShaderMaterial
    fragmentShader={EmotiKunFloorFrag}
    vertexShader={EmotiKunFloorVert}
    uniforms={{
      u_time: { value: 0 },
    }}
    uniforms.u_time.value={time}
  />
</T.Mesh>
