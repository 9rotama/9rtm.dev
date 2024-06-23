import SnsLink from "@/components/about/sns-link";
import Article from "@/components/common/article";
import GitHub from "@/assets/sns/github.svg";
import Zenn from "@/assets/sns/zenn.svg";
import ItchIo from "@/assets/sns/itch-io.svg";

import styles from "./page.module.css";

export type Sns = {
  name: string;
  href: string;
  iconSrc: string;
};

const snsLinks: Sns[] = [
  {
    name: "GitHub",
    href: "https://github.com/9rotama",
    iconSrc: GitHub.src,
  },
  {
    name: "Zenn",
    href: "https://zenn.dev/9rotama",
    iconSrc: Zenn.src,
  },
  {
    name: "itch.io",
    href: "https://9rotama.itch.io/",
    iconSrc: ItchIo.src,
  },
];

export default function About() {
  return (
    <main>
      <Article>
        <h1>about</h1>
        <h2>🪪 me</h2>
        <p>
          Web フロントエンドを勉強しています。普段は Next.js, React, Typescript
          を使って開発しています。WebGL
          やレイトレなど、3DCG周りの技術に興味があります。
        </p>
        <div className={styles.snsLinks}>
          {snsLinks.map((sns) => (
            <SnsLink key={sns.name} {...sns} />
          ))}
        </div>

        <h2>💫 like</h2>
        <p>リズムゲーム / お絵描き / フォント</p>
      </Article>
    </main>
  );
}
