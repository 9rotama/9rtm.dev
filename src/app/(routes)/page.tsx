import GitHub from "@/assets/sns/github.svg";
import Zenn from "@/assets/sns/zenn.svg";
import { ArticleH2 } from "@/components/article";
import SnsLink from "@/components/sns-link";
import EmotiKun from "@/features/emoti-kun/components/canvas";
import ProjectCard from "@/features/projects/components/project-card";
import { Tech } from "@/features/projects/constants/tech";

export default async function Home() {
  return (
    <main>
      <div className="flex w-full flex-col items-start gap-8 mb-8">
        <div className="space-y-2 text-4xl font-bold">
          <div>hi there,</div>
          <div>
            i&apos;m <span className="text-accent">9rotama</span> 👋
          </div>
        </div>
        <div className="flex flex-row gap-4">
          {snsLinks.map((sns) => (
            <SnsLink key={sns.name} {...sns} />
          ))}
        </div>
      </div>

      <ArticleH2>⌨️ hobby projects</ArticleH2>
      <div className="grid grid-cols-1 gap-3 md:grid md:w-full md:grid-cols-2 md:gap-6 mt-4">
        {hobbyProjects.map(
          (proj) =>
            proj.display && (
              <div key={proj.id} className="w-full">
                <ProjectCard data={proj} />
              </div>
            ),
        )}
      </div>

      <ArticleH2>💜 emoti-kun</ArticleH2>
      <div className="w-full overflow-hidden rounded-lg mt-4">
        <EmotiKun />
      </div>
    </main>
  );
}

export type Project = {
  id: string;
  name: string;
  links?: { label: string; href: string }[];
  githubHref?: string;
  description: string;
  tag: "web" | "pages" | "game";
  techs: Tech[];
  display: true | false;
};

const hobbyProjects: Project[] = [
  {
    id: "yahtzee-scoresheet",
    name: "yahtzee-scoresheet",
    links: [
      {
        label: "yahtzee-scoresheet-five.vercel.app",
        href: "https://yahtzee-scoresheet-five.vercel.app/",
      },
    ],
    githubHref: "https://github.com/9rotama/yahtzee-scoresheet",
    description: "ヤッツィー/ヤムスの得点表アプリです。",
    tag: "web",
    techs: ["nextjs", "framer"],
    display: true,
  },
  {
    id: "dumb-slides-maker",
    name: "dumb-slides-maker",
    links: [
      {
        label: "dumb-slides-maker.vercel.app",
        href: "https://dumb-slides-maker.vercel.app/",
      },
    ],
    githubHref: "https://github.com/9rotama/dumb-slides-maker",
    description: "野暮ったいスライドをmarkdownで作れるwebアプリです。",
    tag: "web",
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
    tag: "game",
    techs: ["unity"],
    display: true,
  },
  {
    id: "re-translate-bot",
    name: "re-translate-bot",
    githubHref: "https://github.com/9rotama/re-translate-bot",
    description: "discord上の会話を勝手に再翻訳して置き換えてくれるbotです。",
    tag: "web",
    techs: ["python"],
    display: true,
  },
];

export type Sns = {
  svgId: string;
  name: string;
  href: string;
  iconSrc: string;
};

const snsLinks: Sns[] = [
  {
    svgId: "github",
    name: "GitHub",
    href: "https://github.com/9rotama",
    iconSrc: GitHub.src,
  },
  {
    svgId: "zenn",
    name: "Zenn",
    href: "https://zenn.dev/9rotama",
    iconSrc: Zenn.src,
  },
];
