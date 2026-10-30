# ブログメディアの追加と移行

ブログ記事の画像と動画は、Cloudflare R2の `9rtm-dev-media` バケットから `https://media.9rtm.dev` で配信する。
R2オブジェクトは内容ハッシュを含むキーで保存し、変更後のファイルには新しいURLを使う。

## 新しいメディアを記事に追加する

画像には代替テキストを指定してアップロードする。

```bash
pnpm media:upload -- --slug like-button --alt "いいねボタンの操作" ./like-button.webp
```

動画には表示寸法を指定する。

```bash
pnpm media:upload -- --slug like-button --width 1020 --height 720 ./like-button-cap.webm
```

`--dry-run` を付けるとR2へアップロードせず、URLと貼り付け用スニペットを確認できる。

```bash
pnpm media:upload -- --slug like-button --alt "いいねボタンの操作" --dry-run ./like-button.webp
```

画像ではCLIが出力するMarkdownを記事へ貼り付ける。

```markdown
![いいねボタンの操作](https://media.9rtm.dev/notes/like-button/like-button-84d23147a2cb.webp)
```

動画ではCLIが出力するHTMLを記事へ貼り付ける。

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

ローカルプレビューで代替テキスト、画像表示、動画再生を確認してから、記事のMarkdownをコミットする。
アップロードしたファイルはGitに追加しない。

同じ内容を再度アップロードすると同じURLになる。
ファイルの内容を変更すると別のURLが生成されるため、記事の参照も更新する。
R2は配信用データの保存先として扱い、編集可能な原本は別の場所へバックアップする。

## R2を使う前に人間が行う設定

CloudflareアカウントでWranglerにログインし、`9rtm-dev-media` バケットを作成する。

```bash
pnpm wrangler login
pnpm wrangler r2 bucket create 9rtm-dev-media
```

Cloudflare Dashboardでバケットに `media.9rtm.dev` をCustom Domainとして接続する。
Domainの状態がActiveになった後、Public Development URL（`r2.dev`）を無効にする。
必要に応じてSmart Tiered Cacheと `media.9rtm.dev/*` のCache Ruleを設定する。

R2へ書き込むAPI tokenはローカルの認証情報として保存し、リポジトリへ追加しない。
公開配信だけを使うため、サイトのWorkerへR2 bindingを設定する必要はない。

## 既存メディアを移行する

移行を始める前にCustom DomainをActiveにし、WranglerからR2へ書き込めることを確認する。

まずdry-runで記事とStorybookの参照、移行先URL、未参照ファイル、欠損ファイルを確認する。

```bash
pnpm media:migrate
```

未参照の `static/post-media/discord-webhook-setting.png` は自動でアップロードも削除もしない。
保存するか削除するかを人間が決める。

内容を確認したら、`--apply` でR2へアップロードし、全アップロードの成功後に記事とStorybookの参照を書き換える。

```bash
pnpm media:migrate -- --apply
```

アップロードが途中で失敗した場合、R2には成功済みオブジェクトが残るが、記事とStorybookのファイルは書き換わらない。
同じコマンドを再実行すると内容ハッシュから同じキーが作られ、移行をやり直せる。

公開URLが利用できることを確認する。

```bash
pnpm media:verify
```

この検証コマンドは記事とStorybookの `media.9rtm.dev` URLへHTTP HEADリクエストを送る。
外部ネットワークへ接続するため、CIからは実行しない。

変更されたMarkdownとStorybookをローカルでプレビューし、表示を確認してから参照変更をコミットする。
`static/post-media` の削除はこの移行に含めず、公開後の確認を経た別の作業として判断する。
