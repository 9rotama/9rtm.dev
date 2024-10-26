import Article from "@/components/article";
import SlideUp from "@/components/slide-up";

export default function About() {
  return (
    <main>
      <Article>
        <SlideUp delay={200}>
          <h1>notes</h1>
        </SlideUp>
        <SlideUp delay={400}>ﾅﾆﾓﾅｲﾖｰ (;_;)</SlideUp>
      </Article>
    </main>
  );
}
