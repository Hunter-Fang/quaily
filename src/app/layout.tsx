import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import ScrollToTop from "@/components/ScrollToTop";
import ReadingProgress from "@/components/ReadingProgress";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import ImageLightbox from "@/components/ImageLightbox";
import MobileNav from "@/components/MobileNav";
import SiteCounter from "@/components/SiteCounter";
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
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  openGraph: {
    title: "椒盐不谈 | 关于想法、阅读与生活的个人博客",
    description:
      "一个关于想法、阅读与生活的个人博客，分享对工作、职场、阅读的思考与感悟。",
    url: "https://blog.focword.cn",
    siteName: "椒盐不谈",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "椒盐不谈",
    description:
      "一个关于想法、阅读与生活的个人博客，分享对工作、职场、阅读的思考与感悟。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className="bg-parchment text-near-black font-sans antialiased min-h-screen flex flex-col">
        <ScrollToTop />
        <ImageLightbox />
        <ScrollToTopButton />

        {/* Navigation */}
        <header
          className="sticky top-0 z-50 border-b border-border-cream/70 backdrop-blur-xl"
          style={{ backgroundColor: "rgba(245, 244, 237, 0.88)" }}
        >
          <nav className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="text-lg font-serif font-[500] text-near-black hover:text-brand transition-colors duration-200 tracking-wide"
            >
              椒盐不谈
            </Link>
            {/* Desktop nav */}
            <div className="hidden sm:flex items-center gap-7">
              <Link href="/" className="nav-link text-stone hover:text-near-black text-sm font-medium">
                首页
              </Link>
              <Link href="/categories" className="nav-link text-stone hover:text-near-black text-sm font-medium">
                分类
              </Link>
              <Link href="/tags" className="nav-link text-stone hover:text-near-black text-sm font-medium">
                标签
              </Link>
              <Link href="/posts/about" className="nav-link text-stone hover:text-near-black text-sm font-medium">
                关于
              </Link>
            </div>
            {/* Mobile hamburger */}
            <MobileNav />
          </nav>
          {/* Reading progress */}
          <ReadingProgress />
        </header>

        {/* Main content */}
        <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border-cream bg-warm-sand/30">
          <div className="max-w-3xl mx-auto px-6 py-10">
            {/* Top section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Brand */}
              <div className="text-center sm:text-left">
                <p className="text-near-black font-serif font-[500] tracking-wide mb-1">
                  椒盐不谈
                </p>
                <p className="text-stone text-xs">
                  想法、阅读与生活的记录
                </p>
              </div>

              {/* Links */}
              <div className="flex items-center gap-5">
                <Link
                  href="/categories"
                  className="text-stone hover:text-brand text-sm transition-colors duration-200"
                >
                  分类
                </Link>
                <Link
                  href="/tags"
                  className="text-stone hover:text-brand text-sm transition-colors duration-200"
                >
                  标签
                </Link>
                <Link
                  href="/posts/about"
                  className="text-stone hover:text-brand text-sm transition-colors duration-200"
                >
                  关于
                </Link>
                <Link
                  href="/feed.xml"
                  className="text-stone hover:text-brand text-sm transition-colors duration-200"
                  title="RSS 订阅"
                >
                  RSS
                </Link>
              </div>
            </div>

            {/* Separator */}
            <div className="separator-ornament my-6" />

            {/* Stats */}
            <SiteCounter />

            {/* Copyright */}
            <p className="text-center text-stone/60 text-xs mt-6">
              © {new Date().getFullYear()} 椒盐不谈 · Powered by{" "}
              <a
                href="https://notion.so"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand transition-colors"
              >
                Notion
              </a>{" "}
              &{" "}
              <a
                href="https://nextjs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand transition-colors"
              >
                Next.js
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
