import styles from "./page.module.css";

import ProjectCard from "@/components/home/project-card";
import KaomojiKun from "@/components/home/kaomoji-kun";
import { Tech } from "@/constants/tech";

export default function Home() {
  return (
    <main>
      <div className={styles.hero}>
        <div>
          <div className={styles.intro}>
            <p>hi there,</p>
            <p>
              i&apos;m <span className={styles.name}>9rotama</span> 👋
            </p>
          </div>
        </div>
      </div>
      <article className={styles.article}>
        <h2>⌨️ hobby projects</h2>
        <div className={styles.cards}>
          {hobbyProjects.map(
            (proj) =>
              proj.display && (
                <div key={proj.id} className={styles.card}>
                  <ProjectCard data={proj} />
                </div>
              ),
          )}
        </div>
        <h2>📃 notes</h2>

        <h2>💜 emoti-kun</h2>
        <div className={styles.kaomoji}>
          <KaomojiKun />
        </div>
      </article>
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
