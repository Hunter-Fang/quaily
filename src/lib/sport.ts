// ── Sport Database Types & API Layer ──

const SPORT_DATABASE_ID = "bd890c54c1314740851444e50004e5f5";
const SPORT_TOKEN = process.env.SPORT_NOTION_TOKEN || process.env.NOTION_TOKEN;

interface NotionQueryResponse {
  results: (SportRecord | { id: string })[];
}

export interface SportRecord {
  id: string;
  name: string;       // 活动名称
  icon: string;        // emoji
  type: string;        // 运动类型: 游泳、跑步、骑行等
  date: string;         // 日晒时间
  duration: string;     // 总时长 "00:30:00"
  calories: number;      // 消耗热量(kcal)
  device: string;       // 设备来源
  // Extended fields (may exist on some rows)
  avgHR?: number;       // 平均心率
  maxHR?: number;       // 最高心率
  aerobicEffect?: number;
  anaerobicEffect?: number;
  recoveryHours?: number;
  totalDistanceM?: number;
}

async function querySportDB(body: Record<string, unknown> = {}): Promise<NotionQueryResponse> {
  const token = process.env.SPORT_NOTION_TOKEN || process.env.NOTION_TOKEN;
  if (!token) throw new Error("Missing NOTION_TOKEN for sport database");

  const tryFetch = async (reqBody: Record<string, unknown>) => {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${SPORT_DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
        next: { revalidate: 30, tags: ["sport-posts"] },
      }
    );
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`Sport API ${res.status}:`, errText);
      return null;
    }
    return res.json() as Promise<NotionQueryResponse>;
  };

  // Try with sorts first; if 400, retry without sorts
  const result = await tryFetch(body);
  if (result) return result;

  const fallback = { ...body };
  delete fallback.sorts;
  const fallbackResult = await tryFetch(fallback);
  if (fallbackResult) return fallbackResult;

  throw new Error("Failed to query sport database after retries");
}

function extractText(richTextArray: { plain_text: string }[]): string {
  return richTextArray.map((t) => t.plain_text).join("");
}

function extractSportRecord(page: { id: string; [key: string]: any }): SportRecord {
  const p = page.properties;

  const getName = () => {
    const prop = p["活动名称"] || p["name"];
    if (!prop) return "";
    return prop.type === "title" ? extractText(prop.title) : "";
  };
  const getIcon = () => {
    const prop = p["icon"];
    if (!prop) return "🏃";
    return prop.type === "rich_text" ? extractText(prop.rich_text) : "🏃";
  };
  const getType = () => {
    const prop = p["运动类型"];
    if (!prop) return "其他";
    return prop.type === "select" ? prop.select?.name || "其他" :
           prop.type === "multi_select" ? (prop.multi_select?.[0]?.name || "其他") : "其他";
  };
  const getDate = () => {
    const prop = p["日晒时间"] || p["date"];
    return prop?.type === "date" ? (prop.date?.start ?? "") : "";
  };
  const getDuration = () => {
    const prop = p["总时长"] || p["duration"];
    return prop?.type === "rich_text" ? extractText(prop.rich_text) : "";
  };
  const getCalories = () => {
    const prop = p["消耗热量"] || p["calories"];
    return prop?.type === "number" ? prop.number : 0;
  };
  const getDevice = () => {
    const prop = p["设备来源"] || p["device"];
    return prop?.type === "rich_text" ? extractText(prop.rich_text) : "手动录入";
  };

  // Optional extended fields
  const getNumber = (keys: string[]) => {
    for (const k of keys) {
      const prop = p[k];
      if (prop && prop.type === "number") return prop.number;
    }
    return undefined;
  };

  return {
    id: page.id,
    name: getName(),
    icon: getIcon(),
    type: getType(),
    date: getDate(),
    duration: getDuration(),
    calories: getCalories(),
    device: getDevice(),
    avgHR: getNumber(["平均心率", "平均心率(bpm)", "avgHR"]),
    maxHR: getNumber(["最高心率", "最高心率(bpm)", "maxHR"]),
    aerobicEffect: getNumber(["有氧训练效果", "aerobicEffect"]),
    anaerobicEffect: getNumber(["无氧训练效果", "anaerobicEffect"]),
    recoveryHours: getNumber(["恢复时间", "恢复时间(小时)", "recoveryTime"]),
    totalDistanceM: getNumber(["总距离(m)", "totalDistance"]),
  };
}

/** Get all sport records sorted by date descending */
export async function getSportRecords(): Promise<SportRecord[]> {
  const response = await querySportDB({
    sorts: [{ property: "日晒时间", direction: "descending" }],
  });
  return response.results
    .filter((r): r is SportRecord => typeof r === "object")
    .map((r) => extractSportRecord(r as any));
}

/** Aggregate statistics */
export async function getSportStats() {
  const records = await getSportRecords();
  if (records.length === 0) return null;

  let totalTimeMinutes = 0;
  let totalCalories = 0;
  let totalDistanceM = 0;
  const byType: Record<string, { count: number; timeMin: number; cal: number }> = {};
  const byMonth: Record<string, { count: number; cal: number }> = {};

  records.forEach((r) => {
    // Parse duration "HH:MM:SS"
    const parts = r.duration.split(":").map(Number);
    const min = (parts[0] || 0) * 60 + (parts[1] || 0);
    totalTimeMinutes += min;
    totalCalories += r.calories || 0;
    totalDistanceM += r.totalDistanceM || 0;

    if (!byType[r.type]) byType[r.type] = { count: 0, timeMin: 0, cal: 0 };
    byType[r.type].count++;
    byType[r.type].timeMin += min;
    byType[r.type].cal += r.calories || 0;

    const month = r.date.substring(0, 7); // YYYY-MM
    if (!byMonth[month]) byMonth[month] = { count: 0, cal: 0 };
    byMonth[month].count++;
    byMonth[month].cal += r.calories || 0;
  });

  // Recent records (last 10)
  const recent = records.slice(0, 10);

  // Records with HR data
  const hrRecords = records.filter((r) => r.avgHR);

  return {
    totalCount: records.length,
    totalTimeMinutes,
    totalCalories,
    totalDistanceM,
    totalDistanceKm: +(totalDistanceM / 1000).toFixed(1),
    totalHours: +(totalTimeMinutes / 60).toFixed(1),
    avgCaloriesPerSession: Math.round(totalCalories / records.length),
    avgDurationMin: Math.round(totalTimeMinutes / records.length),
    byType,
    byMonth,
    recent,
    hrRecords: hrRecords.slice(-20),
    hasHRData: hrRecords.length > 0,
  };
}

/** Activity type emoji map */
export const ACTIVITY_EMOJI: Record<string, string> = {
  游泳: "🏊",
  划船机: "🚣",
  跑步: "🏃‍♂️",
  骑行: "🚴",
  爬楼机: "🧗",
  自由训练: "💪",
  羽毛球: "🏸",
  其他: "🎯",
};

export const DEVICE_LABELS: Record<string, string> = {
  "VIVO WATCH 5": "⌚",
  手动录入: "✍",
};
