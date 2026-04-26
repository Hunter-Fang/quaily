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
    script.onload = () => { setTimeout(() => setBusuanziReady(true), 500); };
    document.head.appendChild(script);
    fetch("/api/stats", { method: "POST" })
      .then((res) => res.json())
      .then((data) => { setTodayPV(data.todayPV); setTodayUV(data.todayUV); })
      .catch(() => {});
    return () => { try { document.head.removeChild(script); } catch {} };
  }, []);

  const allReady = busuanziReady && todayPV !== null;

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 transition-opacity duration-500 ${allReady ? "opacity-100" : "opacity-0"}`}>
      <MetricCard label="今日访问量" value={todayPV !== null ? todayPV.toLocaleString() : "-"} unit="次" />
      <MetricCard label="今日访客数" value={todayUV !== null ? todayUV.toLocaleString() : "-"} unit="人" />
      <MetricCard label="站点总访问量" value={<span id="busuanzi_value_site_pv">-</span>} unit="次" />
      <MetricCard label="站点总访客数" value={<span id="busuanzi_value_site_uv">-</span>} unit="人" />
    </div>
  );
}

function MetricCard({ label, value, unit }: { label: string; value: React.ReactNode; unit: string }) {
  return (
    <div className="metric-card">
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label} · {unit}</div>
    </div>
  );
}
