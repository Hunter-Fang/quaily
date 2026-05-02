import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-28 animate-fade-in-up">
      {/* Big 404 */}
      <p
        className="font-serif select-none mb-0"
        style={{
          fontWeight: 500,
          fontSize: "7rem",
          lineHeight: 1,
          color: "var(--c-brand)",
          opacity: 0.12,
          letterSpacing: "-2px",
        }}
      >
        404
      </p>

      {/* Eyebrow */}
      <div
        className="flex items-center gap-2 mb-4"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.7rem",
          fontWeight: 600,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: "var(--c-text-4)",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--c-brand)" }} />
        Not Found
      </div>

      <h1
        className="font-serif mb-3 text-center"
        style={{ fontWeight: 500, fontSize: "1.75rem", lineHeight: 1.2, color: "var(--c-text)" }}
      >
        迷路了
      </h1>
      <p
        className="mb-10 text-center max-w-xs"
        style={{ fontSize: "0.875rem", lineHeight: 1.65, color: "var(--c-text-4)" }}
      >
        你寻找的页面不在这里，也许从未存在过。
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 transition-opacity hover:opacity-85"
        style={{
          padding: "10px 22px",
          borderRadius: "7px",
          background: "var(--c-brand)",
          color: "var(--c-text-inv)",
          fontFamily: "var(--font-sans)",
          fontSize: "0.8375rem",
          fontWeight: 500,
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        返回首页
      </Link>
    </div>
  );
}
