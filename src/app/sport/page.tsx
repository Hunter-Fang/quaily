import { getSportStats, getSportRecords, ACTIVITY_EMOJI, DEVICE_LABELS } from "@/lib/sport";
import Link from "next/link";

export const revalidate = 30;

export const metadata = {
  title: "运动数据 | 椒盐不谈",
  description: "运动记录与数据分析 — 椒盐不谈博客",
};

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDistance(m: number): string {
  if (m >= 10000) return `+${(m / 1000).toFixed(1)}km`;
  if (m >= 1000) return `${(m / 1000).toFixed(1)}km`;
  return `${m}m`;
}

export default async function SportPage() {
  const stats = await getSportStats();
  const recent = stats?.recent ?? [];
  const hrRecords = stats?.hrRecords ?? [];

  if (!stats || stats.totalCount === 0) {
    return (
      <div className="kami-section-header text-center mt-10">
        <div className="eyebrow justify-center"><span />Fitness</div>
        <h1>运动数据</h1>
        <p className="mt-3" style={{ color: "var(--c-text-4)" }}>暂无运动记录</p>
        <div className="rule" />
      </div>
    );
  }

  const sortedTypes = Object.entries(stats.byType).sort((a, b) => b[1].timeMin - a[1].timeMin);
  const months = Object.entries(stats.byMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  const maxMonthCal = Math.max(...months.map(([, v]) => v.cal), 1);

  return (
    <div className="animate-fade-in-up">
      <div className="kami-section-header mb-6">
        <div className="eyebrow"><span />Fitness</div>
        <h1>运动数据</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--c-text-3)" }}>记录每一次心跳与呼吸</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        <MetricCard icon="🏃" label="总训练" value={`${stats.totalCount}`} sub="次" />
        <MetricCard icon="⏱" label="总时长" value={formatDuration(stats.totalTimeMinutes)} sub={null} />
        <MetricCard icon="🔥" label="消耗热量" value={`${stats.totalCalories}`} sub="kcal" />
        <MetricCard icon="📍" label="总距离" value={formatDistance(stats.totalDistanceM)} sub={null} />
      </div>

      {/* Recent Activity */}
      <section className="mb-14">
        <h3 className="section-title">最近活动</h3>
        <div className="space-y-3">{recent.map((r) => <ActivityRow key={r.id} record={r} />)}</div>
      </section>

      {/* Activity Type Distribution */}
      <section className="mb-14">
        <h3 className="section-title">运动类型分布</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {sortedTypes.map(([type, data]) => (
            <div key={type} className="metric-card hover:shadow-md transition-shadow cursor-default">
              <div className="text-xl mb-2">{ACTIVITY_EMOJI[type] || "🎯"}</div>
              <div className="text-sm font-medium mb-1 truncate" style={{ color: "var(--c-text)" }}>{type}</div>
              <div className="text-xs" style={{ color: "var(--c-text-4)" }}>
                {data.count} 次 · {formatDuration(data.timeMin)} · {data.cal} kcal
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 p-5 rounded-lg border" style={{ background: "var(--c-surface)", borderColor: "var(--c-border)" }}>
          <p className="text-xs mb-4 font-medium tracking-wide uppercase" style={{ color: "var(--c-text-4)" }}>各类型消耗热量占比</p>
          <div className="space-y-3">
            {sortedTypes.map(([type, data]) => {
              const pct = Math.max(2, (data.cal / stats.totalCalories) * 100);
              return (
                <div key={type} className="flex items-center gap-3">
                  <span className="w-16 text-xs truncate" style={{ color: "var(--c-text-3)" }}>{ACTIVITY_EMOJI[type] || "🎯"}{type}</span>
                  <div className="flex-1 h-6 rounded relative overflow-hidden" style={{ background: "var(--c-warm-sand)" }}>
                    <div className="h-full absolute left-0 top-0 rounded" style={{ width: `${Math.min(100, pct)}%`, background: "var(--c-brand)", opacity: 0.7 }} />
                  </div>
                  <span className="w-16 text-right text-xs font-mono tabular-nums" style={{ color: "var(--c-text-3)" }}>{data.cal}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Monthly Trend */}
      <section className="mb-14">
        <h3 className="section-title">月度趋势（近6月）</h3>
        <div className="p-5 rounded-lg border grid gap-4 sm:grid-cols-6" style={{ background: "var(--c-surface)", borderColor: "var(--c-border)" }}>
          {months.map(([month, data]) => (
            <div key={month} className="text-center">
              <div className="text-[11px] mb-2" style={{ color: "var(--c-text-4)" }}>{month.slice(5)}</div>
              <div className="font-serif text-lg font-[500]" style={{ color: "var(--c-brand)" }}>{data.count}</div>
              <div className="text-[10px]" style={{ color: "var(--c-text-4)" }}>{data.cal} kcal</div>
              <div className="w-full h-1 rounded mt-2" style={{ background: "var(--c-warm-sand)" }}>
                <div className="h-full rounded" style={{ width: `${Math.min(100, (data.cal / maxMonthCal) * 100)}%`, background: "var(--c-brand)", opacity: 0.25 }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HR Data */}
      {stats.hasHRData && hrRecords.length > 0 && (
        <section className="mb-14">
          <h3 className="section-title">心率数据</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "2px solid var(--c-brand)" }}>
                  <th className="py-3 px-3 text-left font-serif font-normal" style={{ color: "var(--c-text-3)" }}>类型</th>
                  <th className="py-3 px-3 text-right font-serif font-normal" style={{ color: "var(--c-text-3)" }}>平均心率</th>
                  <th className="py-3 px-3 text-right font-serif font-normal" style={{ color: var("--c-text-3") }}>最高心率</th>
                  <th className="py-3 px-3 text-center font-serif font-normal" style={{ color: var("--c-text-3") }}>有氧/无氧</th>
                  <th className="py-3 px-3 text-right font-serif font-normal" style={{ color: var("--c-text-3") }}>恢复(h)</th>
                </tr>
              </thead>
              <tbody>
                {hrRecords.map((r, i) => (
                  <tr key={r.id} className="border-b transition-colors hover:opacity-80" style={{ borderColor: "var(--c-border)" }}>
                    <td className="py-2.5 px-3">
                      <span className="mr-2">{ACTIVITY_EMOJI[r.type] || "🎯"}</span>
                      <span className="truncate block" style={{ color: "var(--c-text-2)" }}>
                        {r.name.length > 20 ? r.name.slice(0, 18) + "..." : r.name}
                      </span>
                      <span className="ml-2 text-[10px]" style={{ color: "var(--c-text-4)" }}>{DEVICE_LABELS[r.device] || ""}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-medium" style={{ color: "var(--c-brand)" }}>{r.avgHR}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-medium" style={{ color: "var(--c-text-2)" }}>{r.maxHR}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium mr-1" style={{ background: "var(--c-tag-bg)", color: "var(--c-brand)" }}>{r.aerobicEffect?.toFixed(1) || "-"}</span>
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium" style={{ background: "var(--c-tag-bg)", color: "var(--c-tag-border)" }}>{r.anaerobicEffect?.toFixed(1) || "-"}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums" style={{ color: "var(--c-text-2)" }}>{r.recoveryHours ?? "-"}</td>
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

/* ── Sub Components ── */

function MetricCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string | null }) {
  return (
    <div className="metric-card group">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}{sub ? ` · ${sub}` : ""}</div>
    </div>
  );
}

function ActivityRow({ record }: { record: any }) {
  return (
    <Link href={`/posts/${record.id}`} className="block post-card p-5 flex items-center gap-4 group hover:opacity-90 transition-opacity">
      <span className="text-xl w-8 h-8 flex items-center justify-center rounded-lg" style={{ background: "var(--c-tag-bg)" }}>
        {record.icon || ACTIVITY_EMOJI[record.type] || "🏃"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-sm truncate mb-0.5" style={{ color: "var(--c-text)" }}>{record.name}</div>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--c-text-4)" }}>
          <span>{ACTIVITY_EMOJI[record.type] || "🎯"}{record.type}</span>
          <span>{DEVICE_LABELS[record.device] || ""}</span>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="font-serif text-base font-[500]" style={{ color: "var(--c-brand)" }}>{record.duration}</div>
        <div className="text-[11px] text-right mt-0.5" style={{ color: "var(--c-text-4)" }}>{record.calories} kcal</div>
      </div>
    </Link>
  );
}
