import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * 按需重新验证 API
 *
 * 使用方式：
 * 1. 手动触发：GET /api/revalidate?secret=YOUR_SECRET
 * 2. Webhook 触发：POST /api/revalidate （带 secret 在 body 或 header 中）
 *
 * 会清除所有 Notion 数据缓存，下次访问时自动拉取最新内容。
 */

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || "quaily-revalidate-2026";

// GET 方式 — 方便手动在浏览器中触发
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  return doRevalidate();
}

// POST 方式 — 用于 Webhook 自动触发
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const secret =
      body.secret ||
      request.headers.get("x-revalidate-secret");

    if (secret !== REVALIDATE_SECRET) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
    }

    return doRevalidate();
  } catch {
    // If body parsing fails, check header
    const secret = request.headers.get("x-revalidate-secret");
    if (secret !== REVALIDATE_SECRET) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
    }
    return doRevalidate();
  }
}

async function doRevalidate() {
  try {
    // 清除所有带 "notion-posts" 标签的 fetch 缓存（立即过期）
    revalidateTag("notion-posts", { expire: 0 });

    // 同时重新验证关键页面路径
    revalidatePath("/", "page");
    revalidatePath("/categories", "page");
    revalidatePath("/tags", "page");
    // 动态路由用 layout 级别的 revalidation
    revalidatePath("/posts/[slug]", "page");
    revalidatePath("/categories/[category]", "page");
    revalidatePath("/tags/[tag]", "page");

    return NextResponse.json({
      revalidated: true,
      timestamp: new Date().toISOString(),
      message: "所有 Notion 数据缓存已清除，页面将在下次访问时获取最新内容",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Revalidation failed", detail: String(error) },
      { status: 500 }
    );
  }
}
