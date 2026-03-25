<script lang="ts">
  import { T, useTask } from "@threlte/core";
  import { useGltf, useGltfAnimations } from "@threlte/extras";

  const basePos = { x: 0, y: -0.5, z: 0 };
  const floatAmplitude = 0.15;
  const floatSpeed = 1.5;

  let time = $state(0);

  const gltf = useGltf("/models/mascot.glb");
  const { actions } = useGltfAnimations(gltf);

  $effect(() => {
    if ($actions) {
      for (const action of Object.values($actions)) {
        action?.play();
      }
    }
  });

  useTask((delta) => {
    time += delta;

    if ($gltf) {
      const tailRoot = $gltf.nodes["tail_root"];
      if (tailRoot) {
        tailRoot.rotation.z = Math.sin(time * 1.2) * 0.15;
        tailRoot.rotation.x = Math.sin(time * 0.9) * 0.1;
      }

      const tailTip = $gltf.nodes["tail_tip"];
      if (tailTip) {
        tailTip.rotation.y += delta * 3;
      }
    }
  });

  const floatY = $derived(
    basePos.y + Math.sin(time * floatSpeed) * floatAmplitude,
  );
  const rotX = $derived(Math.sin(time * 0.4) * 0.08);
  const rotY = $derived(Math.sin(time * 0.3) * 0.35);
  const rotZ = $derived(Math.sin(time * 0.5) * 0.06);
</script>

{#if $gltf}
  <T.Group
    position={[basePos.x, floatY, basePos.z]}
    rotation={[rotX, rotY, rotZ]}
  >
    <T is={$gltf.scene} scale={1.3} />
  </T.Group>
{/if}
