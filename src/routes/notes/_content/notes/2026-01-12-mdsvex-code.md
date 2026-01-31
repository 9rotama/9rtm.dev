---
title: mdsvexでコードブロックにコピーボタンを入れ込みたい
emoji: "🧱"
published_at: 2026-01-12
published: true
---

本ブログのMarkdown生成方法を**[mdsvex](https://mdsvex.pngwn.io/)**に移行したときの記録になります。\_φ\(･\_･

## mdsvex

mdsvexは[MDX](https://mdxjs.com/)のSvelte版のようなライブラリで、Markdown内でSvelteコンポーネントを呼び出すことができます。

Svelteコンポーネントを使う場合は`.svx`拡張子で記述しますが、素の`.md`ファイルの変換にも使うことができます。

## Custom Components

mdsvexには[**Custom Components**](https://mdsvex.pngwn.io/docs#custom-components)というオプションがあり、markdownの構文に対して自作のSvelteコンポーネントを出力させることができます。

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

プラグインを噛ませない要素であれば単にexportするだけですが、コードハイライトの場合はShikiが要素を生成しているため、一工夫必要です。

## やったこと

CodeBlockというコンポーネントを実装し、その中でコピーボタンとShikiのハイライトを表示できるようにします。

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

ここで、CodeBlockコンポーネントをhighlighterの返り値で呼び出す設定が必要です。

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

奇妙ですが、returnした文字列はそのままLayoutのSvelteコードとして読み込まれるみたいです。

### Shikiに`<pre>`と`<code>`を生成させない

Shikiはデフォルトで`<pre>`と`<code>`要素を生成するため、コンポーネント内からスタイルを適用するのが難しくなります。(`:globals`記法を使えますが、あまりやりたくない)

また、Shikiが`pre code`に対して直接スタイルを当てるため、`div`で囲んで〜という方法も取れません。

![コードブロックの背景色が微妙に明るかったり、フォントがOSデフォルトのものに変化している](/post-media/pre-background.png)
↑pre codeに直接スタイリングしないと、フォントや背景色が違ってしまう...

ただ、これはShikiのオプションが用意されており、それを変えるだけで解消できます🥳

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

Svelteコードを文字列リテラルで書くというハック的な方法でしたが、DOMを直接変更するよりも簡潔な実装ができたかなと思います。
