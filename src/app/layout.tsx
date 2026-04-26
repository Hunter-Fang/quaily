import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import ScrollToTop from "@/components/ScrollToTop";
import ReadingProgress from "@/components/ReadingProgress";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import ImageLightbox from "@/components/ImageLightbox";
import MobileNav from "@/components/MobileNav";
import SiteCounter from "@/components/SiteCounter";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-sans",
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={inter.variable} suppressHydrationWarning>
      <head>
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

        {/* ── Navigation ── */}
        <header
          className="sticky top-0 z-50 backdrop-blur-xl border-b"
          style={{
            backgroundColor: "var(--c-header-bg)",
            borderColor: "var(--c-border)",
          }}
        >
          <nav className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="font-serif font-[500] text-lg tracking-wide hover:opacity-70 transition-opacity" style={{ color: "var(--c-text)" }}>
              椒盐不谈
            </Link>
            <div className="flex items-center gap-5">
              <div className="hidden sm:flex items-center gap-6">
                <Link href="/" className="nav-link text-sm font-medium" style={{ color: "var(--c-text-3)" }}>首页</Link>
                <Link href="/categories" className="nav-link text-sm font-medium" style={{ color: "var(--c-text-3)" }}>分类</Link>
                <Link href="/tags" className="nav-link text-sm font-medium" style={{ color: "var(--c-text-3)" }}>标签</Link>
                <Link href="/posts/about" className="nav-link text-sm font-medium" style={{ color: "var(--c-text-3)" }}>关于</Link>
              </div>
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

        {/* ── Footer ── */}
        <footer className="border-t" style={{ background: "var(--c-footer-bg)", borderColor: "var(--c-border)" }}>
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <p className="font-serif font-[500] tracking-wide mb-1" style={{ color: "var(--c-text)" }}>椒盐不谈</p>
                <p className="text-xs" style={{ color: "var(--c-text-4)" }}>想法、阅读与生活的记录</p>
              </div>
              <div className="flex items-center gap-5">
                <Link href="/categories" className="text-sm transition-colors hover:opacity-70" style={{ color: "var(--c-text-3)" }}>分类</Link>
                <Link href="/tags" className="text-sm transition-colors hover:opacity-70" style={{ color: "var(--c-text-3)" }}>标签</Link>
                <Link href="/posts/about" className="text-sm transition-colors hover:opacity-70" style={{ color: "var(--c-text-3)" }}>关于</Link>
                <Link href="/feed.xml" className="text-sm transition-colors hover:opacity-70" style={{ color: "var(--c-text-3)" }} title="RSS">RSS</Link>
              </div>
            </div>
            <div className="separator-ornament my-6" />
            <SiteCounter />
            <p className="text-center text-xs mt-6" style={{ color: "var(--c-text-4)" }}>
              © {new Date().getFullYear()} 椒盐不谈 · Powered by <a href="https://notion.so" target="_blank" rel="noopener noreferrer" className="hover:opacity-70">Notion</a> & <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="hover:opacity-70">Next.js</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
