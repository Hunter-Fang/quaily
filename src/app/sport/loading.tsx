import type { ReactNode } from "react";

export default function SportLoading(): ReactNode {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12" style={{ background: "var(--c-bg)" }}>
      {/* Page title skeleton */}
      <div className="mb-10">
        <div className="h-10 w-48 rounded animate-pulse mb-3" style={{ background: "var(--c-hover)" }} />
        <div className="h-5 w-72 rounded animate-pulse" style={{ background: "var(--c-hover)" }} />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl p-5 animate-pulse"
            style={{ background: "var(--c-card)" }}
          >
            <div className="h-3 w-16 rounded mb-3" style={{ background: "var(--c-hover)" }} />
            <div className="h-8 w-12 rounded" style={{ background: "var(--c-hover)" }} />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="mb-12">
        <div className="rounded-2xl p-6 animate-pulse" style={{ background: "var(--c-card)" }}>
          <div className="h-4 w-32 rounded mb-6" style={{ background: "var(--c-hover)" }} />
          <div className="h-64 rounded" style={{ background: "var(--c-hover)" }} />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--c-card)" }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 border-b animate-pulse"
            style={{ borderColor: "var(--c-border)" }}
          >
            <div className="h-4 w-1/4 rounded" style={{ background: "var(--c-hover)" }} />
            <div className="h-4 w-1/6 rounded" style={{ background: "var(--c-hover)" }} />
            <div className="h-4 w-1/6 rounded" style={{ background: "var(--c-hover)" }} />
            <div className="h-4 w-1/6 rounded" style={{ background: "var(--c-hover)" }} />
            <div className="h-4 w-1/6 rounded" style={{ background: "var(--c-hover)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
