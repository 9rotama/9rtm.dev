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
