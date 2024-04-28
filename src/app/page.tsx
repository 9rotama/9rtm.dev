import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import clsx from "clsx";

export default function Home() {
  return (
    <main>
      <div className={styles.hero}>
        <Image
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
              <Link href={sns.href}>
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
