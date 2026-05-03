import { getSportStats, ACTIVITY_EMOJI, STATUS_COLOR } from "@/lib/sport";
import SportCharts from "./SportCharts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "运动数据 | 椒盐不谈",
  description: "运动记录与数据分析",
};

function fmtDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function fmtDistance(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1)}km`;
  if (m > 0) return `${m}m`;
  return "—";
}

function fmtDateCN(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const bj = new Date(d.getTime() + 8 * 60 * 60 * 1000);
  return `${bj.getUTCFullYear()}年${bj.getUTCMonth() + 1}月${bj.getUTCDate()}日`;
}

function fmtDateShort(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const bj = new Date(d.getTime() + 8 * 60 * 60 * 1000);
  return `${bj.getUTCMonth() + 1}月${bj.getUTCDate()}日`;
}

function bjDateKey(iso: string): string {
  const d = new Date(iso);
  const bj = new Date(d.getTime() + 8 * 60 * 60 * 1000);
  return `${bj.getUTCFullYear()}-${String(bj.getUTCMonth() + 1).padStart(2, "0")}-${String(bj.getUTCDate()).padStart(2, "0")}`;
}

export default async function SportPage() {
  let stats = null;
  try { stats = await getSportStats(); } catch (err) { console.error("Sport page error:", err); }

  if (!stats || stats.totalCount === 0) {
    return (
      <div className="kami-section-header text-center mt-10">
        <div className="eyebrow justify-center">Fitness</div>
        <h1>运动数据</h1>
        <p className="mt-3" style={{ color: "var(--c-text-4)" }}>暂无运动记录</p>
        <div className="rule" />
      </div>
    );
  }

  const sortedTypes = Object.entries(stats.byType).sort((a, b) => b[1].timeMin - a[1].timeMin);
  const months = Object.entries(stats.byMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-6);

  const trendData = months.map(([month, data]) => ({
    month: month.replace("-", "年") + "月",
    次数: data.count,
    热量: Math.round(data.cal),
    时长: Math.round(data.timeMin),
  }));

  const typePieData = sortedTypes.map(([type, data]) => ({
    name: type,
    value: Math.round(data.cal),
    count: data.count,
    emoji: ACTIVITY_EMOJI[type] || "🎯",
  }));

  const hrData = stats.hrRecords
    .slice().reverse()
    .filter(r => r.avgHR && r.maxHR)
    .map(r => ({ date: fmtDateShort(r.date), 平均: r.avgHR!, 最高: r.maxHR!, type: r.type }));

  const weeklyData: Record<string, { count: number; cal: number }> = {};
  stats.recent.forEach(r => {
    const day = bjDateKey(r.date);
    if (!weeklyData[day]) weeklyData[day] = { count: 0, cal: 0 };
    weeklyData[day].count++;
    weeklyData[day].cal += r.calories;
  });

  const chartProps = { trendData, typePieData, hrData, totalCount: stats.totalCount, totalTimeMinutes: stats.totalTimeMinutes, totalCalories: Math.round(stats.totalCalories), totalDistanceM: stats.totalDistanceM };

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="kami-section-header mb-8">
        <div className="eyebrow">Fitness</div>
        <h1>运动数据</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--c-text-3)" }}>记录每一次心跳与呼吸</p>
      </div>

      {/* Key Metrics + Rings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard icon="🏃" label="总训练" value={`${stats.totalCount}`} sub="次" />
          <MetricCard icon="⏱" label="总时长" value={fmtDuration(stats.totalTimeMinutes)} sub={null} />
          <MetricCard icon="🔥" label="消耗热量" value={`${Math.round(stats.totalCalories)}`} sub="kcal" />
          <MetricCard icon="📍" label="总距离" value={fmtDistance(stats.totalDistanceM)} sub={null} />
        </div>
        <div className="flex items-center justify-center">
          <ActivityRings moveCal={Math.round(stats.totalCalories)} exerciseMin={stats.totalTimeMinutes} workouts={stats.totalCount} />
        </div>
      </div>

      {/* Charts */}
      <SportCharts {...chartProps} />

      {/* Personal Bests */}
      <section className="mb-14">
        <h3 className="section-title">个人最佳</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BestCard emoji="⏱" title="最长训练" name={stats.longestWorkout.name} value={stats.longestWorkout.duration} detail={stats.longestWorkout.type} />
          <BestCard emoji="🔥" title="最高消耗" name={stats.highestCal.name} value={`${stats.highestCal.calories} kcal`} detail={stats.highestCal.type} />
          <BestCard emoji="📍" title="最远距离" name={stats.longestDist.name} value={fmtDistance(stats.longestDist.distanceM)} detail={stats.longestDist.type} />
        </div>
      </section>

      {/* Activity Heatmap */}
      <section className="mb-14">
        <h3 className="section-title">活动日历</h3>
        <WeeklyHeatmap data={weeklyData} />
      </section>

      {/* Recent Activity */}
      <section className="mb-14">
        <h3 className="section-title">最近活动</h3>
        <div className="space-y-3">
          {stats.recent.map(r => <ActivityRow key={r.id} record={r} fmtDateShort={fmtDateShort} fmtDistance={fmtDistance} />)}
        </div>
      </section>

      {/* HR Table */}
      {stats.hasHRData && stats.hrRecords.length > 0 && (
        <section className="mb-14">
          <h3 className="section-title">❤️ 心率详情</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "2px solid var(--c-brand)" }}>
                  {["日期", "运动", "平均心率", "最高心率", "有氧", "无氧", "恢复", "配速/100m", "状态"].map(h => (
                    <th key={h} className="py-3 px-2 text-left font-serif font-normal" style={{ color: "var(--c-text-3)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.hrRecords.map(r => (
                  <tr key={r.id} className="border-b hover:opacity-80 transition-opacity" style={{ borderColor: "var(--c-border)" }}>
                    <td className="py-2.5 px-2 font-mono text-xs" style={{ color: "var(--c-text-3)" }}>{fmtDateShort(r.date)}</td>
                    <td className="py-2.5 px-2">
                      <span className="mr-1">{ACTIVITY_EMOJI[r.type] || "🎯"}</span>
                      <span className="text-sm" style={{ color: "var(--c-text-2)" }}>{r.type}</span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-medium" style={{ color: "var(--c-brand)" }}>{r.avgHR ?? "—"}</td>
                    <td className="py-2.5 px-2 text-right font-mono font-medium" style={{ color: "var(--c-text-2)" }}>{r.maxHR ?? "—"}</td>
                    <td className="py-2.5 px-2 text-center font-mono text-xs" style={{ color: "var(--c-brand)" }}>
                      {r.aerobicEffect != null ? r.aerobicEffect.toFixed(1) : "—"}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono text-xs" style={{ color: "var(--c-text-3)" }}>
                      {r.anaerobicEffect != null ? r.anaerobicEffect.toFixed(1) : "—"}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-xs" style={{ color: "var(--c-text-2)" }}>{r.recoveryHours != null ? `${r.recoveryHours}h` : "—"}</td>
                    <td className="py-2.5 px-2 text-right text-xs" style={{ color: "var(--c-text-3)" }}>{r.avgPace || "—"}</td>
                    <td className="py-2.5 px-2 text-center text-xs" style={{ color: STATUS_COLOR[r.status] || "var(--c-text-4)" }}>
                      {r.status || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string | null }) {
  return (
    <div className="metric-card group">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}{sub ? ` · ${sub}` : ""}</div>
    </div>
  );
}

function BestCard({ emoji, title, name, value, detail }: { emoji: string; title: string; name: string; value: string; detail: string }) {
  return (
    <div className="metric-card">
      <div className="text-lg mb-1">{emoji}</div>
      <div className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--c-text-4)" }}>{title}</div>
      <div className="font-serif text-lg font-[500] mb-1" style={{ color: "var(--c-brand)" }}>{value}</div>
      <div className="text-xs truncate" style={{ color: "var(--c-text-3)" }}>{name}</div>
      <div className="text-[10px] mt-1" style={{ color: "var(--c-text-4)" }}>{ACTIVITY_EMOJI[detail] || ""} {detail}</div>
    </div>
  );
}

function ActivityRings({ moveCal, exerciseMin, workouts }: { moveCal: number; exerciseMin: number; workouts: number }) {
  const rings = [
    { pct: Math.min(moveCal / 2000, 1), color: "#ef4444", bg: "rgba(239,68,68,0.15)", label: "消耗", value: `${moveCal}`, unit: "kcal" },
    { pct: Math.min(exerciseMin / 300, 1), color: "#22c55e", bg: "rgba(34,197,94,0.15)", label: "时长", value: `${Math.round(exerciseMin)}`, unit: "min" },
    { pct: Math.min(workouts / 15, 1), color: "#3b82f6", bg: "rgba(59,130,246,0.15)", label: "训练", value: `${workouts}`, unit: "次" },
  ];
  const size = 180, cx = 90, cy = 90, sw = 12, gap = 6;
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {rings.map((ring, i) => {
          const r = (cx - sw / 2) - i * (sw + gap);
          const circ = 2 * Math.PI * r;
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={ring.bg} strokeWidth={sw} strokeLinecap="round" />
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={ring.color} strokeWidth={sw} strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={circ * (1 - ring.pct)}
                transform={`rotate(-90 ${cx} ${cy})`} />
            </g>
          );
        })}
      </svg>
      <div className="flex gap-4 mt-3">
        {rings.map((ring, i) => (
          <div key={i} className="text-center">
            <div className="flex items-center gap-1 justify-center">
              <span className="w-2 h-2 rounded-full" style={{ background: ring.color }} />
              <span className="text-[10px]" style={{ color: "var(--c-text-4)" }}>{ring.label}</span>
            </div>
            <div className="font-mono text-xs font-medium" style={{ color: "var(--c-text-2)" }}>{ring.value}{ring.unit}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeeklyHeatmap({ data }: { data: Record<string, { count: number; cal: number }> }) {
  const maxCal = Math.max(...Object.values(data).map(d => d.cal), 1);
  const weekDays = ["一","二","三","四","五","六","日"];
  const today = new Date();
  const start = new Date(today); start.setDate(start.getDate() - 27);
  const cells: { date: string; day: string; intensity: number; cal: number }[] = [];
  for (let i = 0; i < 28; i++) {
    const d = new Date(start); d.setDate(d.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    const dd = data[key];
    cells.push({ date: key, day: weekDays[(d.getDay()+6)%7], intensity: dd ? Math.max(0.15, dd.cal/maxCal) : 0, cal: dd?.cal||0 });
  }
  return (
    <div className="p-5 rounded-lg border" style={{ background: "var(--c-surface)", borderColor: "var(--c-border)" }}>
      <div className="flex gap-1 justify-center">
        {weekDays.map(wd => (
          <div key={wd} className="grid gap-1" style={{ width: 28 }}>
            <div className="text-[9px] text-center mb-1" style={{ color: "var(--c-text-4)" }}>{wd}</div>
            {cells.filter(c => c.day === wd).map(c => (
              <div key={c.date} className="rounded-sm mx-auto" style={{ width: 22, height: 22, background: c.intensity > 0 ? `rgba(27,54,93,${c.intensity})` : "var(--c-warm-sand)" }} title={`${c.date}: ${c.cal>0?`${c.cal} kcal`:"无活动"}`} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 mt-4 text-[10px]" style={{ color: "var(--c-text-4)" }}>
        <span>少</span>
        {[0.15,0.35,0.6,0.85].map(o => <span key={o} className="w-3 h-3 rounded-sm" style={{ background: `rgba(27,54,93,${o})` }} />)}
        <span>多</span>
      </div>
    </div>
  );
}

function ActivityRow({ record, fmtDateShort, fmtDistance }: { record: any; fmtDateShort: (s:string)=>string; fmtDistance: (m:number)=>string }) {
  return (
    <div className="post-card p-4 flex items-center gap-4 hover:opacity-90 transition-opacity">
      <span className="text-xl w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0" style={{ background: "var(--c-tag-bg)" }}>
        {ACTIVITY_EMOJI[record.type] || "🏃"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-sm truncate mb-0.5" style={{ color: "var(--c-text)" }}>{record.name}</div>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--c-text-4)" }}>
          <span>{record.type}</span>
          <span>·</span>
          <span className="font-mono">{fmtDateShort(record.date)}</span>
          {record.status && (
            <><span>·</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLOR[record.status] || "var(--c-text-4)" }} />
            <span>{record.status}</span></>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="font-serif text-base font-[500]" style={{ color: "var(--c-brand)" }}>{record.duration}</div>
        <div className="text-[11px] mt-0.5" style={{ color: "var(--c-text-4)" }}>{record.calories} kcal</div>
        {record.distanceM > 0 && <div className="text-[10px]" style={{ color: "var(--c-text-4)" }}>{fmtDistance(record.distanceM)}</div>}
        {record.avgPace && <div className="text-[10px] font-mono" style={{ color: "var(--c-text-4)" }}>{record.avgPace}/100m</div>}
      </div>
    </div>
  );
}
