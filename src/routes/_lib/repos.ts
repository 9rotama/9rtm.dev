type Tech =
  | "nextjs"
  | "framer"
  | "svelte"
  | "unity"
  | "python"
  | "react"
  | "three-vrm"
  | "remix"
  | "idb";

export type Repo = {
  id: string;
  name: string;
  links?: { label: string; href: string }[];
  githubLink?: { href: string };
  description: string;
  type: "web" | "game";
  techs: Tech[];
  display: true | false;
};

export const repos: Repo[] = [
  {
    id: "vrm-companion-vscode",
    name: "vrm-companion-vscode",
    links: [
      {
        label: "vscode marketplace",
        href: "https://marketplace.visualstudio.com/items?itemName=9rotama.vrm-companion-vscode",
      },
    ],
    githubLink: { href: "https://github.com/9rotama/vrm-companion-vscode" },
    description: "vscodeでVRMアバターとお仕事",
    type: "web",
    techs: ["react", "three-vrm"],
    display: true,
  },
  {
    id: "yahtzee-scoresheet",
    name: "yahtzee-scoresheet",
    links: [
      {
        label: "app link",
        href: "https://yahtzee-scoresheet-five.vercel.app/",
      },
    ],
    githubLink: { href: "https://github.com/9rotama/yahtzee-scoresheet" },
    description: "ヤッツィー/ヤムスの得点表アプリ",
    type: "web",
    techs: ["remix", "idb"],
    display: true,
  },
  {
    id: "dumb-slides-maker",
    name: "dumb-slides-maker",
    links: [
      {
        label: "app link",
        href: "https://dumb-slides-maker.vercel.app/",
      },
    ],
    githubLink: { href: "https://github.com/9rotama/dumb-slides-maker" },
    description: "ダサいスライド作成ツール",
    type: "web",
    techs: ["svelte"],
    display: true,
  },
  {
    id: "polyforce",
    name: "POLYFORCE",
    links: [
      { label: "unityroom.com", href: "https://unityroom.com/games/polyforce" },
    ],
    description: "重力を反転させ、キューブをうまく操ろう",
    type: "game",
    techs: ["unity"],
    display: true,
  },
  {
    id: "re-translate-bot",
    name: "re-translate-bot",
    githubLink: { href: "https://github.com/9rotama/re-translate-bot" },
    description: "discordの会話を勝手に再翻訳するbot",
    type: "web",
    techs: ["python"],
    display: true,
  },
];
