import styles from "./page.module.css";

import ProjectCard from "@/components/home/project-card";
import ProjectModal from "@/components/home/project-modal";
import ProjectModalContent from "@/components/home/project-modal-content";
import KaomojiKun from "@/components/home/kaomoji-kun";

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
        <h2>hobby projects</h2>
        <div className={styles.cards}>
          {hobbyProjects.map((proj) => (
            <div key={proj.id} className={styles.card}>
              <ProjectModal
                card={
                  <ProjectCard
                    id={proj.id}
                    name={proj.name}
                    previewSrc={proj.previewSrc}
                  />
                }
                content={
                  <ProjectModalContent
                    id={proj.id}
                    name={proj.name}
                    previewSrc={proj.previewSrc}
                    links={proj.links}
                    githubHref={proj.githubHref}
                    description={proj.description}
                    tags={proj.tags}
                  />
                }
                title={proj.name}
              />
            </div>
          ))}
        </div>
        <h2>recent posts</h2>

        <h2>emoti-kun</h2>
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
  previewSrc: string;
  links?: { label: string; href: string }[];
  githubHref?: string;
  description: string;
  tags?: string[];
};

const hobbyProjects: Project[] = [
  {
    id: "yahtzee-scoresheet",
    name: "yahtzee-scoresheet",
    previewSrc: "/projects/yahtzee-scoresheet.png",
    links: [
      {
        label: "yahtzee-scoresheet-five.vercel.app",
        href: "https://yahtzee-scoresheet-five.vercel.app/",
      },
    ],
    githubHref: "https://github.com/9rotama/yahtzee-scoresheet",
    description: "ヤッツィー/ヤムスの得点表アプリです。",
    tags: ["nextjs", "dexie", "web", "radix-ui", "framer-motion"],
  },
  {
    id: "dumb-slides-maker",
    name: "dumb-slides-maker",
    previewSrc: "/projects/dumb-slides-maker.png",
    links: [
      {
        label: "dumb-slides-maker.vercel.app",
        href: "https://dumb-slides-maker.vercel.app/",
      },
    ],
    githubHref: "https://github.com/9rotama/dumb-slides-maker",
    description: "野暮ったいスライドをmarkdownで作れるwebアプリです。",
    tags: ["svelte", "sveltekit", "marp", "nord", "web"],
  },
  {
    id: "polyforce",
    name: "POLYFORCE",
    previewSrc: "/projects/polyforce.png",
    links: [
      { label: "unityroom.com", href: "https://unityroom.com/games/polyforce" },
    ],
    description: "重力を反転させ、キューブをうまく操ろう",
    tags: ["unity", "game"],
  },
  {
    id: "re-translate-bot",
    name: "re-translate-bot",
    previewSrc: "/projects/re-translate-bot.png",
    githubHref: "https://github.com/9rotama/re-translate-bot",
    description: "discord上の会話を勝手に再翻訳して置き換えてくれるbotです。",
    tags: ["python", "discordbot"],
  },
];
