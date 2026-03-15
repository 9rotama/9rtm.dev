<script lang="ts">
  import { T, useTask } from "@threlte/core";
  import { mode } from "mode-watcher";
  import { Color } from "three";
  import { getEmotiKunColors } from "./colors";
  import EmotiKunFloorFrag from "./emoti-kun-floor.frag?raw";
  import EmotiKunFloorVert from "./emoti-kun-floor.vert?raw";

  const colors = $derived(
    getEmotiKunColors(mode.current === "dark" ? "dark" : "light"),
  );

  const gridColor = $derived(new Color(colors.floorGrid).convertLinearToSRGB());
  const bgColor = $derived(new Color(colors.floorBg).convertLinearToSRGB());

  let time = $state(0);

  useTask(
    (delta) => {
      time += delta;
    },
    { autoStart: true },
  );
</script>

<T.Mesh rotation={[Math.PI * -0.5, 0, 0]} position={[0, 0, 0]}>
  <T.PlaneGeometry args={[10, 10]} />
  <T.ShaderMaterial
    fragmentShader={EmotiKunFloorFrag}
    vertexShader={EmotiKunFloorVert}
    uniforms={{
      u_time: { value: 0 },
      u_grid_r: { value: 0 },
      u_grid_g: { value: 0 },
      u_grid_b: { value: 0 },
      u_bg_r: { value: 0 },
      u_bg_g: { value: 0 },
      u_bg_b: { value: 0 },
    }}
    uniforms.u_time.value={time}
    uniforms.u_grid_r.value={gridColor.r}
    uniforms.u_grid_g.value={gridColor.g}
    uniforms.u_grid_b.value={gridColor.b}
    uniforms.u_bg_r.value={bgColor.r}
    uniforms.u_bg_g.value={bgColor.g}
    uniforms.u_bg_b.value={bgColor.b}
    alphaTest={0.5}
  />
</T.Mesh>
