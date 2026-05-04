import type { ReactNode } from "react";

export default function Loading(): ReactNode {
  return (
    <div
      className="min-h-[60vh] flex items-center justify-center"
      style={{ background: "var(--c-bg)" }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Elegant spinner */}
        <div className="relative w-12 h-12">
          <div
            className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--c-brand)", borderTopColor: "transparent" }}
          />
          <div
            className="absolute inset-2 rounded-full border-2 border-b-transparent animate-spin"
            style={{
              borderColor: "var(--c-brand-light)",
              borderBottomColor: "transparent",
              animationDirection: "reverse",
              animationDuration: "1.5s",
            }}
          />
        </div>

        {/* Elegant text */}
        <p
          className="text-sm tracking-[0.2em] uppercase animate-pulse"
          style={{ color: "var(--c-text-4)" }}
        >
          正在加载
        </p>
      </div>
    </div>
  );
}
