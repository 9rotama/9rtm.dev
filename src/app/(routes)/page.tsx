import styles from "./page.module.css";

import ProjectCard from "@/features/projects/components/project-card";
import Article from "@/components/article";
import { getZennArticles } from "@/features/articles/lib/api";
import { formatDate } from "date-fns";
import SlideUp from "@/components/slide-up";
import EmotiKun from "@/features/emoti-kun/components/canvas";
import { Tech } from "@/features/projects/constants/tech";

export default async function Home() {
  const notes = (await getZennArticles()).articles;
  return (
    <main>
      <SlideUp delay={200}>
        <div className={styles.hero}>
          <div className={styles.intro}>
            <p>hi there,</p>
            <p>
              i&apos;m <span className={styles.name}>9rotama</span> 👋
            </p>
          </div>
        </div>
      </SlideUp>

      <SlideUp delay={400}>
        <Article>
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
          <h2>📃 recent notes</h2>
          <div className={styles.notes}>
            {notes.map((a) => (
              <div className={styles.note} key={a.id}>
                <div className={styles.noteEmoji}>{a.emoji}</div>
                <div className={styles.noteContent}>
                  <a
                    href={"https://zenn.dev" + a.path}
                    className={styles.noteTitle}
                  >
                    {a.title}
                  </a>
                  <div className={styles.noteDate}>
                    {"zenn / " +
                      formatDate(new Date(a.published_at), "yyyy年MM月dd日")}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2>💜 emoti-kun</h2>
          <div className={styles.kaomoji}>
            <EmotiKun />
          </div>
        </Article>
      </SlideUp>
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
