import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import { logger } from "$lib/logger";
import {
  getSelfNoteSlugs,
  getSelfNoteTitle,
} from "../../../../notes/_lib/self";
import checkLikeExistsQuery from "./_queries/check-like-exists.sql?raw";
import upsertLikeQuery from "./_queries/upsert-like.sql?raw";
import insertLikeLogQuery from "./_queries/insert-like-log.sql?raw";

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const POST: RequestHandler = async ({ params, platform, request }) => {
  const { slug } = params;
  const db = platform?.env?._9rtm_dev_db;
  const webhookUrl = platform?.env?.DISCORD_WEBHOOK_URL;

  logger.debug({ slug }, "like request received");

  // slug検証
  const validSlugs = getSelfNoteSlugs();
  if (!validSlugs.has(slug)) {
    logger.warn({ slug }, "invalid slug");
    return json({ error: "Note not found" }, { status: 404 });
  }

  if (!db) {
    logger.error("DB not available");
    return json({ error: "Database not available" }, { status: 500 });
  }

  // IPハッシュ生成（プライバシー配慮）
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const ipHash = await hashIP(ip);

  // 連投チェック（同じIP+slugがあるか）
  const existing = await db
    .prepare(checkLikeExistsQuery)
    .bind(slug, ipHash)
    .first();

  if (existing) {
    logger.info({ slug }, "already liked");
    return json({ error: "Already liked" }, { status: 429 });
  }

  // いいね記録
  await db.batch([
    db.prepare(upsertLikeQuery).bind(slug),
    db.prepare(insertLikeLogQuery).bind(slug, ipHash),
  ]);

  logger.info({ slug }, "like recorded");

  // Discord通知
  if (webhookUrl) {
    const title = getSelfNoteTitle(slug) ?? slug;
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `「${title}」にいいねがつきました`,
      }),
    });
    logger.debug({ slug }, "discord notification sent");
  }

  return json({ success: true });
};
