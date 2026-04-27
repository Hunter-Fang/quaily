// ── Sport Database Types & API Layer ──

const SPORT_DATABASE_ID = "bd890c54c1314740851444e50004e5f5";

export interface SportRecord {
  id: string;
  name: string;
  type: string;
  date: string;
  duration: string;
  calories: number;
  device: string;
  distanceM: number;
  // Swim specific
  laps?: number;
  swolf?: number;
  avgPace?: string;
  totalStrokes?: number;
  strokeRate?: number;
  // Rowing specific
  totalStrokesRowing?: number;
  avgStrokeRate?: number;
  maxStrokeRate?: number;
  // HR & training effect
  avgHR?: number;
  maxHR?: number;
  aerobicEffect?: number;
  anaerobicEffect?: number;
  recoveryHours?: number;
  // Status
  status?: string;
  note?: string;
}

interface NotionPage {
  id: string;
  icon?: { type: string; emoji?: string };
  properties: Record<string, any>;
}

interface NotionQueryResponse {
  results: NotionPage[];
  has_more: boolean;
  next_cursor?: string;
}

async function querySportDB(body: Record<string, unknown> = {}): Promise<NotionQueryResponse> {
  const token = process.env.SPORT_NOTION_TOKEN || process.env.NOTION_TOKEN;
  if (!token) throw new Error("Missing NOTION_TOKEN for sport database");

  const res = await fetch(
    `https://api.notion.com/v1/databases/${SPORT_DATABASE_ID}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      next: { revalidate: 30, tags: ["sport-posts"] },
    }
  );
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error(`Sport API ${res.status}:`, errText);
    throw new Error(`Sport API error: ${res.status}`);
  }
  return res.json() as Promise<NotionQueryResponse>;
}

function extractText(richTextArray: { plain_text: string }[]): string {
  return (richTextArray || []).map((t) => t.plain_text).join("");
}

function extractSportRecord(page: NotionPage): SportRecord {
  const p = page.properties;

  const getSelect = (key: string): string => {
    const prop = p[key];
    if (!prop || prop.type !== "select" || !prop.select) return "";
    return prop.select.name || "";
  };

  const getNumber = (key: string): number | undefined => {
    const prop = p[key];
    if (!prop || prop.type !== "number") return undefined;
    return prop.number ?? undefined;
  };

  const getRichText = (key: string): string => {
    const prop = p[key];
    if (!prop || prop.type !== "rich_text") return "";
    return extractText(prop.rich_text);
  };

  const getDate = (key: string): string => {
    const prop = p[key];
    if (!prop || prop.type !== "date" || !prop.date) return "";
    return prop.date.start || "";
  };

  return {
    id: page.id,
    name: extractText(p["活动名称"]?.title || []),
    type: getSelect("运动类型") || "其他",
    date: getDate("日期时间"),
    duration: getRichText("总时长"),
    calories: getNumber("消耗热量(kcal)") || 0,
    device: getSelect("设备来源") || "手动录入",
    distanceM: getNumber("总距离(m)") || 0,
    // Swim
    laps: getNumber("总趟数"),
    swolf: getNumber("平均SWOLF"),
    avgPace: getRichText("平均配速"),
    totalStrokes: getNumber("总划水次数"),
    strokeRate: getNumber("平均划水率(SPM)"),
    // Rowing
    totalStrokesRowing: getNumber("总桨次"),
    avgStrokeRate: getNumber("平均桨频"),
    maxStrokeRate: getNumber("最高桨频"),
    // HR & training
    avgHR: getNumber("平均心率(bpm)"),
    maxHR: getNumber("最高心率(bpm)"),
    aerobicEffect: getNumber("有氧训练效果"),
    anaerobicEffect: getNumber("无氧训练效果"),
    recoveryHours: getNumber("恢复时间(小时)"),
    status: getSelect("运动状态"),
    note: getRichText("备注"),
  };
}

/** Get all sport records sorted by date descending */
export async function getSportRecords(): Promise<SportRecord[]> {
  let allRecords: SportRecord[] = [];
  let hasMore = true;
  let cursor: string | undefined;

  while (hasMore) {
    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const response = await querySportDB(body);
    const records = response.results.map((r) => extractSportRecord(r));
    allRecords = allRecords.concat(records);

    hasMore = response.has_more;
    cursor = response.next_cursor;
  }

  // Sort by date descending
  allRecords.sort((a, b) => b.date.localeCompare(a.date));
  return allRecords;
}

/** Aggregate statistics */
export async function getSportStats() {
  const records = await getSportRecords();
  if (records.length === 0) return null;

  let totalTimeMinutes = 0;
  let totalCalories = 0;
  let totalDistanceM = 0;
  const byType: Record<string, { count: number; timeMin: number; cal: number; distM: number }> = {};
  const byMonth: Record<string, { count: number; cal: number; timeMin: number }> = {};

  records.forEach((r) => {
    // Parse duration "HH:MM:SS" or minutes
    const parts = r.duration.split(":").map(Number);
    let min = 0;
    if (parts.length === 3) {
      min = (parts[0] || 0) * 60 + (parts[1] || 0) + (parts[2] || 0) / 60;
    } else if (parts.length === 2) {
      min = (parts[0] || 0) + (parts[1] || 0) / 60;
    } else {
      min = parseFloat(r.duration) || 0;
    }
    totalTimeMinutes += min;
    totalCalories += r.calories || 0;
    totalDistanceM += r.distanceM || 0;

    if (!byType[r.type]) byType[r.type] = { count: 0, timeMin: 0, cal: 0, distM: 0 };
    byType[r.type].count++;
    byType[r.type].timeMin += min;
    byType[r.type].cal += r.calories || 0;
    byType[r.type].distM += r.distanceM || 0;

    const month = r.date.substring(0, 7);
    if (!byMonth[month]) byMonth[month] = { count: 0, cal: 0, timeMin: 0 };
    byMonth[month].count++;
    byMonth[month].cal += r.calories || 0;
    byMonth[month].timeMin += min;
  });

  const recent = records.slice(0, 10);
  const hrRecords = records.filter((r) => r.avgHR);

  // Best records
  const longestWorkout = records.reduce((a, b) => {
    const aMin = parseDuration(a.duration);
    const bMin = parseDuration(b.duration);
    return aMin > bMin ? a : b;
  });
  const highestCal = records.reduce((a, b) => (a.calories > b.calories ? a : b));
  const longestDist = records.reduce((a, b) => ((a.distanceM || 0) > (b.distanceM || 0) ? a : b));

  return {
    totalCount: records.length,
    totalTimeMinutes: Math.round(totalTimeMinutes),
    totalCalories: Math.round(totalCalories),
    totalDistanceM: Math.round(totalDistanceM),
    recent,
    hrRecords: hrRecords.slice(-20),
    hasHRData: hrRecords.length > 0,
    byType,
    byMonth,
    longestWorkout,
    highestCal,
    longestDist,
    swimRecords: records.filter((r) => r.type === "游泳"),
    rowingRecords: records.filter((r) => r.type === "划船机"),
  };
}

function parseDuration(dur: string): number {
  const parts = dur.split(":").map(Number);
  if (parts.length === 3) return (parts[0] || 0) * 60 + (parts[1] || 0) + (parts[2] || 0) / 60;
  if (parts.length === 2) return (parts[0] || 0) + (parts[1] || 0) / 60;
  return parseFloat(dur) || 0;
}

/** Activity type emoji map */
export const ACTIVITY_EMOJI: Record<string, string> = {
  游泳: "🏊",
  划船机: "🚣",
  跑步: "🏃‍♂️",
  骑行: "🚴",
  爬楼梯: "🧗",
  自由训练: "💪",
  羽毛球: "🏸",
  其他: "🎯",
};

export const DEVICE_LABELS: Record<string, string> = {
  "VIVO WATCH 5": "⌚ Vivo Watch",
  手动录入: "✍ 手动",
};

export const STATUS_COLOR: Record<string, string> = {
  优秀: "#4ade80",
  良好: "#60a5fa",
  一般: "#fbbf24",
};
