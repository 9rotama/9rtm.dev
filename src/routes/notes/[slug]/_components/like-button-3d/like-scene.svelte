<script lang="ts">
  import { T, useTask, useThrelte } from "@threlte/core";
  import { animate } from "animejs";
  import {
    ChromaticAberrationEffect,
    EffectComposer,
    EffectPass,
    LensDistortionEffect,
    RenderPass,
    VignetteEffect,
  } from "postprocessing";
  import { Color, Vector2 } from "three";
  import StarModel from "./star-model.svelte";

  const { scene, camera, renderer, renderStage } = useThrelte();
  scene.background = new Color("#0e0d17");

  interface Props {
    isLiked: boolean;
    isHovered: boolean;
    mousePosition: { x: number; y: number };
  }

  const { isLiked, isHovered, mousePosition }: Props = $props();

  // カーソル位置に基づいてライトの位置を計算
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const lightPosition = $derived({
    x: mousePosition.x * 2,
    y: mousePosition.y * 2,
    z: 3,
  });

  // postprocessing setup
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera.current));

  const chromaticAberration = new ChromaticAberrationEffect({
    radialModulation: true,
    modulationOffset: 0.2,
  });

  const lensDistortion = new LensDistortionEffect({
    distortion: new Vector2(0, 0),
    principalPoint: new Vector2(0, 0),
    focalLength: new Vector2(1, 1),
  });

  const vignette = new VignetteEffect({
    darkness: 0.75,
    offset: 0,
  });

  // LensDistortionはUV変換するので別のEffectPassに分ける
  const lensPass = new EffectPass(camera.current, lensDistortion);
  const chromaticPass = new EffectPass(camera.current, chromaticAberration);
  const vignettePass = new EffectPass(camera.current, vignette);
  composer.addPass(vignettePass);
  composer.addPass(lensPass);
  composer.addPass(chromaticPass);

  // エフェクト強度のターゲット値
  const TARGET_CHROMATIC_OFFSET = 0.04;
  const TARGET_DISTORTION = -0.65;

  // アニメーション用のオブジェクト
  const effectValues = { chromatic: 0, distortion: 0 };
  let currentAnimation: ReturnType<typeof animate> | null = null;

  // ホバー状態に応じてアニメーション
  $effect(() => {
    if (currentAnimation) {
      currentAnimation.pause();
    }

    currentAnimation = animate(effectValues, {
      chromatic: isHovered ? TARGET_CHROMATIC_OFFSET : 0.03,
      distortion: isHovered ? TARGET_DISTORTION : 0,
      duration: 200,
      ease: "inOutCirc",
      onUpdate: () => {
        chromaticAberration.offset.set(
          effectValues.chromatic,
          effectValues.chromatic,
        );
        lensDistortion.distortion.set(
          effectValues.distortion,
          effectValues.distortion,
        );
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

<StarModel {isLiked} />
