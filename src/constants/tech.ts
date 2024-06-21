import React from "@/assets/tech-icons/react.svg";
import Nextjs from "@/assets/tech-icons/nextjs.svg";
import Python from "@/assets/tech-icons/python.svg";
import Typescript from "@/assets/tech-icons/typescript.svg";
import P5 from "@/assets/tech-icons/p5.svg";
import Svelte from "@/assets/tech-icons/svelte.svg";
import Unity from "@/assets/tech-icons/unity.svg";
import Framer from "@/assets/tech-icons/framermotion.svg";
export const techs = {
  react: { name: "react", iconSrc: React.src },
  nextjs: { name: "nextjs", iconSrc: Nextjs.src },
  python: { name: "python", iconSrc: Python.src },
  typescript: { name: "typescript", iconSrc: Typescript.src },
  p5: { name: "p5", iconSrc: P5.src },
  svelte: { name: "svelte", iconSrc: Svelte.src },
  unity: { name: "unity", iconSrc: Unity.src },
  framer: { name: "framer-motion", iconSrc: Framer.src },
} as const;

export type Tech = keyof typeof techs;
