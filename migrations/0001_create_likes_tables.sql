-- いいね数を保存するテーブル
CREATE TABLE IF NOT EXISTS likes (
  slug TEXT PRIMARY KEY,
  count INTEGER DEFAULT 0
);

-- 連投防止用ログテーブル
-- UNIQUE制約で自動的にインデックスが作成される
CREATE TABLE IF NOT EXISTS likes_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(slug, ip_hash)
);
