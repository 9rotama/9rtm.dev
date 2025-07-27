---
title: SvelteKitで個人サイトを作った
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

`.md`ファイルは、`src/lib/content.ts`内で一括で読み込んでいます。最初はfsで愚直にやるつもりでしたが、Viteにglobを用いたimport機能([参考](https://vite.dev/guide/features.html#glob-import))があるためそっちを使いました。非同期や実行環境を考えなくていいので楽ですね！

```ts
export const selfNotesMds = import.meta.glob("/content/notes/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});
```

## 3D描画について

移行前は React Three Fiber を使っており、シーンを宣言的に記述できたり Hooks を使えたりするのがとても良かったです。Svelte にも同等のライブラリである [threlte](https://threlte.xyz/) があり、同じくフレームワークらしい実装ができます。

## デプロイ
