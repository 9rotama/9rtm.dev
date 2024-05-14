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
          Webフロントエンドや3Dレンダリング周りの技術に興味があります。趣味は音ゲーと落描き。見習い
        </p>
        <p>🎂: 2001/09/09</p>
        <p>🗾: 福島 → 千葉</p>
        <h2>like</h2>
        <h3>フォント</h3>
        <ul>
          <li>欧文</li>
          <ul>
            <li>Helvetica Now</li>
            <li>Inter</li>
            <li>Avenir</li>
          </ul>
          <li>和文</li>
          <ul>
            <li>ニタラゴルイカ</li>
            <li>ラグランパンチ</li>
            <li>M PLUS</li>
          </ul>
        </ul>
        <h3>ゲーム</h3>
        <ul>
          <li>やってる: Arcaea, jubeat, DJMAX, EZ2ON</li>
          <li>始めた: SDVX, Dynamix</li>
          <li>やってた: Cytus, BMS</li>
        </ul>
        <h2>used</h2>

        <h3>メイン</h3>
        <ul>
          <li>TypeScript</li>
          <li>JavaScript</li>
          <li>Next.js</li>
          <li>Three.js(r3f)</li>
        </ul>
        <h3>使ったことある</h3>
        <ul>
          <li>C#(Unity)</li>
          <li>C++</li>
          <li>Python</li>
          <li>CUDA</li>
          <li>OptiX</li>
          <li>Gatsby.js</li>
          <li>LINEBot SDK</li>
          <li>Prisma</li>
        </ul>
        <h3>勉強中</h3>
        <ul>
          <li>Svelte</li>
          <li>GLSL</li>
          <li>Rust</li>
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
