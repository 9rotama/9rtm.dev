---
title: 個人サイトを作り直した
emoji: "📒"
published_at: 2025-07-20
published: true
---

プロフィール兼ブログとして、9rtm.devをリニューアルしました。以前はNext.jsを使っていましたが、Reactは業務でも使うため勉強も兼ねてSvelteKitに移行しました。また、デザインも新しくしました。

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

`.md`ファイルは、`src/lib/content.ts`内で一括で読み込んでいます。最初はfsで愚直にやるつもりでしたが、Viteにglobを用いたimport機能([参考](https://vite.dev/guide/features.html#glob-import))があるためそっちを使いました。非同期や実行環境を考えなくていいので、便利です。

```ts
export const selfNotesMds = import.meta.glob("/content/notes/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});
```

## threlte

移行前はReact Three Fiberを使っており、シーンを宣言的に記述できたりHooksを使えたりするのがとても良かったです。Svelte にも同等のライブラリである[threlte](https://threlte.xyz/)があり、同じくフレームワークらしい実装ができます。

また、いくつかのヘルパーをthree.jsのexamplesや[drei](https://drei.docs.pmnd.rs/getting-started/introduction)からポートしており、リッチな効果を簡単に実装できそうです。

homeページにてthrelteを使っていて、無限に移動するグリッド床はシェーダで実装しています。

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
<!-- (乂'ω')ﾀﾞﾒ〜 -->
<T.ShaderMaterial
  uniforms={{
    u_time: { value: time },
  }}
/>
```

## デプロイ

以前はCloudflare Pagesにデプロイしていました。勝手にCI/CDも設定してくれるし、ドメインの登録も同じコンソールで済ませられて楽でした。
今回は勉強としてS3 + Cloudfrontの構成に移行し、GitHub Actionでデプロイの設定をしています。

## おわりに

静的サイトもちゃんと作ってみると、勉強になることばかりでした 🤯
