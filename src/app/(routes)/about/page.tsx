import SnsLink from "@/features/about/components/sns-link";
import Article from "@/components/article";
import GitHub from "@/assets/sns/github.svg";
import Zenn from "@/assets/sns/zenn.svg";
import ItchIo from "@/assets/sns/itch-io.svg";
import SlideUp from "@/components/slide-up";

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
        <SlideUp delay={200}>
          <h1>about</h1>
        </SlideUp>
        <SlideUp delay={400}>
          <h2>🪪 me</h2>
          <p>
            Web フロントエンドを勉強しています。普段は Next.js, React,
            Typescript を使って開発しています。WebGL
            やレイトレなど、3DCG周りの技術に興味があります。
          </p>
          <div className="mt-6 flex flex-row flex-wrap gap-3  ">
            {snsLinks.map((sns) => (
              <SnsLink key={sns.name} {...sns} />
            ))}
          </div>

          <h2>💫 like</h2>
          <p>リズムゲーム / お絵描き / フォント</p>
        </SlideUp>
      </Article>
    </main>
  );
}
