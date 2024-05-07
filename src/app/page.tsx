import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import clsx from "clsx";
import ProjectCard from "@/components/home/project-card";
import ProjectModal from "@/components/home/project-modal";
import ProjectModalContent from "@/components/home/project-modal-content";

export default function Home() {
  return (
    <main>
      <div className={styles.hero}>
        <Image
          loading="eager"
          src="https://avatars.githubusercontent.com/u/65887771?v=4"
          alt="avatar"
          width={276}
          height={276}
          className={styles.avatar}
        />
        <p className={styles.name}>
          <span className={styles.at}>@</span>9rotama
        </p>
        <ul className={styles.snslinks}>
          {snsLinks.map((sns) => (
            <li key={sns.name}>
              <Link href={sns.href} aria-label={sns.name}>
                <div className={clsx(styles.snslogo, sns.class)} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <article className={styles.article}>
        <h2>about</h2>
        <p>
          i&apos;m a junior front-end developer in japan, making wasteful web
          apps and experimenting 3d technologies
        </p>
        <p>birthday: 2001/09/09</p>
        <p>live: fukushima → chiba</p>

        <h2>like</h2>
        <ul>
          <li>
            fonts
            <ul>
              <li>JIYUKOBO Ltd. (e.g. Hiragino series, Yu Series)</li>
              <li>TYPE-LABO (e.g. Nitarago, September)</li>
            </ul>
          </li>
          <li>
            rhythm games
            <ul>
              <li>i&apos;ve been playing jubeat, Arcaea and SDVX currently</li>
              <li>
                i enjoy designing levels myself, consider playability and
                aesthetics
              </li>
            </ul>
          </li>
        </ul>

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
      </article>
    </main>
  );
}

type SnsLink = {
  name: string;
  href: string;
  class: string;
};

const snsLinks: SnsLink[] = [
  {
    name: "GitHub",
    href: "https://github.com/9rotama",
    class: styles.github,
  },
  {
    name: "Zenn",
    href: "https://zenn.dev/9rotama",
    class: styles.zenn,
  },
  {
    name: "itch.io",
    href: "https://9rotama.itch.io/",
    class: styles.itchio,
  },
];

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
    tags: ["nextjs", "dexie", "web"],
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
    tags: ["svelte", "sveltekit", "marp", "web"],
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
