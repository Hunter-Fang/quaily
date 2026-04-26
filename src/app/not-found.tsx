import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in-up">
      <p className="text-8xl font-serif font-[500] text-ring-warm/40 mb-2">
        404
      </p>
      <h2 className="font-serif text-xl font-[500] text-near-black mb-2">
        迷路了
      </h2>
      <p className="text-stone text-sm mb-10">
        你寻找的页面不在这里，也许从未存在过。
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2 bg-brand text-ivory rounded-lg text-sm font-medium hover:bg-brand-light transition-colors duration-200"
        style={{ boxShadow: "0 0 0 1px var(--color-brand)" }}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        返回首页
      </Link>
    </div>
  );
}
