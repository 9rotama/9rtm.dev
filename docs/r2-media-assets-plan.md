# R2メディア管理の実装計画

## 目的

ブログ記事で使う画像と動画をGitリポジトリからCloudflare R2へ移し、`https://media.9rtm.dev` から配信する。

記事の執筆者は、ローカルファイルをアップロードするコマンドを実行し、出力されたMarkdownまたはHTMLを記事へ貼り付ける。

## 現状

記事用メディアは `static/post-media` に17ファイル、合計約1.6 MBある。

記事とStorybookは `/post-media/<filename>` というルート相対URLで参照している。

16ファイルは記事から参照されており、`discord-webhook-setting.png` はリポジトリ内から参照されていない。

Markdownの画像は通常の `<img>`、動画は通常の `<video>` として出力されているため、参照先を外部URLへ変えても表示コンポーネントの変更は不要である。

## 配信構成

R2バケットと公開URLには次の名前を使う。

- バケット名：`9rtm-dev-media`
- 公開URL：`https://media.9rtm.dev`
- 新規メディアのキー：`notes/<article-slug>/<stem>-<sha256-prefix><extension>`
- `sha256-prefix`：ファイル内容のSHA-256先頭12文字

例を次に示す。

```text
notes/like-button/like-button-cap-84d23147a2cb.webm
```

公開バケットはCustom Domainへ直接接続する。

サイトのWorkerはR2オブジェクトの取得に介在しないため、`wrangler.jsonc` にR2 bindingを追加しない。

R2 bindingは、将来、非公開オブジェクトの認証付き配信またはWorkerによる画像変換が必要になった時点で検討する。

オブジェクトには次のキャッシュ設定を付ける。

```text
Cache-Control: public, max-age=31536000, immutable
```

内容ハッシュをキーへ含めるため、ファイルを更新すると別のURLが発行される。

既存キーの上書きとCDNキャッシュの削除を通常の更新手順に含めない。

## 実装範囲

### メディア設定

公開情報を一か所に定義する。

設定にはバケット名、公開URL、キャッシュ設定、許可する拡張子とMIME typeの対応を含める。

秘密情報とCloudflare API tokenはリポジトリへ保存しない。

初期対象は `png`、`jpg`、`jpeg`、`webp`、`avif`、`gif`、`svg`、`webm`、`mp4` とする。

ブラウザ配信用形式ではないファイルは、アップロード前に明示的なエラーにする。

### 新規メディアのアップロード

次のインターフェースを持つコマンドを追加する。

```bash
pnpm media:upload -- --slug like-button --alt "いいねボタンの操作" ./like-button.png
```

動画には表示寸法を渡す。

```bash
pnpm media:upload -- --slug like-button --width 1020 --height 720 ./like-button-cap.webm
```

コマンドは次の順序で処理する。

1. 入力ファイルの存在、通常ファイルであること、拡張子、引数を検証する。
2. ファイル内容からSHA-256を計算する。
3. slugとファイル名をURLで安全な形式へ正規化し、R2キーを組み立てる。
4. `wrangler r2 object put` をシェルを介さずに実行する。
5. MIME typeと `Cache-Control` をオブジェクトのHTTP metadataとして保存する。
6. Wranglerが失敗した場合は終了コードを引き継ぎ、成功したような出力を行わない。
7. 成功後に公開URLと貼り付け用スニペットを標準出力へ表示する。

画像では代替テキストを必須にする。

出力例を次に示す。

```markdown
![いいねボタンの操作](https://media.9rtm.dev/notes/like-button/like-button-84d23147a2cb.webp)
```

動画では幅と高さを必須にし、現在の記事と同じ属性を持つHTMLを出力する。

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

`--dry-run` ではR2を変更せず、検証、キー生成、出力生成までを実行する。

同じ内容を再度指定した場合は同じキーを生成する。

### 既存メディアの移行

既存ファイルを一括移行するコマンドを追加する。

```bash
pnpm media:migrate
pnpm media:migrate -- --apply
```

引数なしではdry-runとして動作させる。

dry-runは次の情報を表示する。

- 参照元の記事
- ローカルファイル
- 移行先R2キー
- 移行後の公開URL
- 参照されていないファイル
- 存在しないローカルファイルへの参照

`--apply` は全対象のアップロードが成功した後にだけ記事とStorybookの参照を書き換える。

途中でアップロードが失敗した場合、R2にアップロード済みのオブジェクトは残してよいが、MarkdownとStorybookは変更しない。

処理を再実行すると内容ハッシュから同じキーが生成されるため、途中から安全にやり直せる構成にする。

移行コマンドは `static/post-media` のファイルを削除しない。

削除は公開URLと記事表示を確認した後の独立したコミットで行い、リポジトリの指示に従って `rm` ではなく `trash` を使う。

