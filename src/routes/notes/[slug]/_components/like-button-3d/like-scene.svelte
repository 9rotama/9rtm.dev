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
    radius: 0.7,
    mipmapBlur: true,
  });
  composer.addPass(new EffectPass(camera.current, bloomEffect));

  // isLikedのときだけbloomを有効化
  $effect(() => {
    bloomEffect.intensity = isLiked ? 10 : 0;
  });

  // 3つの星の位置・スケール・回転
  let star1 = $state({ x: 0, y: 0, rotY: 0, scale: 0.7 });
  let star2 = $state({ x: -2, y: 2, rotY: 0, scale: 0 });
  let star3 = $state({ x: 2, y: 2, rotY: 0, scale: 0 });

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
        x: -0.6,
        y: -1.2,
        rotY: Math.PI * 2,
        scale: 0.5,
        duration: 80,
        delay: 0,
        ease: "inOutCirc",
      });
      star2Anim = animate(star2, {
        x: -0.7,
        y: 1.3,
        rotY: Math.PI * 2,
        scale: 0.3,
        duration: 80,
        delay: 6,
        ease: "inOutCirc",
      });
      star3Anim = animate(star3, {
        x: 1.1,
        y: 0.3,
        rotY: Math.PI * 2,
        scale: 0.4,
        duration: 80,
        delay: 3,
        ease: "inOutCirc",
      });
    } else {
      // 元の配置へ
      star1Anim = animate(star1, {
        x: 0,
        y: 0,
        rotY: 0,
        scale: 0.7,
        duration: 50,
        ease: "inOutCirc",
      });
      star2Anim = animate(star2, {
        x: -5,
        y: 5,
        rotY: 0,
        scale: 0.3,
        duration: 80,
        ease: "inOutCirc",
      });
      star3Anim = animate(star3, {
        x: 5,
        y: 5,
        rotY: 0,
        scale: 0.4,
        duration: 80,
        ease: "inOutCirc",
      });
    }
  });

  // レンズアニメーション用
  const TARGET_IOR = 1.2;
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
