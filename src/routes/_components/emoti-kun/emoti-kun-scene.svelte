<script lang="ts">
  import { T, useThrelte } from "@threlte/core";
  import { OrbitControls } from "@threlte/extras";

  import { mode } from "mode-watcher";
  import { Color } from "three";
  import { getEmotiKunColors } from "./colors";
  import EmotiKunFloor from "./emoti-kun-floor.svelte";
  import EmotiKunText from "./emoti-kun-text.svelte";

  interface Props {
    hovered?: boolean;
  }

  const { hovered = false }: Props = $props();

  const { scene } = useThrelte();

  const colors = $derived(
    getEmotiKunColors(mode.current === "dark" ? "dark" : "light"),
  );

  $effect(() => {
    scene.background = new Color(colors.background);
  });
</script>

<EmotiKunText {hovered} />
<EmotiKunFloor />
<T.PerspectiveCamera makeDefault fov={50} position={[0, 3, 8]}>
  <OrbitControls target={[0, 1.5, 0]} enableZoom={false} />
</T.PerspectiveCamera>
<T.AmbientLight intensity={3} color={colors.pointLight} />
<T.RectAreaLight
  position={[0, -1, 0]}
  rotation={[Math.PI / 2, 0, 0]}
  intensity={5}
  width={5}
  height={5}
  visible
  color={colors.rectAreaLight}
/>
