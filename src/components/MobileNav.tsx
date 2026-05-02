"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/categories", label: "分类" },
  { href: "/tags", label: "标签" },
  { href: "/posts/about", label: "关于" },
  { href: "/sport", label: "运动" },
];

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
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-9 h-9 rounded-lg border transition-colors cursor-pointer"
        style={{
          borderColor: open ? "var(--c-brand)" : "var(--c-border)",
          background: "var(--c-surface)",
          color: open ? "var(--c-brand)" : "var(--c-text-3)",
        }}
        aria-label="菜单"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 right-0 border-b animate-fade-in backdrop-blur-xl"
          style={{ background: "var(--c-header-bg)", borderColor: "var(--c-border)" }}
        >
          <nav className="max-w-4xl mx-auto px-6 py-3 flex flex-col">
            {NAV_LINKS.map(({ href, label }, i) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 py-3 transition-colors"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: pathname === href ? "var(--c-brand)" : "var(--c-text-3)",
                  borderBottom: i < NAV_LINKS.length - 1 ? "1px solid var(--c-border)" : "none",
                }}
              >
                {pathname === href && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--c-brand)" }} />
                )}
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
