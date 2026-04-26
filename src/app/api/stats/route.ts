import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// 全局变量（serverless 实例生命周期内持久）
let currentDate = getTodayString();
let todayPV = 0;
let todayUVSet = new Set<string>();

function getTodayString(): string {
  // 使用中国时区
  return new Date().toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai" });
}

function getVisitorHash(req: NextRequest): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const ua = req.headers.get("user-agent") || "unknown";
  // 用 IP + UA 做简单指纹，Hash 后不存储原始数据
  return crypto
    .createHash("sha256")
    .update(`${ip}|${ua}`)
    .digest("hex")
    .slice(0, 16);
}

function resetIfNewDay() {
  const today = getTodayString();
  if (today !== currentDate) {
    currentDate = today;
    todayPV = 0;
    todayUVSet = new Set<string>();
  }
}

// POST: 记录一次访问并返回今日统计
export async function POST(req: NextRequest) {
  resetIfNewDay();

  const visitorHash = getVisitorHash(req);
  todayPV += 1;
  todayUVSet.add(visitorHash);

  return NextResponse.json({
    todayPV,
    todayUV: todayUVSet.size,
  });
}

// GET: 只读取今日统计（不计数）
export async function GET() {
  resetIfNewDay();

  return NextResponse.json({
    todayPV,
    todayUV: todayUVSet.size,
  });
}
