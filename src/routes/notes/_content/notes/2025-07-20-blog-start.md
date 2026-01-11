---
title: 個人サイトを作り直した
emoji: "📒"
published_at: 2025-07-20
published: true
---

プロフィール兼ブログとして、9rtm.devをリニューアルしました。以前はNext.jsを使っていましたが、Reactは業務でも使うため勉強も兼ねてSvelteKitに移行しました。また、デザインも新しくしました。

## 相対色構文を使ってみた

Tailwindのカラーは、`oklch()`関数と相対色構文を使って定義しています。([honey32様の資料](https://speakerdeck.com/honey32/xiang-dui-se-gou-wen-x-oklch-gajian-yi-de-nakaraparetutodukurinibian-li-najian?slide=13)を参考)

ほとんどのカラーが背景色をもとに作成されている形になります。

```css
@theme {
  --color-background: oklch(0.1656 0.04 291.05);
  --color-foreground: oklch(
    from var(--color-background) calc(l + 0.7) calc(c + 0.03) h
  );
  --color-muted: oklch(
    from var(--color-foreground) calc(l - 0.15) calc(c + 0.04) h
  );
}
```

サイトの設計にFigmaなどを使わず雰囲気で実装しているため、カラーパレットを行き来せずに直感的に色の調整を行えました。

## threlte

移行前はReact Three Fiberを使っており、シーンを宣言的に記述できたりHooksを使えたりするのがとても良かったです。Svelte にも同等のライブラリである[threlte](https://threlte.xyz/)があり、同じくフレームワークらしい実装ができます。

また、いくつかのヘルパーをthree.jsのexamplesや[drei](https://drei.docs.pmnd.rs/getting-started/introduction)からポートしており、さくっとリッチな表現を作ることができます。

homeページトップにある無限に移動するグリッド床はシェーダで実装しています。

```svelte
<script lang="ts">
  import { T, useTask } from "@threlte/core";
  ...

  let time = $state(0);

  useTask(
    (delta) => {
      time += delta;
    },
    { autoStart: true },
  );
</script>

<T.Mesh>
  <T.PlaneGeometry />
  <T.ShaderMaterial
    ...
    uniforms={{
      u_time: { value: 0 },
    }}
    uniforms.u_time.value={time}
  />
</T.Mesh>
```

シェーダの時間を制御するために、stateで累積時間を持ってuniformに渡しています。注意点として、リアクティブな値はuniformsのプロパティをそれぞれ切り出して指定する必要があります。

```svelte
<!-- (乂'ω')ﾀﾞﾒ -->
<T.ShaderMaterial
  uniforms={{
    u_time: { value: time },
  }}
/>
```

## notesページ

remark + rehypeを使ってMarkdownから記事を生成しています。アンカーリンク(見出しごとのリンク)を設定したかったので、プラグインとしてrehype-slugやrehype-autolink-headingsを追加しています。

```ts
const html = await remark()
  .use(remarkFrontmatter)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, {
    behavior: "prepend",
    properties: {
      className: ["heading-link"],
      ariaLabel: "link to section",
      title: "link to section",
    },
    content: {
      type: "text",
      value: "#",
    },
  })
  .use(rehypeStringify)
  .process(md as string);

const metadata = selfNoteMetadataSchema.safeParse(matter(md).data);
```

`.md`ファイルは、`src/lib/content.ts`内で一括で読み込んでいます。最初はfsで愚直にやるつもりでしたが、Viteの機能に[glob import](https://vite.dev/guide/features.html#glob-import)があるためそっちを使いました。非同期や実行環境を考えなくていいので、便利です。

```ts
export const selfNotesMds = import.meta.glob("/content/notes/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});
```

### code block

コードのハイライトには[Shiki](https://shiki.style/)を使ってみました。今どき?なカラーテーマが搭載されてたり、Svelteコードにもデフォルトで対応していて本当に楽に実装できました。

## おわりに

静的サイトもちゃんと作ってみると、勉強になることばかりでした 🤯
