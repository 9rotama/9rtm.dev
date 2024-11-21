import GitHub from "@/assets/sns/github.svg";
import ItchIo from "@/assets/sns/itch-io.svg";
import Zenn from "@/assets/sns/zenn.svg";
import { ArticleH1, ArticleH2 } from "@/components/article";
import SlideUp from "@/components/slide-up";
import SnsLink from "@/features/about/components/sns-link";

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
  {
    svgId: "itchio",
    name: "itch.io",
    href: "https://9rotama.itch.io/",
    iconSrc: ItchIo.src,
  },
];

export default function About() {
  return (
    <main>
      <SlideUp delay={200}>
        <ArticleH1>about</ArticleH1>
      </SlideUp>
      <SlideUp delay={400}>
        <ArticleH2>🪪 me</ArticleH2>
        <p>
          Web フロントエンドを勉強しています。普段は Next.js, React, Typescript
          を使って開発しています。WebGL
          やレイトレなど、3DCG周りの技術に興味があります。
        </p>
        <div className="mt-6 flex flex-row flex-wrap gap-3  ">
          {snsLinks.map((sns) => (
            <SnsLink key={sns.name} {...sns} />
          ))}
        </div>

        <ArticleH2>💫 like</ArticleH2>
        <p>リズムゲーム / お絵描き / フォント</p>
      </SlideUp>
    </main>
  );
}
