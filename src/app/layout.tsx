import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "@fontsource/noto-serif-sc/400.css";
import "@fontsource/noto-serif-sc/500.css";
import ScrollToTop from "@/components/ScrollToTop";
import ReadingProgress from "@/components/ReadingProgress";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import ImageLightbox from "@/components/ImageLightbox";
import MobileNav from "@/components/MobileNav";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://blog.focword.cn"),
  title: {
    default: "椒盐不谈 | 关于想法、阅读与生活的个人博客",
    template: "%s - 椒盐不谈",
  },
  description:
    "椒盐不谈是一个关于想法、阅读与生活的个人博客，分享对工作、职场、阅读的思考与感悟，不定期更新原创文章。",
  icons: { icon: "/favicon.ico" },
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/feed.xml" },
  },
  openGraph: {
    title: "椒盐不谈 | 关于想法、阅读与生活的个人博客",
    description: "一个关于想法、阅读与生活的个人博客",
    url: "https://blog.focword.cn",
    siteName: "椒盐不谈",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "椒盐不谈",
    description: "一个关于想法、阅读与生活的个人博客",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
};

const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/categories", label: "分类" },
  { href: "/tags", label: "标签" },
  { href: "/posts/about", label: "关于" },
  { href: "/sport", label: "运动" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* 防主题闪烁 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <ScrollToTop />
        <ImageLightbox />
        <ScrollToTopButton />

        {/* ── Header ── */}
        <header
          className="sticky top-0 z-50 backdrop-blur-xl border-b"
          style={{ backgroundColor: "var(--c-header-bg)", borderColor: "var(--c-border)" }}
        >
          <nav className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="font-serif transition-opacity hover:opacity-70"
              style={{ fontWeight: 500, fontSize: "1.1rem", color: "var(--c-text)", letterSpacing: "0.01em" }}
            >
              椒盐不谈
            </Link>

            {/* Desktop nav */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-6">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link key={href} href={href} className="nav-link">
                    {label}
                  </Link>
                ))}
              </div>
              <div className="w-px h-4 hidden sm:block" style={{ background: "var(--c-border)" }} />
              <ThemeToggle />
              <MobileNav />
            </div>
          </nav>
          <ReadingProgress />
        </header>

        {/* ── Main ── */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-14">
          {children}
        </main>

        {/* ── Footer — deep-dark ── */}
        <footer className="site-footer">
          <div className="max-w-4xl mx-auto px-6 py-12">
            {/* Top row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
              <div>
                <p
                  className="font-serif mb-1"
                  style={{ fontWeight: 500, fontSize: "1rem", color: "var(--color-ivory)" }}
                >
                  椒盐不谈
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--color-stone)", lineHeight: 1.5 }}>
                  想法、阅读与生活的记录
                </p>
              </div>
              <nav className="flex items-center gap-5 flex-wrap">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link key={href} href={href} style={{ fontSize: "0.8125rem", color: "var(--color-warm-silver)" }} className="transition-colors hover:text-white">
                    {label}
                  </Link>
                ))}
                <Link
                  href="/feed.xml"
                  style={{ fontSize: "0.8125rem", color: "var(--color-warm-silver)" }}
                  className="transition-colors hover:text-white"
                  title="RSS Feed"
                >
                  RSS
                </Link>
              </nav>
            </div>

            {/* Divider */}
            <div className="mt-8 mb-6" style={{ height: "1px", background: "rgba(255,255,255,0.08)" }} />

            {/* Copyright */}
            <p style={{ fontSize: "0.72rem", color: "var(--color-stone)", textAlign: "center" }}>
              © {new Date().getFullYear()} 椒盐不谈 · Powered by{" "}
              <a href="https://notion.so" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Notion</a>
              {" "}& {" "}
              <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Next.js</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
