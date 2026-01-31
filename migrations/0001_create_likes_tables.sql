-- いいね数を保存するテーブル
CREATE TABLE IF NOT EXISTS likes (
  slug TEXT PRIMARY KEY,
  count INTEGER DEFAULT 0
);

-- 連投防止用ログテーブル
CREATE TABLE IF NOT EXISTS likes_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(slug, ip_hash)
);

-- 連投チェック用インデックス
CREATE INDEX IF NOT EXISTS idx_likes_log_lookup ON likes_log(slug, ip_hash);
