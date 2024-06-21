import Link from "next/link";
import styles from "./page.module.css";
import clsx from "clsx";
import Image from "next/image";
import Article from "@/components/common/article";
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

export default function About() {
  return (
    <main>
      <Article>
        <Image
          loading="eager"
          src="https://avatars.githubusercontent.com/u/65887771?v=4"
          alt="avatar"
          width={276}
          height={276}
          className={styles.avatar}
        />
        <ul className={styles.snslinks}>
          {snsLinks.map((sns) => (
            <li key={sns.name}>
              <Link href={sns.href} aria-label={sns.name}>
                <div className={clsx(styles.snslogo, sns.class)} />
              </Link>
            </li>
          ))}
        </ul>
        <h2>about</h2>
        <p>
          Web フロントエンドを勉強しています。普段は Next.js, React, Typescript
          を使って開発しています。WebGL
          やレイトレなど、3DCG周りの技術に興味があります。
        </p>
        <p>🎂: 2001/09/09</p>
        <p>🗾: 福島 → 千葉</p>
        <p>🎓: UoA</p>
        <h2>like</h2>
        <h3>フォント</h3>
        <ul>
          <li>欧文</li>
          <ul>
            <li>Helvetica Now</li>
            <li>Avenir</li>
            <li>Inter</li>
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
          <li>MongoDB</li>
        </ul>
        <h3>勉強中</h3>
        <ul>
          <li>Svelte</li>
          <li>GLSL</li>
          <li>Rust</li>
        </ul>
      </Article>
    </main>
  );
}
