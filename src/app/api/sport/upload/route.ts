import { NextRequest, NextResponse } from "next/server";

const NOTION_TOKEN = process.env.SPORT_NOTION_TOKEN || process.env.NOTION_TOKEN;
const DATABASE_ID = "bd890c54c1314740851444e50004e5f5";

export interface SportEntry {
  // 必填
  活动名称: string;           // title
  日期时间: string;            // ISO date e.g. "2026-05-01T08:00:00+08:00"
  运动类型: string;            // select: 游泳/划船机/跑步/骑行/爬楼梯/自由训练/羽毛球
  总时长: string;              // rich_text e.g. "00:45:30"
  消耗热量: number;            // number (kcal)
  // 选填
  设备来源?: string;           // select: "VIVO WATCH 5" | "手动录入"
  运动状态?: string;           // select: 优秀/良好/一般
  总距离?: number;             // number (m)
  平均心率?: number;           // number (bpm)
  最高心率?: number;           // number (bpm)
  有氧训练效果?: number;        // number 0-5
  无氧训练效果?: number;        // number 0-5
  恢复时间?: number;           // number (小时)
  平均配速?: string;           // rich_text e.g. "3'02\" / 100m"
  备注?: string;               // rich_text
  // 游泳专项
  总趟数?: number;
  平均SWOLF?: number;
  总划水次数?: number;
  平均划水率?: number;         // SPM
  // 划船机专项
  总桨次?: number;
  平均桨频?: number;
  最高桨频?: number;
}

function buildNotionPage(entry: SportEntry) {
  const props: Record<string, unknown> = {};

  // title
  props["活动名称"] = {
    title: [{ text: { content: entry.活动名称 } }],
  };

  // date
  props["日期时间"] = {
    date: { start: entry.日期时间 },
  };

  // selects
  if (entry.运动类型) props["运动类型"] = { select: { name: entry.运动类型 } };
  if (entry.设备来源) props["设备来源"] = { select: { name: entry.设备来源 } };
  if (entry.运动状态) props["运动状态"] = { select: { name: entry.运动状态 } };

  // rich_text
  if (entry.总时长) props["总时长"] = { rich_text: [{ text: { content: entry.总时长 } }] };
  if (entry.平均配速) props["平均配速"] = { rich_text: [{ text: { content: entry.平均配速 } }] };
  if (entry.备注) props["备注"] = { rich_text: [{ text: { content: entry.备注 } }] };

  // numbers
  const numMap: [string, keyof SportEntry][] = [
    ["消耗热量(kcal)", "消耗热量"],
    ["总距离(m)", "总距离"],
    ["平均心率(bpm)", "平均心率"],
    ["最高心率(bpm)", "最高心率"],
    ["有氧训练效果", "有氧训练效果"],
    ["无氧训练效果", "无氧训练效果"],
    ["恢复时间(小时)", "恢复时间"],
    ["总趟数", "总趟数"],
    ["平均SWOLF", "平均SWOLF"],
    ["总划水次数", "总划水次数"],
    ["平均划水率(SPM)", "平均划水率"],
    ["总桨次", "总桨次"],
    ["平均桨频", "平均桨频"],
    ["最高桨频", "最高桨频"],
  ];
  for (const [notionKey, entryKey] of numMap) {
    const val = entry[entryKey];
    if (val !== undefined && val !== null) {
      props[notionKey] = { number: Number(val) };
    }
  }

  return {
    parent: { database_id: DATABASE_ID },
    properties: props,
  };
}

export async function POST(req: NextRequest) {
  if (!NOTION_TOKEN) {
    return NextResponse.json({ error: "Missing NOTION_TOKEN" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 支持单条或数组
  const entries: SportEntry[] = Array.isArray(body) ? body : [body as SportEntry];

  if (!entries.length) {
    return NextResponse.json({ error: "Empty entries" }, { status: 400 });
  }

  const results: { index: number; name: string; status: "ok" | "error"; id?: string; error?: string }[] = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry.活动名称 || !entry.日期时间 || !entry.运动类型 || !entry.总时长 || entry.消耗热量 === undefined) {
      results.push({ index: i, name: entry.活动名称 || `#${i}`, status: "error", error: "缺少必填字段：活动名称、日期时间、运动类型、总时长、消耗热量" });
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
        results.push({ index: i, name: entry.活动名称, status: "error", error: `Notion ${res.status}: ${err.slice(0, 200)}` });
      } else {
        const data = await res.json() as { id: string };
        results.push({ index: i, name: entry.活动名称, status: "ok", id: data.id });
      }
    } catch (e: unknown) {
      results.push({ index: i, name: entry.活动名称, status: "error", error: String(e) });
    }
  }

  const ok = results.filter((r) => r.status === "ok").length;
  const fail = results.filter((r) => r.status === "error").length;

  return NextResponse.json({ total: entries.length, ok, fail, results }, { status: 200 });
}
