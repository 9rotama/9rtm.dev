# ブログメディアの管理

ブログ記事の画像と動画は、Cloudflare R2の `9rtm-dev-media` バケットへアップロードし、`https://media.9rtm.dev` から配信する。

配信用ファイルはGitに追加せず、編集可能な原本は別の場所へバックアップする。

## R2を初期構築する

CloudflareアカウントでWranglerにログインし、R2バケットを作成する。

```bash
pnpm wrangler login
pnpm wrangler r2 bucket create 9rtm-dev-media
```

Cloudflare Dashboardで `9rtm-dev-media` バケットを開き、Custom Domainとして `media.9rtm.dev` を接続する。

Custom DomainがActiveになったら、Public Development URL（`r2.dev`）を無効にする。

この構築はプロジェクト全体で一度だけ行い、新しい開発環境を作るたびにバケットを作り直さない。

## 新しい開発環境を準備する

依存関係をインストールし、メディアをアップロードするCloudflareアカウントでWranglerにログインする。

```bash
pnpm install --frozen-lockfile
pnpm wrangler login
pnpm wrangler whoami
```

`whoami` で対象のCloudflareアカウントへログインできていることを確認する。

## 画像を追加する

記事のslug、代替テキスト、画像ファイルを指定する。

```bash
pnpm media:upload -- --slug like-button --alt "いいねボタンの操作" ./like-button.webp
```

コマンドが出力したMarkdownを記事へ貼り付ける。

```markdown
![いいねボタンの操作](https://media.9rtm.dev/notes/like-button/like-button-84d23147a2cb.webp)
```

## 動画を追加する

記事のslug、表示幅、表示高さ、動画ファイルを指定する。

```bash
pnpm media:upload -- --slug like-button --width 1020 --height 720 ./like-button-cap.webm
```

コマンドが出力したHTMLを記事へ貼り付ける。

```html
<video
  src="https://media.9rtm.dev/notes/like-button/like-button-cap-84d23147a2cb.webm"
  width="1020"
  height="720"
  autoplay
  loop
  muted
  controls
  playsinline
></video>
```

## アップロード内容を事前確認する

`--dry-run` を付けると、R2へアップロードせずにURLと貼り付け用スニペットを確認できる。

```bash
pnpm media:upload -- --slug like-button --alt "いいねボタンの操作" --dry-run ./like-button.webp
```

## メディアを差し替える

変更後のファイルを `media:upload` でアップロードし、記事内のURLを新しいURLへ置き換える。

ファイルの内容が変わると内容ハッシュを含む別のURLが生成されるため、既存のR2オブジェクトは上書きされない。

## 表示を確認する

ローカルプレビューで代替テキスト、画像表示、動画再生を確認する。

記事とStorybookに記載されたR2 URLをまとめて検証する場合は、次のコマンドを実行する。

```bash
pnpm media:verify
```

`media:verify` は外部ネットワークへ接続するため、CIでは実行しない。
