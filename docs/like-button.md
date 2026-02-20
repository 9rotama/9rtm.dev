# いいねボタン実装計画

GitHub Issue: https://github.com/9rotama/9rtm.dev/issues/28

## 要件

- クライアント側：いいね済みかどうかをlocalStorageで管理
- サーバー側：Cloudflare D1でいいね数を保存
- いいね数はブラウザ非表示、DiscordにWebhookで通知
- 連投防止の仕組み（同一IP+slugは24時間に1回のみ）

## アーキテクチャ

```
[ブラウザ]
    │
    ├─ localStorage: いいね済みフラグ管理
    │
    └─ POST /api/notes/[slug]/like
           │
           ▼
[Cloudflare Workers]
    │
    ├─ レートリミット確認（D1: likes_log）
    ├─ いいね数更新（D1: likes）
    └─ Discord Webhook通知
```

## ファイル構成

```
src/
├── app.d.ts                          # Platform型定義追加
├── routes/
│   ├── api/notes/[slug]/like/
│   │   └── +server.ts                # POSTエンドポイント
│   └── notes/[slug]/
│       └── _components/
│           └── LikeButton.svelte     # いいねボタンUI
migrations/
└── 0001_create_tables.sql            # D1マイグレーション
wrangler.toml                         # D1バインディング追加
```

## D1セットアップ

### 1. データベース作成

```bash
npx wrangler d1 create 9rtm-dev-db
```

### 2. wrangler.tomlにバインディング追加

```toml
[[d1_databases]]
binding = "DB"
database_name = "9rtm-dev-db"
database_id = "<出力されたID>"
```

### 3. マイグレーション作成

**migrations/0001_create_tables.sql:**

```sql
CREATE TABLE IF NOT EXISTS likes (
  slug TEXT PRIMARY KEY,
  count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS likes_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(slug, ip_hash)
);

-- 連投防止用インデックス
CREATE INDEX idx_likes_log_lookup ON likes_log(slug, ip_hash);
```

### 4. マイグレーション実行

```bash
# ローカル開発用
npx wrangler d1 migrations apply 9rtm-dev-db --local

# 本番
npx wrangler d1 migrations apply 9rtm-dev-db --remote
```

## Discord Webhook設定

### 1. Webhook作成

1. Discordサーバーでチャンネル設定を開く
2. 連携サービス → Webhookを作成
3. Webhook URLをコピー

### 2. シークレット設定

```bash
npx wrangler secret put DISCORD_WEBHOOK_URL
# プロンプトが出たらWebhook URLを貼り付け
```

## 実装詳細

### app.d.ts 型定義

```typescript
declare global {
  namespace App {
    interface Platform {
      env: {
        DB: D1Database;
        DISCORD_WEBHOOK_URL: string;
      };
    }
  }
}
```

### APIエンドポイント（+server.ts）

```typescript
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ params, platform, request }) => {
  const { slug } = params;
  const db = platform?.env?.DB;
  const webhookUrl = platform?.env?.DISCORD_WEBHOOK_URL;

  if (!db) {
    return json({ error: "Database not available" }, { status: 500 });
  }

  // IPハッシュ生成（プライバシー配慮）
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const ipHash = await hashIP(ip);

  // 連投チェック（24時間以内に同じIP+slugがあるか）
  const existing = await db
    .prepare("SELECT * FROM likes_log WHERE slug = ? AND ip_hash = ?")
    .bind(slug, ipHash)
    .first();

  if (existing) {
    return json({ error: "Already liked" }, { status: 429 });
  }

  // いいね記録
  await db.batch([
    db
      .prepare(
        "INSERT INTO likes (slug, count) VALUES (?, 1) ON CONFLICT(slug) DO UPDATE SET count = count + 1",
      )
      .bind(slug),
    db
      .prepare("INSERT INTO likes_log (slug, ip_hash) VALUES (?, ?)")
      .bind(slug, ipHash),
  ]);

  // Discord通知
  if (webhookUrl) {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `"${slug}" にいいねがつきました`,
      }),
    });
  }

  return json({ success: true });
};

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
```

### LikeButton.svelte

```svelte
<script lang="ts">
  const { slug }: { slug: string } = $props();

  const STORAGE_KEY = "liked_notes";

  function getLikedNotes(): Record<string, boolean> {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  function setLiked(slug: string) {
    const liked = getLikedNotes();
    liked[slug] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(liked));
  }

  let isLiked = $state(false);
  let isLoading = $state(false);

  $effect(() => {
    isLiked = getLikedNotes()[slug] ?? false;
  });

  async function handleLike() {
    if (isLiked || isLoading) return;

    isLoading = true;
    try {
      const res = await fetch(`/api/notes/${slug}/like`, { method: "POST" });
      if (res.ok) {
        setLiked(slug);
        isLiked = true;
      }
    } finally {
      isLoading = false;
    }
  }
</script>

<button onclick={handleLike} disabled={isLiked || isLoading}>
  {isLiked ? "Liked!" : "Like"}
</button>
```

## 実装手順

1. [ ] D1データベース作成 (`wrangler d1 create`)
2. [ ] wrangler.tomlにD1バインディング追加
3. [ ] マイグレーションファイル作成・実行
4. [ ] app.d.tsに型定義追加
5. [ ] APIエンドポイント実装
6. [ ] LikeButtonコンポーネント実装
7. [ ] 記事ページにLikeButton配置
8. [ ] Discord Webhook設定
9. [ ] ローカルでテスト
10. [ ] デプロイ・本番テスト
