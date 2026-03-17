<script lang="ts">
  import { T, useTask, useThrelte } from "@threlte/core";
  import { animate } from "animejs";
  import { mode } from "mode-watcher";
  import {
    BloomEffect,
    EffectComposer,
    EffectPass,
    RenderPass,
  } from "postprocessing";
  import { onMount } from "svelte";
  import { Color } from "three";
  import { getLikeButtonColors } from "./colors";
  import StarModel from "./star-model.svelte";

  // ===================
  // Constants
  // ===================

  const TRANSMISSION_RESOLUTION_SCALE = 2.0;

  // Bloom settings
  const BLOOM_INTENSITY_LIKED_DARK = 10;
  const BLOOM_INTENSITY_LIKED_LIGHT = 3;
  const BLOOM_INTENSITY_DEFAULT = 0;
  const BLOOM_LUMINANCE_THRESHOLD_DARK = 0.3;
  const BLOOM_LUMINANCE_THRESHOLD_LIGHT = 0.6;

  // Lens settings
  const LENS_IOR_DEFAULT = 1.0;
  const LENS_IOR_HOVERED = 1.25;
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
  // Props
  // ===================

  interface Props {
    isLiked: boolean;
    isHovered: boolean;
  }

  const { isLiked, isHovered }: Props = $props();

  // ===================
  // State
  // ===================

  const colors = $derived(
    getLikeButtonColors(mode.current === "dark" ? "dark" : "light"),
  );

  // 3つの星の位置・スケール・回転
  let star1 = $state({ ...STAR1_UNLIKED });
  let star2 = $state({ ...STAR2_UNLIKED });
  let star3 = $state({ ...STAR3_UNLIKED });

  // 各星のアニメーション格納用
  let star1Anim: ReturnType<typeof animate> | null = null;
  let star2Anim: ReturnType<typeof animate> | null = null;
  let star3Anim: ReturnType<typeof animate> | null = null;

  // レンズアニメーション用
  const effectValues = { ior: LENS_IOR_DEFAULT };
  let lensIor = $state(LENS_IOR_DEFAULT);
  let currentAnimation: ReturnType<typeof animate> | null = null;

  // 可視状態
  let isVisible = $state(true);

  // ===================
  // Initialization
  // ===================

  const { scene, renderer, camera, renderStage } = useThrelte();

  $effect(() => {
    scene.background = new Color(colors.background);
  });

  // transmission解像度を上げる
  renderer.transmissionResolutionScale = TRANSMISSION_RESOLUTION_SCALE;

  // postprocessing setup
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera.current));

  const bloomEffect = new BloomEffect({
    intensity: BLOOM_INTENSITY_DEFAULT,
    luminanceThreshold: BLOOM_LUMINANCE_THRESHOLD_DARK,
    luminanceSmoothing: 0.9,
    radius: 0.7,
    mipmapBlur: true,
  });
  composer.addPass(new EffectPass(camera.current, bloomEffect));

  // 可視時のみレンダリング
  onMount(() => {
    const canvas = renderer.domElement;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    observer.observe(canvas);
    return () => observer.disconnect();
  });

  useTask(
    (delta) => {
      if (!isVisible) return;
      composer.render(delta);
    },
    { stage: renderStage, autoInvalidate: true },
  );

  // ===================
  // Effects
  // ===================

  // isLikedとモードに応じてbloomを調整
  $effect(() => {
    const isDark = mode.current === "dark";
    const likedIntensity = isDark
      ? BLOOM_INTENSITY_LIKED_DARK
      : BLOOM_INTENSITY_LIKED_LIGHT;
    bloomEffect.intensity = isLiked ? likedIntensity : BLOOM_INTENSITY_DEFAULT;
    bloomEffect.luminanceMaterial.threshold = isDark
      ? BLOOM_LUMINANCE_THRESHOLD_DARK
      : BLOOM_LUMINANCE_THRESHOLD_LIGHT;
  });

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

  // レンズアニメーション
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
</script>

<T.PerspectiveCamera makeDefault fov={70} position={[0, 0, 5]} />
<T.AmbientLight intensity={0.3} color={colors.ambientLight} />

<T.PointLight
  position={[0, 6, 2]}
  intensity={100}
  color={colors.pointLight}
  castShadow
/>
<T.PointLight
  position={[0, -10, -1]}
  intensity={100}
  color={colors.pointLight}
  castShadow
/>

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
  <T.SphereGeometry args={[1.2, 64, 64]} />
  <T.MeshPhysicalMaterial
    transmission={1}
    roughness={0.4}
    clearcoatRoughness={0.8}
    thickness={10}
    ior={lensIor}
    transparent
    iridescence={0.06}
    dispersion={7.0}
    color="#f8f4ff"
  />
</T.Mesh>
