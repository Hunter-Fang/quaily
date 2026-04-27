"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const BRAND = "#1B365D";
const BRAND_LIGHT = "rgba(27,54,93,0.12)";
const COLORS = ["#1B365D", "#2d6a4f", "#9b2226", "#ca6702", "#4361ee", "#7209b7", "#e63946"];
const HEAT_LOW = "rgba(27,54,93,0.15)";
const HEAT_HIGH = "rgba(27,54,93,0.85)";

interface TrendItem {
  month: string;
  次数: number;
  热量: number;
  时长: number;
}

interface PieItem {
  name: string;
  value: number;
  count: number;
  emoji: string;
}

interface HRItem {
  date: string;
  平均: number;
  最高: number;
  type: string;
}

interface Props {
  trendData: TrendItem[];
  typePieData: PieItem[];
  hrData: HRItem[];
  totalCount: number;
  totalTimeMinutes: number;
  totalCalories: number;
  totalDistanceM: number;
}

/* ── Custom Tooltip ── */
function KamiTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg"
      style={{
        background: "var(--c-surface)",
        border: "1px solid var(--c-border)",
        color: "var(--c-text)",
      }}
    >
      <div className="font-serif font-medium mb-1" style={{ color: "var(--c-brand)" }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: "var(--c-text-3)" }}>{p.name}:</span>
          <span className="font-mono tabular-nums" style={{ color: "var(--c-text)" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function SportCharts({
  trendData,
  typePieData,
  hrData,
}: Props) {
  return (
    <>
      {/* ── Calorie Trend - Smooth Area Chart ── */}
      {trendData.length > 1 && (
        <section className="mb-14">
          <h3 className="section-title">热量趋势</h3>
          <div className="p-5 rounded-lg border" style={{ background: "var(--c-surface)", borderColor: "var(--c-border)" }}>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradCalories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={BRAND} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" opacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--c-text-4)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--c-text-4)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<KamiTooltip />} />
                <Area type="monotone" dataKey="热量" stroke={BRAND} strokeWidth={2.5} fill="url(#gradCalories)" name="热量(kcal)" dot={{ r: 4, fill: BRAND, strokeWidth: 2, stroke: "var(--c-surface)" }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* ── Activity Count + Duration - Dual Bar Chart ── */}
      {trendData.length > 1 && (
        <section className="mb-14">
          <h3 className="section-title">训练频次 & 时长</h3>
          <div className="p-5 rounded-lg border" style={{ background: "var(--c-surface)", borderColor: "var(--c-border)" }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" opacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--c-text-4)" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "var(--c-text-4)" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "var(--c-text-4)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<KamiTooltip />} />
                <Bar yAxisId="left" dataKey="次数" name="次数" fill={BRAND} radius={[4, 4, 0, 0]} barSize={20} opacity={0.8} />
                <Bar yAxisId="right" dataKey="时长" name="时长(min)" fill={BRAND} radius={[4, 4, 0, 0]} barSize={20} opacity={0.35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* ── Sport Type Donut ── */}
      {typePieData.length > 1 && (
        <section className="mb-14">
          <h3 className="section-title">运动类型分布</h3>
          <div className="p-5 rounded-lg border" style={{ background: "var(--c-surface)", borderColor: "var(--c-border)" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={typePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {typePieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as PieItem;
                      return (
                        <div
                          className="rounded-lg px-3 py-2 text-xs shadow-lg"
                          style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", color: "var(--c-text)" }}
                        >
                          <div className="font-serif font-medium" style={{ color: "var(--c-brand)" }}>{d.emoji} {d.name}</div>
                          <div style={{ color: "var(--c-text-3)" }}>{d.value} kcal · {d.count} 次</div>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5">
                {typePieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-sm flex-shrink-0">{d.emoji}</span>
                    <span className="text-sm flex-1" style={{ color: "var(--c-text)" }}>{d.name}</span>
                    <span className="text-xs font-mono tabular-nums" style={{ color: "var(--c-text-3)" }}>{d.value} kcal</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--c-tag-bg)", color: "var(--c-text-4)" }}>{d.count}次</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Heart Rate Curve ── */}
      {hrData.length > 1 && (
        <section className="mb-14">
          <h3 className="section-title">❤️ 心率曲线</h3>
          <div className="p-5 rounded-lg border" style={{ background: "var(--c-surface)", borderColor: "var(--c-border)" }}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={hrData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradHR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" opacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--c-text-4)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--c-text-4)" }} axisLine={false} tickLine={false} domain={[60, "auto"]} />
                <Tooltip content={<KamiTooltip />} />
                <Line type="monotone" dataKey="最高" name="最高心率" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: "#ef4444", stroke: "var(--c-surface)", strokeWidth: 2 }} />
                <Line type="monotone" dataKey="平均" name="平均心率" stroke={BRAND} strokeWidth={2.5} dot={{ r: 4, fill: BRAND, stroke: "var(--c-surface)", strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-5 mt-3 text-[10px]" style={{ color: "var(--c-text-4)" }}>
              <span className="flex items-center gap-1"><span className="w-4 h-0.5 rounded" style={{ background: BRAND }} /> 平均心率</span>
              <span className="flex items-center gap-1"><span className="w-4 h-0.5 rounded" style={{ background: "#ef4444" }} /> 最高心率</span>
            </div>
          </div>
        </section>
      )}

      {/* ── Training Effect Radar-ish Bar ── */}
      {hrData.length > 0 && (
        <section className="mb-14">
          <h3 className="section-title">训练效果</h3>
          <div className="p-5 rounded-lg border" style={{ background: "var(--c-surface)", borderColor: "var(--c-border)" }}>
            <TrainingEffectChart data={hrData} />
          </div>
        </section>
      )}
    </>
  );
}

/* ── Training Effect: Custom Horizontal Bar ── */
function TrainingEffectChart({ data }: { data: HRItem[] }) {
  // This is simplified - showing aerobic/anaerobic scores as bars
  // Since we don't have the full data in HRItem, we'll show a summary
  return (
    <div className="text-center py-6" style={{ color: "var(--c-text-4)" }}>
      <p className="text-sm">训练效果数据随心率详情同步展示</p>
      <p className="text-xs mt-1">见下方心率详情表格中的有氧/无氧训练效果值</p>
    </div>
  );
}
