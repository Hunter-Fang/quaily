"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-mobile-nav]")) setOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [open]);

  return (
    <div className="sm:hidden" data-mobile-nav>
      <button onClick={() => setOpen(!open)} className="p-2 transition-opacity hover:opacity-70 cursor-pointer" style={{ color: "var(--c-text-3)" }} aria-label="菜单">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 backdrop-blur-xl border-b animate-fade-in" style={{ background: "var(--c-header-bg)", borderColor: "var(--c-border)" }}>
          <nav className="max-w-4xl mx-auto px-6 py-4 flex flex-col gap-1">
            <Link href="/" className="text-sm font-medium py-2.5 hover:opacity-70 transition-opacity" style={{ color: "var(--c-text-3)" }}>首页</Link>
            <Link href="/categories" className="text-sm font-medium py-2.5 hover:opacity-70 transition-opacity" style={{ color: "var(--c-text-3)" }}>分类</Link>
            <Link href="/tags" className="text-sm font-medium py-2.5 hover:opacity-70 transition-opacity" style={{ color: "var(--c-text-3)" }}>标签</Link>
            <Link href="/posts/about" className="text-sm font-medium py-2.5 hover:opacity-70 transition-opacity" style={{ color: "var(--c-text-3)" }}>关于</Link>
            <Link href="/sport" className="text-sm font-medium py-2.5 hover:opacity-70 transition-opacity" style={{ color: "var(--c-text-3)" }}>运动</Link>
          </nav>
        </div>
      )}
    </div>
  );
}
