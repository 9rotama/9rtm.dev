import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import { logger } from "$lib/logger";
import { z } from "zod";
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

  logger.debug({ slug }, "like request received");

  // platform.env検証（vite devでは存在しない）
  const env = platform?.env;
  if (!env) {
    logger.debug("platform.env not available (dev mode)");
    return json({ success: true, dev: true });
  }

  const db = env._9rtm_dev_db;
  const webhookUrl = env.DISCORD_WEBHOOK_URL;

  // slug検証
  const validSlugs = getSelfNoteSlugs();
  if (!validSlugs.has(slug)) {
    logger.warn({ slug }, "invalid slug");
    return json({ error: "Note not found" }, { status: 404 });
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
    return json({ success: true, alreadyLiked: true });
  }

  // いいね記録
  const results = await db.batch([
    db.prepare(upsertLikeQuery).bind(slug),
    db.prepare(insertLikeLogQuery).bind(slug, ipHash),
  ]);

  const likeCountSchema = z.object({ count: z.number() });
  const parsed = likeCountSchema.safeParse(results[0].results[0]);
  const likeCount = parsed.success ? parsed.data.count : undefined;

  logger.info({ slug, likeCount }, "like recorded");

  // Discord通知
  if (webhookUrl) {
    const title = getSelfNoteTitle(slug) ?? slug;
    const countText = likeCount != null ? ` (${likeCount}件目)` : "";
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `「${title}」にいいねがつきました!${countText}`,
      }),
    });
    logger.debug({ slug }, "discord notification sent");
  }

  return json({ success: true });
};
