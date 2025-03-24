import { ArticleH1 } from "@/components/article";
import SlideUp from "@/components/slide-up";

export default function Notes() {
  return (
    <main>
      <SlideUp delay={0}>
        <ArticleH1>notes</ArticleH1>
      </SlideUp>
      <SlideUp delay={100}>(╯°□°）╯︵ ┻━┻</SlideUp>
    </main>
  );
}
