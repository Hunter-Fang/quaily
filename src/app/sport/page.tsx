import { getSportStats, ACTIVITY_EMOJI, DEVICE_LABELS, STATUS_COLOR } from "@/lib/sport";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "运动数据 | 椒盐不谈",
  description: "运动记录与数据分析 — 椒盐不谈博客",
};

function fmtDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function fmtDistance(m: number): string {
  if (m >= 10000) return `${(m / 1000).toFixed(1)}km`;
  if (m >= 1000) return `${(m / 1000).toFixed(1)}km`;
  if (m > 0) return `${m}m`;
  return "—";
}

export default async function SportPage() {
  let stats = null;
  try {
    stats = await getSportStats();
  } catch (err) {
    console.error("Sport page error:", err);
  }

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
  const maxMonthCount = Math.max(...months.map(([, v]) => v.count), 1);
  const maxTypeCal = Math.max(...sortedTypes.map(([, v]) => v.cal), 1);

  return (
    <div className="animate-fade-in-up">
      {/* ── Header ── */}
      <div className="kami-section-header mb-8">
        <div className="eyebrow"><span />Fitness</div>
        <h1>运动数据</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--c-text-3)" }}>记录每一次心跳与呼吸</p>
      </div>

      {/* ── Key Metrics ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        <MetricCard icon="🏃" label="总训练" value={`${stats.totalCount}`} sub="次" />
        <MetricCard icon="⏱" label="总时长" value={fmtDuration(stats.totalTimeMinutes)} sub={null} />
        <MetricCard icon="🔥" label="消耗热量" value={`${Math.round(stats.totalCalories)}`} sub="kcal" />
        <MetricCard icon="📍" label="总距离" value={fmtDistance(stats.totalDistanceM)} sub={null} />
      </div>

      {/* ── Personal Bests ── */}
      <section className="mb-14">
        <h3 className="section-title">个人最佳</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BestCard
            emoji="⏱"
            title="最长训练"
            name={stats.longestWorkout.name}
            value={stats.longestWorkout.duration}
            detail={stats.longestWorkout.type}
          />
          <BestCard
            emoji="🔥"
            title="最高消耗"
            name={stats.highestCal.name}
            value={`${stats.highestCal.calories} kcal`}
            detail={stats.highestCal.type}
          />
          <BestCard
            emoji="📍"
            title="最远距离"
            name={stats.longestDist.name}
            value={fmtDistance(stats.longestDist.distanceM)}
            detail={stats.longestDist.type}
          />
        </div>
      </section>

      {/* ── Recent Activity ── */}
      <section className="mb-14">
        <h3 className="section-title">最近活动</h3>
        <div className="space-y-3">
          {stats.recent.map((r) => (
            <ActivityRow key={r.id} record={r} />
          ))}
        </div>
      </section>

      {/* ── Activity Type Distribution ── */}
      <section className="mb-14">
        <h3 className="section-title">运动类型分布</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {sortedTypes.map(([type, data]) => (
            <div key={type} className="metric-card hover:shadow-md transition-shadow cursor-default">
              <div className="text-xl mb-2">{ACTIVITY_EMOJI[type] || "🎯"}</div>
              <div className="text-sm font-medium mb-1 truncate" style={{ color: "var(--c-text)" }}>{type}</div>
              <div className="text-xs" style={{ color: "var(--c-text-4)" }}>
                {data.count} 次 · {fmtDuration(data.timeMin)} · {Math.round(data.cal)} kcal
              </div>
              {data.distM > 0 && (
                <div className="text-xs mt-1" style={{ color: "var(--c-text-4)" }}>
                  📍 {fmtDistance(data.distM)}
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Bar chart */}
        <div className="p-5 rounded-lg border" style={{ background: "var(--c-surface)", borderColor: "var(--c-border)" }}>
          <p className="text-xs mb-4 font-medium tracking-wide uppercase" style={{ color: "var(--c-text-4)" }}>各类型消耗热量占比</p>
          <div className="space-y-3">
            {sortedTypes.map(([type, data]) => {
              const pct = Math.max(2, (data.cal / maxTypeCal) * 100);
              return (
                <div key={type} className="flex items-center gap-3">
                  <span className="w-16 text-xs truncate" style={{ color: "var(--c-text-3)" }}>{ACTIVITY_EMOJI[type] || "🎯"}{type}</span>
                  <div className="flex-1 h-7 rounded relative overflow-hidden" style={{ background: "var(--c-warm-sand)" }}>
                    <div className="h-full absolute left-0 top-0 rounded flex items-center px-2 text-[10px] font-medium transition-all" style={{ width: `${Math.min(100, pct)}%`, background: "var(--c-brand)", opacity: 0.75, color: "var(--c-surface)" }}>
                      {pct > 20 ? `${Math.round(data.cal)} kcal` : ""}
                    </div>
                  </div>
                  <span className="w-14 text-right text-xs font-mono tabular-nums" style={{ color: "var(--c-text-3)" }}>{Math.round(data.cal)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Monthly Trend ── */}
      <section className="mb-14">
        <h3 className="section-title">月度趋势（近6月）</h3>
        <div className="p-5 rounded-lg border" style={{ background: "var(--c-surface)", borderColor: "var(--c-border)" }}>
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(months.length, 6)}, 1fr)` }}>
            {months.map(([month, data]) => {
              const calPct = Math.max(8, (data.cal / maxMonthCal) * 100);
              const countPct = Math.max(8, (data.count / maxMonthCount) * 100);
              return (
                <div key={month} className="text-center">
                  <div className="text-[11px] mb-1" style={{ color: "var(--c-text-4)" }}>{month.slice(5)}</div>
                  <div className="flex justify-center items-end gap-1 h-24 mb-2">
                    <div className="w-5 rounded-t transition-all" style={{ height: `${countPct}%`, background: "var(--c-brand)", opacity: 0.6 }} title={`${data.count} 次`} />
                    <div className="w-5 rounded-t transition-all" style={{ height: `${calPct}%`, background: "var(--c-brand)", opacity: 0.3 }} title={`${Math.round(data.cal)} kcal`} />
                  </div>
                  <div className="font-serif text-base font-[500]" style={{ color: "var(--c-brand)" }}>{data.count}</div>
                  <div className="text-[10px]" style={{ color: "var(--c-text-4)" }}>次</div>
                  <div className="text-[10px] mt-1" style={{ color: "var(--c-text-4)" }}>{Math.round(data.cal)} kcal</div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-[10px]" style={{ color: "var(--c-text-4)" }}>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: "var(--c-brand)", opacity: 0.6 }} /> 次数</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: "var(--c-brand)", opacity: 0.3 }} /> 热量</span>
          </div>
        </div>
      </section>

      {/* ── Swim Details ── */}
      {stats.swimRecords.length > 0 && (
        <section className="mb-14">
          <h3 className="section-title">🏊 游泳数据</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "2px solid var(--c-brand)" }}>
                  <th className="py-3 px-2 text-left font-serif font-normal" style={{ color: "var(--c-text-3)" }}>日期</th>
                  <th className="py-3 px-2 text-left font-serif font-normal" style={{ color: "var(--c-text-3)" }}>名称</th>
                  <th className="py-3 px-2 text-right font-serif font-normal" style={{ color: "var(--c-text-3)" }}>时长</th>
                  <th className="py-3 px-2 text-right font-serif font-normal" style={{ color: "var(--c-text-3)" }}>距离</th>
                  <th className="py-3 px-2 text-right font-serif font-normal" style={{ color: "var(--c-text-3)" }}>趟数</th>
                  <th className="py-3 px-2 text-right font-serif font-normal" style={{ color: "var(--c-text-3)" }}>SWOLF</th>
                  <th className="py-3 px-2 text-right font-serif font-normal" style={{ color: "var(--c-text-3)" }}>配速</th>
                  <th className="py-3 px-2 text-right font-serif font-normal" style={{ color: "var(--c-text-3)" }}>划水</th>
                </tr>
              </thead>
              <tbody>
                {stats.swimRecords.map((r) => (
                  <tr key={r.id} className="border-b transition-colors hover:opacity-80" style={{ borderColor: "var(--c-border)" }}>
                    <td className="py-2.5 px-2 font-mono text-xs" style={{ color: "var(--c-text-3)" }}>{r.date.slice(5)}</td>
                    <td className="py-2.5 px-2 text-sm" style={{ color: "var(--c-text)" }}>{r.name.length > 14 ? r.name.slice(0, 12) + "…" : r.name}</td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums text-xs" style={{ color: "var(--c-text-2)" }}>{r.duration}</td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums" style={{ color: "var(--c-brand)" }}>{fmtDistance(r.distanceM)}</td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums" style={{ color: "var(--c-text-2)" }}>{r.laps ?? "—"}</td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums" style={{ color: "var(--c-text-2)" }}>{r.swolf ?? "—"}</td>
                    <td className="py-2.5 px-2 text-right text-xs" style={{ color: "var(--c-text-3)" }}>{r.avgPace || "—"}</td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums text-xs" style={{ color: "var(--c-text-3)" }}>{r.totalStrokes ?? "—"}<span className="opacity-50">/ {r.strokeRate ?? "—"}spm</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Rowing Details ── */}
      {stats.rowingRecords.length > 0 && (
        <section className="mb-14">
          <h3 className="section-title">🚣 划船机数据</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "2px solid var(--c-brand)" }}>
                  <th className="py-3 px-2 text-left font-serif font-normal" style={{ color: "var(--c-text-3)" }}>日期</th>
                  <th className="py-3 px-2 text-left font-serif font-normal" style={{ color: "var(--c-text-3)" }}>名称</th>
                  <th className="py-3 px-2 text-right font-serif font-normal" style={{ color: "var(--c-text-3)" }}>时长</th>
                  <th className="py-3 px-2 text-right font-serif font-normal" style={{ color: "var(--c-text-3)" }}>热量</th>
                  <th className="py-3 px-2 text-right font-serif font-normal" style={{ color: "var(--c-text-3)" }}>总桨次</th>
                  <th className="py-3 px-2 text-right font-serif font-normal" style={{ color: "var(--c-text-3)" }}>平均桨频</th>
                  <th className="py-3 px-2 text-right font-serif font-normal" style={{ color: "var(--c-text-3)" }}>最高桨频</th>
                </tr>
              </thead>
              <tbody>
                {stats.rowingRecords.map((r) => (
                  <tr key={r.id} className="border-b transition-colors hover:opacity-80" style={{ borderColor: "var(--c-border)" }}>
                    <td className="py-2.5 px-2 font-mono text-xs" style={{ color: "var(--c-text-3)" }}>{r.date.slice(5)}</td>
                    <td className="py-2.5 px-2 text-sm" style={{ color: "var(--c-text)" }}>{r.name.length > 14 ? r.name.slice(0, 12) + "…" : r.name}</td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums text-xs" style={{ color: "var(--c-text-2)" }}>{r.duration}</td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums" style={{ color: "var(--c-brand)" }}>{r.calories} kcal</td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums" style={{ color: "var(--c-text-2)" }}>{r.totalStrokesRowing ?? "—"}</td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums" style={{ color: "var(--c-text-2)" }}>{r.avgStrokeRate ?? "—"}</td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums" style={{ color: "var(--c-text-2)" }}>{r.maxStrokeRate ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── HR Data ── */}
      {stats.hasHRData && stats.hrRecords.length > 0 && (
        <section className="mb-14">
          <h3 className="section-title">❤️ 心率数据</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "2px solid var(--c-brand)" }}>
                  <th className="py-3 px-2 text-left font-serif font-normal" style={{ color: "var(--c-text-3)" }}>日期</th>
                  <th className="py-3 px-2 text-left font-serif font-normal" style={{ color: "var(--c-text-3)" }}>类型</th>
                  <th className="py-3 px-2 text-right font-serif font-normal" style={{ color: "var(--c-text-3)" }}>平均</th>
                  <th className="py-3 px-2 text-right font-serif font-normal" style={{ color: "var(--c-text-3)" }}>最高</th>
                  <th className="py-3 px-2 text-center font-serif font-normal" style={{ color: "var(--c-text-3)" }}>有氧</th>
                  <th className="py-3 px-2 text-center font-serif font-normal" style={{ color: "var(--c-text-3)" }}>无氧</th>
                  <th className="py-3 px-2 text-right font-serif font-normal" style={{ color: "var(--c-text-3)" }}>恢复</th>
                  <th className="py-3 px-2 text-center font-serif font-normal" style={{ color: "var(--c-text-3)" }}>状态</th>
                </tr>
              </thead>
              <tbody>
                {stats.hrRecords.map((r) => (
                  <tr key={r.id} className="border-b transition-colors hover:opacity-80" style={{ borderColor: "var(--c-border)" }}>
                    <td className="py-2.5 px-2 font-mono text-xs" style={{ color: "var(--c-text-3)" }}>{r.date.slice(5)}</td>
                    <td className="py-2.5 px-2">
                      <span className="mr-1">{ACTIVITY_EMOJI[r.type] || "🎯"}</span>
                      <span className="text-sm" style={{ color: "var(--c-text-2)" }}>{r.type}</span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums font-medium" style={{ color: "var(--c-brand)" }}>{r.avgHR}</td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums font-medium" style={{ color: "var(--c-text-2)" }}>{r.maxHR}</td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium" style={{ background: "var(--c-tag-bg)", color: "var(--c-brand)" }}>{r.aerobicEffect?.toFixed(1) ?? "—"}</span>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium" style={{ background: "var(--c-tag-bg)", color: "var(--c-tag-border)" }}>{r.anaerobicEffect?.toFixed(1) ?? "—"}</span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums" style={{ color: "var(--c-text-2)" }}>{r.recoveryHours ?? "—"}h</td>
                    <td className="py-2.5 px-2 text-center">
                      {r.status && (
                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[r.status] || "var(--c-text-4)" }} title={r.status} />
                      )}
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

function ActivityRow({ record }: { record: any }) {
  return (
    <div className="post-card p-4 flex items-center gap-4 group hover:opacity-90 transition-opacity">
      <span className="text-xl w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0" style={{ background: "var(--c-tag-bg)" }}>
        {ACTIVITY_EMOJI[record.type] || "🏃"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-sm truncate mb-0.5" style={{ color: "var(--c-text)" }}>{record.name}</div>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--c-text-4)" }}>
          <span>{record.type}</span>
          <span>·</span>
          <span className="font-mono">{record.date.slice(5)}</span>
          <span>·</span>
          <span>{DEVICE_LABELS[record.device] || record.device}</span>
          {record.status && (
            <>
              <span>·</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLOR[record.status] || "var(--c-text-4)" }} />
              <span>{record.status}</span>
            </>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="font-serif text-base font-[500]" style={{ color: "var(--c-brand)" }}>{record.duration}</div>
        <div className="text-[11px] text-right mt-0.5" style={{ color: "var(--c-text-4)" }}>{record.calories} kcal</div>
        {record.distanceM > 0 && (
          <div className="text-[10px] text-right" style={{ color: "var(--c-text-4)" }}>{fmtDistance(record.distanceM)}</div>
        )}
      </div>
    </div>
  );
}
