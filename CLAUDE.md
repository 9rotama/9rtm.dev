# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際のClaude Code (claude.ai/code) へのガイダンスを提供します。

## 開発コマンド

これは静的アダプター設定を持つSvelteKitプロジェクトです。以下のコマンドを使用してください：

- `pnpm run dev` - 開発サーバーを開始
- `pnpm run build` - 本番用ビルド（`build/`ディレクトリに出力）
- `pnpm run preview` - 本番ビルドをプレビュー
- `pnpm run check` - Svelteの型チェックを実行
- `pnpm run lint` - ESLintとPrettierのチェックを実行
- `pnpm run format` - Prettierでコードをフォーマット

## アーキテクチャ概要

### コア構造

- **SvelteKit 2** - `@sveltejs/adapter-static`を使用した静的サイト生成
- **TailwindCSS 4** - ViteプラグインでスタイリングとViteプラグイン統合
- **TypeScript** - 型安全性
- **Three.js + Threlte** - 3Dグラフィックス（emoti-kunキャラクター）

### コンテンツ管理

- **ブログ/ノートシステム**: `/content/notes/`のMarkdownファイルを以下で処理：
  - `gray-matter` - frontmatterのパース
  - `micromark` - GFM拡張でレンダリング
  - Date-fns - 日付フォーマット
- **セルフホストノート**と**Zenn連携** - 統一されたNote型
- コンテンツはViteの`import.meta.glob`でrawクエリを使ってインポート

### 主要ディレクトリ

- `src/routes/` - ファイルベースルーティングによるSvelteKitルート
- `src/routes/_components/` - 3D emoti-kunを含む共有コンポーネント
- `src/lib/` - ユーティリティ関数とコンテンツ管理
- `content/notes/` - Markdownブログ投稿
- `static/` - フォントや画像などの静的アセット

### プリコミットフック

Lefthookがコミット前にlintとformatコマンドを実行し、修正されたファイルを自動でステージングするよう設定されています。

### コンポーネントアーキテクチャ

- レイアウトコンポーネントはSvelte 5シンタックスを使用
- 3DコンポーネントはThrelte（SvelteのThree.jsラッパー）で構築
- アイコンコンポーネントは自己完結型のSVG Svelteコンポーネント
- ノート/ブログコンポーネントはセルフホストと外部コンテンツの両方を処理

## ルール

### コーディングスタイル

- es modules(import / export)を必ず使い、commonjsは使わないでください。
- destructure importを基本にしてください。(import {foo} from 'bar')
- svelte 5のrunes記法で実装してください。

### ワークフロー

- 書いたコードはeslintおよびtsの型チェックによって、エラーを除去してください。
- 開発サーバを使った確認はユーザで行うので、claudeは実施しないでください。
