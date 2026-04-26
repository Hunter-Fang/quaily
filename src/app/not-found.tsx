import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in-up">
      <div className="kami-section-header text-center">
        <div className="eyebrow justify-center"><span />Not Found</div>
        <h1 style={{ fontSize: "4rem", lineHeight: 1, opacity: 0.2 }}>404</h1>
      </div>
      <p className="font-serif text-xl mb-2" style={{ color: "var(--c-text)" }}>迷路了</p>
      <p className="text-sm mb-10" style={{ color: "var(--c-text-4)" }}>你寻找的页面不在这里，也许从未存在过。</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-85"
        style={{ background: "var(--c-brand)", color: "var(--c-text-inv)", boxShadow: "0 0 0 1px var(--c-brand)" }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        返回首页
      </Link>
    </div>
  );
}
