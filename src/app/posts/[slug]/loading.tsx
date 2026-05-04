import type { ReactNode } from "react";

export default function PostLoading(): ReactNode {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12" style={{ background: "var(--c-bg)" }}>
      {/* Back button skeleton */}
      <div className="mb-10">
        <div className="h-4 w-32 rounded animate-pulse" style={{ background: "var(--c-hover)" }} />
      </div>

      {/* Title skeleton */}
      <div className="mb-6 space-y-3">
        <div className="h-10 w-3/4 rounded animate-pulse" style={{ background: "var(--c-hover)" }} />
        <div className="h-10 w-1/2 rounded animate-pulse" style={{ background: "var(--c-hover)" }} />
      </div>

      {/* Meta skeleton */}
      <div className="flex gap-4 mb-10">
        <div className="h-6 w-24 rounded-full animate-pulse" style={{ background: "var(--c-hover)" }} />
        <div className="h-6 w-24 rounded-full animate-pulse" style={{ background: "var(--c-hover)" }} />
        <div className="h-6 w-32 rounded animate-pulse" style={{ background: "var(--c-hover)" }} />
      </div>

      {/* Cover image skeleton */}
      <div className="mb-10">
        <div className="w-full h-64 rounded-xl animate-pulse" style={{ background: "var(--c-hover)" }} />
      </div>

      {/* Content skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="h-4 rounded animate-pulse"
            style={{
              background: "var(--c-hover)",
              width: `${Math.random() * 40 + 60}%`,
            }}
          />
        ))}
        <div className="h-4 w-1/3 rounded animate-pulse" style={{ background: "var(--c-hover)" }} />
      </div>

      {/* TOC skeleton (desktop) */}
      <div className="hidden lg:block fixed left-8 top-32 w-48">
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-3 rounded animate-pulse"
              style={{
                background: "var(--c-hover)",
                width: `${Math.random() * 30 + 50}%`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
