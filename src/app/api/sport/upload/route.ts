import { NextRequest, NextResponse } from "next/server";

const NOTION_TOKEN = process.env.SPORT_NOTION_TOKEN || process.env.NOTION_TOKEN;
const DATABASE_ID = "bd890c54c1314740851444e50004e5f5";

export interface SportEntry {
  // 必填
  活动名称: string;
  日期时间: string;
  运动类型: string;
  总时长: string;
  "消耗热量(kcal)": number;
  // 选填
  运动状态?: string;
  "总距离(m)"?: number;
  "平均心率(bpm)"?: number;
  "最高心率(bpm)"?: number;
  有氧训练效果?: number;
  无氧训练效果?: number;
  "恢复时间(小时)"?: number;
  平均配速?: string;
  心率区间分布?: string;
  备注?: string;
}

function buildNotionPage(e: SportEntry) {
  const p: Record<string, unknown> = {};

  p["活动名称"] = { title: [{ text: { content: e.活动名称 } }] };
  p["日期时间"]  = { date: { start: e.日期时间 } };
  p["运动类型"]  = { select: { name: e.运动类型 } };

  const rt = (v: string) => ({ rich_text: [{ text: { content: v } }] });
  p["总时长"] = rt(e.总时长);
  if (e.运动状态)    p["运动状态"]    = { select: { name: e.运动状态 } };
  if (e.平均配速)    p["平均配速"]    = rt(e.平均配速);
  if (e.心率区间分布) p["心率区间分布"] = rt(e.心率区间分布);
  if (e.备注)        p["备注"]        = rt(e.备注);

  const nums: [string, unknown][] = [
    ["消耗热量(kcal)",  e["消耗热量(kcal)"]],
    ["总距离(m)",       e["总距离(m)"]],
    ["平均心率(bpm)",   e["平均心率(bpm)"]],
    ["最高心率(bpm)",   e["最高心率(bpm)"]],
    ["有氧训练效果",    e.有氧训练效果],
    ["无氧训练效果",    e.无氧训练效果],
    ["恢复时间(小时)",  e["恢复时间(小时)"]],
  ];
  for (const [key, val] of nums) {
    if (val !== undefined && val !== null) p[key] = { number: Number(val) };
  }

  return { parent: { database_id: DATABASE_ID }, properties: p };
}

export async function POST(req: NextRequest) {
  if (!NOTION_TOKEN) return NextResponse.json({ error: "Missing NOTION_TOKEN" }, { status: 500 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const entries: SportEntry[] = Array.isArray(body) ? body : [body as SportEntry];
  if (!entries.length) return NextResponse.json({ error: "Empty" }, { status: 400 });

  const results: { index: number; name: string; status: "ok" | "error"; id?: string; error?: string }[] = [];

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const missing = ["活动名称","日期时间","运动类型","总时长","消耗热量(kcal)"].filter(
      k => e[k as keyof SportEntry] === undefined || e[k as keyof SportEntry] === null || e[k as keyof SportEntry] === ""
    );
    if (missing.length) {
      results.push({ index: i, name: e.活动名称 || `#${i}`, status: "error", error: `缺少：${missing.join("、")}` });
      continue;
    }
    try {
      const res = await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: { Authorization: `Bearer ${NOTION_TOKEN}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
        body: JSON.stringify(buildNotionPage(e)),
      });
      if (!res.ok) {
        const err = await res.text().catch(() => "");
        results.push({ index: i, name: e.活动名称, status: "error", error: `Notion ${res.status}: ${err.slice(0, 200)}` });
      } else {
        const data = await res.json() as { id: string };
        results.push({ index: i, name: e.活动名称, status: "ok", id: data.id });
      }
    } catch (err) {
      results.push({ index: i, name: e.活动名称, status: "error", error: String(err) });
    }
  }

  const ok = results.filter(r => r.status === "ok").length;
  const fail = results.filter(r => r.status === "error").length;
  return NextResponse.json({ total: entries.length, ok, fail, results });
}
