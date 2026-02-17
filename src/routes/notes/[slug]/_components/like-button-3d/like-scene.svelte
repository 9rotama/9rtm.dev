<script lang="ts">
  import { T, useTask, useThrelte } from "@threlte/core";
  import { animate } from "animejs";
  import {
    BloomEffect,
    EffectComposer,
    EffectPass,
    RenderPass,
  } from "postprocessing";
  import { Color } from "three";
  import StarModel from "./star-model.svelte";

  const { scene, renderer, camera, renderStage } = useThrelte();
  scene.background = new Color("#0e0d17");

  // transmission解像度を上げる
  renderer.transmissionResolutionScale = 2.0;

  interface Props {
    isLiked: boolean;
    isHovered: boolean;
  }

  const { isLiked, isHovered }: Props = $props();

  // postprocessing setup
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera.current));

  const bloomEffect = new BloomEffect({
    intensity: 0,
    luminanceThreshold: 0.3,
    luminanceSmoothing: 0.9,
    radius: 0.4,
    mipmapBlur: true,
  });
  composer.addPass(new EffectPass(camera.current, bloomEffect));

  // isLikedのときだけbloomを有効化
  $effect(() => {
    bloomEffect.intensity = isLiked ? 8 : 0;
  });

  // アニメーション用
  const TARGET_IOR = 1.16;
  const effectValues = { ior: 1.0 };
  let lensIor = $state(1.0);
  let currentAnimation: ReturnType<typeof animate> | null = null;

  $effect(() => {
    if (currentAnimation) {
      currentAnimation.pause();
    }

    currentAnimation = animate(effectValues, {
      ior: isHovered ? TARGET_IOR : 1.0,
      duration: 200,
      ease: "inOutCirc",
      onUpdate: () => {
        lensIor = effectValues.ior;
      },
    });
  });

  useTask(
    (delta) => {
      composer.render(delta);
    },
    { stage: renderStage, autoInvalidate: true },
  );
</script>

<T.PerspectiveCamera makeDefault fov={70} position={[0, 0, 5]} />
<T.AmbientLight intensity={0.3} color="#ddf" />

<T.PointLight position={[0, 6, 2]} intensity={150} color="#caf" castShadow />
<T.PointLight position={[0, -10, -1]} intensity={70} color="#caf" castShadow />

<StarModel {isLiked} />

<!-- Transmission球体でレンズ効果 -->
<T.Mesh position={[0, 0, 3]}>
  <T.SphereGeometry args={[1.19, 64, 64]} />
  <T.MeshPhysicalMaterial
    transmission={1}
    roughness={0.7}
    thickness={50}
    ior={lensIor}
    transparent
    iridescence={0.06}
    dispersion={4.0}
  />
</T.Mesh>
