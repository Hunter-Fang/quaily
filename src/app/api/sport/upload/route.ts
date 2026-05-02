import { NextRequest, NextResponse } from "next/server";

const NOTION_TOKEN = process.env.SPORT_NOTION_TOKEN || process.env.NOTION_TOKEN;
const DATABASE_ID = "bd890c54c1314740851444e50004e5f5";

// 完全对齐 Notion 数据库实际字段名
export interface SportEntry {
  // 必填
  活动名称: string;
  日期时间: string;              // ISO e.g. "2026-05-02T08:00:00.000+08:00"
  运动类型: string;              // 游泳/划船机/跑步/骑行/爬楼梯/自由训练/羽毛球
  总时长: string;                // "HH:MM:SS"
  "消耗热量(kcal)": number;

  // 选填
  设备来源?: string;             // "VIVO WATCH 5" | "手动录入"
  运动状态?: string;             // 优秀/良好/一般
  "总距离(m)"?: number;
  "平均心率(bpm)"?: number;
  "最高心率(bpm)"?: number;
  有氧训练效果?: number;         // 0-5
  无氧训练效果?: number;         // 0-5
  "恢复时间(小时)"?: number;
  "平均配速(/100m)"?: string;     // 只填数值，如 "3'19"
  心率区间分布?: string;         // JSON 字符串
  备注?: string;

  // 游泳专项
  总趟数?: number;
  "平均SWOLF"?: number;
  总划水次数?: number;
  "平均划水率(SPM)"?: number;

  // 划船机专项
  总桨次?: number;
  平均桨频?: number;
  最高桨频?: number;
}

function buildNotionPage(e: SportEntry) {
  const p: Record<string, unknown> = {};

  // title
  p["活动名称"] = { title: [{ text: { content: e.活动名称 } }] };

  // date
  p["日期时间"] = { date: { start: e.日期时间 } };

  // selects
  if (e.运动类型) p["运动类型"] = { select: { name: e.运动类型 } };
  if (e.设备来源) p["设备来源"] = { select: { name: e.设备来源 } };
  if (e.运动状态) p["运动状态"] = { select: { name: e.运动状态 } };

  // rich_text
  const rt = (v: string) => ({ rich_text: [{ text: { content: v } }] });
  if (e.总时长)      p["总时长"]      = rt(e.总时长);
  if (e["平均配速(/100m)"]) p["平均配速"]    = rt(e["平均配速(/100m)"]);
  if (e.心率区间分布) p["心率区间分布"] = rt(e.心率区间分布);
  if (e.备注)        p["备注"]        = rt(e.备注);

  // numbers — 严格用数据库实际字段名
  const nums: [string, unknown][] = [
    ["消耗热量(kcal)",  e["消耗热量(kcal)"]],
    ["总距离(m)",       e["总距离(m)"]],
    ["平均心率(bpm)",   e["平均心率(bpm)"]],
    ["最高心率(bpm)",   e["最高心率(bpm)"]],
    ["有氧训练效果",    e.有氧训练效果],
    ["无氧训练效果",    e.无氧训练效果],
    ["恢复时间(小时)",  e["恢复时间(小时)"]],
    ["总趟数",          e.总趟数],
    ["平均SWOLF",       e["平均SWOLF"]],
    ["总划水次数",      e.总划水次数],
    ["平均划水率(SPM)", e["平均划水率(SPM)"]],
    ["总桨次",          e.总桨次],
    ["平均桨频",        e.平均桨频],
    ["最高桨频",        e.最高桨频],
  ];
  for (const [key, val] of nums) {
    if (val !== undefined && val !== null) {
      p[key] = { number: Number(val) };
    }
  }

  return { parent: { database_id: DATABASE_ID }, properties: p };
}

export async function POST(req: NextRequest) {
  if (!NOTION_TOKEN) {
    return NextResponse.json({ error: "Missing NOTION_TOKEN" }, { status: 500 });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const entries: SportEntry[] = Array.isArray(body) ? body : [body as SportEntry];
  if (!entries.length) return NextResponse.json({ error: "Empty entries" }, { status: 400 });

  const results: { index: number; name: string; status: "ok" | "error"; id?: string; error?: string }[] = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const missing = [];
    if (!entry.活动名称) missing.push("活动名称");
    if (!entry.日期时间) missing.push("日期时间");
    if (!entry.运动类型) missing.push("运动类型");
    if (!entry.总时长)   missing.push("总时长");
    if (entry["消耗热量(kcal)"] === undefined) missing.push("消耗热量(kcal)");

    if (missing.length) {
      results.push({ index: i, name: entry.活动名称 || `#${i}`, status: "error", error: `缺少必填字段：${missing.join("、")}` });
      continue;
    }

    try {
      const page = buildNotionPage(entry);
      const res = await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(page),
      });

      if (!res.ok) {
        const err = await res.text().catch(() => "");
        results.push({ index: i, name: entry.活动名称, status: "error", error: `Notion ${res.status}: ${err.slice(0, 300)}` });
      } else {
        const data = await res.json() as { id: string };
        results.push({ index: i, name: entry.活动名称, status: "ok", id: data.id });
      }
    } catch (e) {
      results.push({ index: i, name: entry.活动名称, status: "error", error: String(e) });
    }
  }

  const ok   = results.filter(r => r.status === "ok").length;
  const fail = results.filter(r => r.status === "error").length;
  return NextResponse.json({ total: entries.length, ok, fail, results });
}