参照されていない `discord-webhook-setting.png` は自動アップロードも自動削除も行わず、人間の判断対象として報告する。

### 公開URLの検証

記事とStorybookから `https://media.9rtm.dev` のURLを抽出し、HTTPで取得できることを確認するコマンドを追加する。

```bash
pnpm media:verify
```

検証は明示的に実行する運用コマンドとし、PRのCIから外部ネットワークへアクセスさせない。

レスポンスが成功しないURLを一覧化し、一つでもあれば非ゼロで終了する。

### テスト

ネットワークと実際のR2を使わず、次の処理をVitestで検証する。

- 許可する拡張子とMIME typeの対応
- slugとファイル名の正規化
- 内容ハッシュを含むキー生成
- 画像と動画のスニペット生成
- 不正な引数と未対応形式の拒否
- 既存参照の抽出と置換
- orphanとmissing fileの検出
- 一括アップロード失敗時に記事を書き換えないこと

`pnpm check`、`pnpm lint`、`pnpm test`、`pnpm build` を通す。

### 執筆手順の文書化

`docs/media-assets.md` を作り、次の手順だけで新規記事へメディアを追加できるようにする。

1. 配信用ファイルを準備する。
2. `pnpm media:upload` を実行する。
3. 出力されたスニペットをMarkdownへ貼り付ける。
4. ローカルプレビューで代替テキスト、表示寸法、動画再生を確認する。
5. Markdownだけをコミットする。

画像や動画の原本をR2だけに保存するとGitから復元できないため、R2は配信用データの保存先として扱う。

編集可能な原本が必要な場合は、R2とは別のバックアップ先に保存する。

## 実装しないもの

次の機能は今回の実装に含めない。

- ブラウザ上の管理画面
- ブラウザからR2へ直接アップロードするAPI
- 署名付きURLと非公開配信
- Workerによる動的な画像変換
- 動画のトランスコード
- GitHub ActionsからR2への自動アップロード
- orphanオブジェクトの自動削除

## コミット単位

実装は次の単位でコミットする。

1. `docs: add R2 media implementation plan`
2. `feat: add R2 media upload tooling`
3. `feat: add existing media migration tooling`
4. `docs: document R2 media authoring workflow`

移行実行後は、生成された差分を次の単位でコミットする。

5. `refactor: serve post media from R2`
6. `chore: remove migrated post media from git`

機能コードと対応するテストは同じコミットへ含める。

フォーマットだけの変更を別コミットにせず、関係のないファイルを変更しない。

## 人間が行う作業

以下はCloudflareアカウントへの対話的な認証、外部リソースの作成、公開切り替え、または内容判断を伴うため、人間が行う。

### Cloudflareの準備

1. Wranglerへログインする。
2. `9rtm-dev-media` バケットを作成する。
3. R2のCustom Domainとして `media.9rtm.dev` を接続する。
4. Custom DomainがActiveになるまで待つ。
5. 本番配信ではPublic Development URL（`r2.dev`）を無効にする。
6. Cloudflare CacheでR2用のSmart Tiered Cacheを有効にする。
7. 必要なら `media.9rtm.dev/*` に対するCache Ruleを設定する。

R2への書き込み権限を持つAPI tokenを作る場合は、ローカルの認証情報またはCI secretとして保存し、リポジトリへ追加しない。

### 既存メディアの公開切り替え

1. `pnpm media:migrate` のdry-run結果を確認する。
2. orphanとして報告される `discord-webhook-setting.png` を保存するか削除するか決める。
3. `pnpm media:migrate -- --apply` を実行する。
4. `pnpm media:verify` を実行する。
5. ローカルプレビューで画像、キャプション、動画再生を確認する。
6. 問題がなければ生成された記事変更をコミットするようCodexへ依頼する。
7. 本番デプロイ後に旧URLからの流入を考慮し、`static/post-media` をすぐ削除するか猶予期間を置くか決める。
8. 削除する場合はCodexへ削除と独立コミットを依頼する。

人間がMarkdownのURLを一つずつ書き換える必要はない。

人間がR2オブジェクトをDashboardから一つずつアップロードする必要もない。

## 完了条件

Cloudflareの準備前に、次の状態まで実装を完了できる。

- upload、migration、verifyコマンドが実装されている。
- dry-runと単体テストがR2認証なしで成功する。
- 執筆手順とCloudflare準備手順が文書化されている。
- テスト、型検査、lint、buildが成功する。
- コミットが前述の作業単位に分かれている。

Cloudflareの準備後は、次の状態を移行完了とする。

- 全記事の画像と動画が `https://media.9rtm.dev` から取得できる。
- 記事とStorybookに `/post-media/` 参照が残っていない。
- `pnpm media:verify` が成功する。
- 本番環境で画像、キャプション、動画再生に回帰がない。
- Gitから削除したファイルがR2上に存在することを確認している。
