"use client";

import { useEffect, useState } from "react";

export default function SiteCounter() {
  const [busuanziReady, setBusuanziReady] = useState(false);
  const [todayPV, setTodayPV] = useState<number | null>(null);
  const [todayUV, setTodayUV] = useState<number | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
    script.async = true;
    script.onload = () => {
      setTimeout(() => setBusuanziReady(true), 500);
    };
    document.head.appendChild(script);

    fetch("/api/stats", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        setTodayPV(data.todayPV);
        setTodayUV(data.todayUV);
      })
      .catch(() => {});

    return () => {
      try {
        document.head.removeChild(script);
      } catch {}
    };
  }, []);

  const todayReady = todayPV !== null;
  const allReady = busuanziReady && todayReady;

  return (
    <div
      className={`transition-opacity duration-500 ${
        allReady ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          }
          label="今日访问量"
          value={todayReady ? todayPV!.toLocaleString() : "-"}
          unit="次"
        />
        <StatCard
          icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          }
          label="今日访客数"
          value={todayReady ? todayUV!.toLocaleString() : "-"}
          unit="人"
        />
        <StatCard
          icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
            </svg>
          }
          label="站点总访问量"
          value={<span id="busuanzi_value_site_pv">-</span>}
          unit="次"
        />
        <StatCard
          icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          }
          label="站点总访客数"
          value={<span id="busuanzi_value_site_uv">-</span>}
          unit="人"
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  unit: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-3 px-3 rounded-lg bg-ivory border border-border-cream">
      <div className="flex items-center gap-1 text-stone">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-sm font-serif font-[500] text-brand tabular-nums">{value}</span>
        <span className="text-xs text-stone">{unit}</span>
      </div>
    </div>
  );
}
