import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

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

  // 連投チェック（同じIP+slugがあるか）
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
