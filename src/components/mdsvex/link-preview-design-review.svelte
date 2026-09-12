<script lang="ts">
  import LinkPreview from "./link-preview.svelte";

  const image = "/post-media/bloom.png";
  const icon = "/favicon.svg";
</script>

<div class="mx-auto grid max-w-2xl gap-10 py-4">
  <section>
    <h2 class="text-muted mb-3 text-sm font-bold">Card</h2>
    <LinkPreview
      variant="card"
      href="https://9rtm.dev/notes/like-button"
      title="SvelteKit と Cloudflare D1 でいいねボタンを実装する"
      description="個人サイトの技術記事に、軽量で扱いやすいいいね機能を追加したときの設計と実装を紹介します。"
      siteName="9rtm.dev"
      {image}
      {icon}
      external
    />
  </section>

  <section>
    <h2 class="text-muted mb-3 text-sm font-bold">Card without image</h2>
    <LinkPreview
      variant="card"
      href="/notes/internal-link"
      title="画像や概要文が取得できなかったページ"
      siteName="9rtm.dev"
    />
  </section>

  <section>
    <h2 class="text-muted mb-3 text-sm font-bold">Long content</h2>
    <LinkPreview
      variant="card"
      href="https://example.com/long-content"
      title="長いタイトルが複数行になったときにもカード全体の高さと余白が崩れないことを確認するためのリンクプレビュー"
      description="説明文も長い場合を想定しています。表示できる行数を超えたテキストが省略され、サイト名と外部リンクアイコンが押し出されないことを確認します。"
      siteName="A very long example website name"
      {image}
      {icon}
      external
    />
  </section>

  <section>
    <h2 class="text-muted mb-3 text-sm font-bold">Inline</h2>
    <p class="leading-8">
      文中に表示される
      <LinkPreview
        variant="inline"
        href="https://storybook.js.org/"
        title="Storybook: Frontend workshop for UI development"
        label="Storybook 公式サイト"
        siteName="Storybook"
        {icon}
        external
      />
      と、ラベルを指定していない
      <LinkPreview
        variant="inline"
        href="/notes/internal-link"
        title="内部リンクのタイトル"
        siteName="9rtm.dev"
      />
      の並びです。
    </p>
  </section>
</div>
