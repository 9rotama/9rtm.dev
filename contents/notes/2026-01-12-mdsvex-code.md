---
title: mdsvexでコードブロックにコピーボタンを追加する
emoji: "🧱"
published_at: 2026-01-12
published: true
tags: [svelte, mdsvex]
---

本ブログのMarkdown生成方法を**[mdsvex](https://mdsvex.pngwn.io/)**に移行したときの記録になります。\_φ\(･\_･

## mdsvex

mdsvexは[MDX](https://mdxjs.com/)のSvelte版のようなライブラリで、Markdown内でSvelteコンポーネントを呼び出すことができます。拡張子は`.svx`で記述します。

明示的にSvelteコンポーネントを呼び出す方法もありますが、Markdownタグに対してコンポーネントをマッピングすることもできます。そのため、素の`.md`だけを管理したい場合でもmdsvexは重宝します💪

## Custom Components

mdsvexには[**Custom Components**](https://mdsvex.pngwn.io/docs#custom-components)というオプションがあり、通常のmarkdownタグに対して自作のSvelteコンポーネントを描画させることができます。

例えば、見出しのアンカーリンクのような、タグ以外の要素をappendしたい場合に有効活用できます。

Custom Componentsとコンポーネントの対応付けは、mdsvex用のLayoutファイルで行います。

```svelte:mdsvex-layout.svelte
<!-- default as HTMLタグの名前 でexportする -->
<script module lang="ts">
  export { default as h1 } from "../_components/h1.svelte";
  export { default as h2 } from "../_components/h2.svelte";
  export { default as h3 } from "../_components/h3.svelte";
  export { default as code } from "../_components/code.svelte";
</script>

<slot />
```

プラグインを噛ませない要素であれば単にexportするだけでマッピングできます。ただ、コードハイライトの場合はShikiのようなhighlighterが要素を生成しているため、一工夫必要です。

## やったこと

CodeBlockというコンポーネントを実装し、**コピーボタン**と**ファイル名**をコード本文と一緒に表示できるようにします。

### Highlighterにコンポーネントを渡す

CodeBlockコンポーネントを作ったらLayoutファイルでexportします。

```svelte:mdsvex-layout.svelte
<script module lang="ts">
  export { default as h1 } from "../_components/h1.svelte";
  export { default as h2 } from "../_components/h2.svelte";
  export { default as h3 } from "../_components/h3.svelte";
  export { default as code } from "../_components/code.svelte";
  export { default as CodeBlock } from "../_components/code-block.svelte";
</script>

<slot />
```

Shiki + mdsvexの組み合わせ設定を[公式docs](https://mdsvex.pngwn.io/docs#with-shiki)の通りに追加します。

```javascript:svelte.config.js
/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
  highlight: {
    highlighter: async (code, lang = "text") => {
      const html = escapeSvelte(highlighter.codeToHtml(code, { lang, theme }));
      return `{@html \`${html}\` }`;
    },
  },
};
```

ここで、CodeBlockコンポーネントをhighlighterが呼び出す設定が必要です。

```javascript:svelte.config.js
const mdsvexOptions = {
  extensions: [".md"],
  highlight: {
    highlighter: async (code, lang = "text") => {
      const html = escapeSvelte(highlighter.codeToHtml(code, { lang, theme }));
      // MODIFIED: コンポーネントに渡す前にエスケープする
      const escapedCode = code
        .replace(/\\/g, "\\\\")
        .replace(/`/g, "\\`")
        .replace(/\$/g, "\\$")
        .replace(/{/g, "\\{");
      // MODIFIED: exportしたCodeBlockを呼び出す
      return `<Components.CodeBlock lang="${lang}" code={\`${escapedCode}\`}>{@html \`${html}\` }</Components.CodeBlock>`;
    },
  },
};
```

少し奇妙ですが、returnした文字列はそのままLayoutのSvelteコードとして読み込まれるみたいです。

### Shikiに`<pre>`と`<code>`を生成させない

Shikiはデフォルトで`<pre>`と`<code>`要素を直接生成するため、Custom Componentsからスタイルを適用するのが難しくなります。(`:globals`記法を使えますが、スコープの点で好ましくない)

![コードブロックの背景色が微妙に明るかったり、フォントがOSデフォルトのものに変化している](/post-media/pre-background.png "pre codeに直接スタイリングしないと、フォントや背景色が異なってしまう")

解決法として、Shiki highlighterのオプションに`structure: inline`を指定します。これによってCustom Components内で`<pre>`と`<code>`要素を自分で実装し、Svelteコード内でスタイリングをコントロールできます。

```javascript:svelte.config.js
const html = escapeSvelte(
  highlighter.codeToHtml(code, {
    lang,
    theme: highlightTheme,
    // "classic" ... pre & codeも生成する
    // "inline" ... 中のspanのみ生成する
    structure: "inline",
  }),
);
```

### コピーボタンの実装

最後に、CodeBlockコンポーネント内でコピーボタンを実装します。

```svelte:code-block.svelte
<div class="group">
  <!-- Shikiハイライト -->
  <pre><code class="font-code">{@render children()}</code></pre>
  <!-- コピーボタン -->
  <div class="copy-button-wrapper absolute top-2 right-2">
    <CopyButton {code} />
  </div>
</div>

<style>
  .copy-button-wrapper {
    opacity: 0;
  }

  .group:hover .copy-button-wrapper {
    opacity: 1;
  }
</style>
```

## まとめ

Svelteコードを文字列リテラルで書くというハック的な方法でしたが、DOMを直接操作するよりも簡潔な実装ができたと思います。
