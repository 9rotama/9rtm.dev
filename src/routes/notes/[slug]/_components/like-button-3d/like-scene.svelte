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

  // ===================
  // Constants
  // ===================

  const BACKGROUND_COLOR = "#0e0d17";
  const TRANSMISSION_RESOLUTION_SCALE = 2.0;

  // Bloom settings
  const BLOOM_INTENSITY_LIKED = 10;
  const BLOOM_INTENSITY_DEFAULT = 0;
  const BLOOM_CONFIG = {
    intensity: BLOOM_INTENSITY_DEFAULT,
    luminanceThreshold: 0.3,
    luminanceSmoothing: 0.9,
    radius: 0.7,
    mipmapBlur: true,
  } as const;

  // Lens settings
  const LENS_IOR_DEFAULT = 1.0;
  const LENS_IOR_HOVERED = 1.2;
  const LENS_ANIMATION_DURATION = 200;

  // Star liked positions (triangle formation)
  const STAR1_LIKED = { x: -0.6, y: -1.2, rotY: Math.PI * 2, scale: 0.5 };
  const STAR2_LIKED = { x: -0.7, y: 1.3, rotY: Math.PI * 2, scale: 0.3 };
  const STAR3_LIKED = { x: 1.1, y: 0.3, rotY: Math.PI * 2, scale: 0.4 };

  // Star unliked positions (initial/scattered)
  const STAR1_UNLIKED = { x: 0, y: 0, rotY: 0, scale: 0.7 };
  const STAR2_UNLIKED = { x: -5, y: 5, rotY: 0, scale: 0.3 };
  const STAR3_UNLIKED = { x: 5, y: 5, rotY: 0, scale: 0.4 };

  // Animation settings
  const STAR_ANIM_EASE = "inOutCirc" as const;
  const STAR_LIKED_DURATION = 80;
  const STAR_UNLIKED_DURATION_MAIN = 50;
  const STAR_UNLIKED_DURATION_SUB = 80;
  const STAR2_LIKED_DELAY = 6;
  const STAR3_LIKED_DELAY = 3;

  // ===================
  // Setup
  // ===================

  const { scene, renderer, camera, renderStage } = useThrelte();
  scene.background = new Color(BACKGROUND_COLOR);

  // transmission解像度を上げる
  renderer.transmissionResolutionScale = TRANSMISSION_RESOLUTION_SCALE;

  interface Props {
    isLiked: boolean;
    isHovered: boolean;
  }

  const { isLiked, isHovered }: Props = $props();

  // postprocessing setup
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera.current));

  const bloomEffect = new BloomEffect(BLOOM_CONFIG);
  composer.addPass(new EffectPass(camera.current, bloomEffect));

  // isLikedのときだけbloomを有効化
  $effect(() => {
    bloomEffect.intensity = isLiked
      ? BLOOM_INTENSITY_LIKED
      : BLOOM_INTENSITY_DEFAULT;
  });

  // 3つの星の位置・スケール・回転
  let star1 = $state({ ...STAR1_UNLIKED });
  let star2 = $state({ ...STAR2_UNLIKED });
  let star3 = $state({ ...STAR3_UNLIKED });

  // 各星のアニメーション格納用
  let star1Anim: ReturnType<typeof animate> | null = null;
  let star2Anim: ReturnType<typeof animate> | null = null;
  let star3Anim: ReturnType<typeof animate> | null = null;

  // isLikedで三角形配置アニメーション
  $effect(() => {
    star1Anim?.pause();
    star2Anim?.pause();
    star3Anim?.pause();

    if (isLiked) {
      // 三角形配置へ + 1回転
      star1Anim = animate(star1, {
        ...STAR1_LIKED,
        duration: STAR_LIKED_DURATION,
        delay: 0,
        ease: STAR_ANIM_EASE,
      });
      star2Anim = animate(star2, {
        ...STAR2_LIKED,
        duration: STAR_LIKED_DURATION,
        delay: STAR2_LIKED_DELAY,
        ease: STAR_ANIM_EASE,
      });
      star3Anim = animate(star3, {
        ...STAR3_LIKED,
        duration: STAR_LIKED_DURATION,
        delay: STAR3_LIKED_DELAY,
        ease: STAR_ANIM_EASE,
      });
    } else {
      // 元の配置へ
      star1Anim = animate(star1, {
        ...STAR1_UNLIKED,
        duration: STAR_UNLIKED_DURATION_MAIN,
        ease: STAR_ANIM_EASE,
      });
      star2Anim = animate(star2, {
        ...STAR2_UNLIKED,
        duration: STAR_UNLIKED_DURATION_SUB,
        ease: STAR_ANIM_EASE,
      });
      star3Anim = animate(star3, {
        ...STAR3_UNLIKED,
        duration: STAR_UNLIKED_DURATION_SUB,
        ease: STAR_ANIM_EASE,
      });
    }
  });

  // レンズアニメーション用
  const effectValues = { ior: LENS_IOR_DEFAULT };
  let lensIor = $state(LENS_IOR_DEFAULT);
  let currentAnimation: ReturnType<typeof animate> | null = null;

  $effect(() => {
    if (currentAnimation) {
      currentAnimation.pause();
    }

    currentAnimation = animate(effectValues, {
      ior: isHovered ? LENS_IOR_HOVERED : LENS_IOR_DEFAULT,
      duration: LENS_ANIMATION_DURATION,
      ease: STAR_ANIM_EASE,
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

<StarModel
  {isLiked}
  x={star1.x}
  y={star1.y}
  rotY={star1.rotY}
  scale={star1.scale}
/>
<StarModel
  {isLiked}
  x={star2.x}
  y={star2.y}
  rotY={star2.rotY}
  scale={star2.scale}
/>
<StarModel
  {isLiked}
  x={star3.x}
  y={star3.y}
  rotY={star3.rotY}
  scale={star3.scale}
/>

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
