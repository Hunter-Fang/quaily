import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getPublishedPosts, getAdjacentPosts } from "@/lib/notion";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import BackButton from "@/components/BackButton";
import TableOfContents from "@/components/TableOfContents";
import type { Metadata } from "next";

export const revalidate = 10;
type PageProps = { params: Promise<{ slug: string }> };
const BASE_URL = "https://blog.focword.cn";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "文章未找到" };
  const description = post.summary || `${post.title} - 椒盐不谈`;
  const url = `${BASE_URL}/posts/${post.slug}`;
  return {
    title: post.title,
    description,
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: {
      title: post.title, description, url, siteName: "椒盐不谈",
      locale: "zh_CN", type: "article", publishedTime: post.date || undefined,
      authors: ["椒盐不谈"],
      ...(post.cover ? { images: [{ url: post.cover, width: 1200, height: 630, alt: post.title }] } : {}),
    },
    twitter: {
      card: post.cover ? "summary_large_image" : "summary",
      title: post.title, description,
      ...(post.cover ? { images: [post.cover] } : {}),
    },
  };
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}

function estimateReadingTime(markdown: string): string {
  const chars = markdown.length;
  const minutes = Math.max(1, Math.ceil(chars / 500));
  return `${minutes} 分钟`;
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const { prev, next } = await getAdjacentPosts(slug);

  const articleJsonLd = {
    "@context": "https://schema.org", "@type": "BlogPosting",
    headline: post.title, description: post.summary || post.title,
    author: { "@type": "Person", name: "椒盐不谈", url: `${BASE_URL}/posts/about` },
    publisher: { "@type": "Organization", name: "椒盐不谈", logo: { "@type": "ImageObject", url: `${BASE_URL}/favicon.ico` } },
    datePublished: post.date || undefined, url: `${BASE_URL}/posts/${post.slug}`,
    mainEntityOfPage: `${BASE_URL}/posts/${post.slug}`,
    ...(post.cover ? { image: post.cover } : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首页", item: BASE_URL },
      ...(post.categories.length > 0
        ? [
            { "@type": "ListItem", position: 2, name: post.categories[0], item: `${BASE_URL}/categories/${encodeURIComponent(post.categories[0])}` },
            { "@type": "ListItem", position: 3, name: post.title, item: `${BASE_URL}/posts/${post.slug}` },
          ]
        : [{ "@type": "ListItem", position: 2, name: post.title, item: `${BASE_URL}/posts/${post.slug}` }]),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <article className="animate-fade-in-up">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm" style={{ color: "var(--c-text-4)" }} aria-label="面包屑">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li><Link href="/" className="hover:opacity-70 transition-opacity" style={{ color: "var(--c-text-3)" }}>首页</Link></li>
            {post.categories.length > 0 && (
              <>
                <li style={{ color: "var(--c-ring)" }}>/</li>
                <li><Link href={`/categories/${encodeURIComponent(post.categories[0])}`} className="hover:opacity-70 transition-opacity" style={{ color: "var(--c-text-3)" }}>{post.categories[0]}</Link></li>
              </>
            )}
            <li style={{ color: "var(--c-ring)" }}>/</li>
            <li className="truncate max-w-[200px] sm:max-w-xs font-medium" style={{ color: "var(--c-text-2)" }}>{post.title}</li>
          </ol>
        </nav>

        <BackButton />

        {/* ── Article Header ── */}
        <header className="mb-10">
          <h1 className="font-serif text-3xl sm:text-[2.5rem] font-[500] leading-[1.12] mb-5" style={{ color: "var(--c-text)" }}>
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: "var(--c-text-4)" }}>
            {post.date && <time className="font-medium tracking-wide">{formatDate(post.date)}</time>}
            <span>·</span>
            <span>{estimateReadingTime(post.markdown)}</span>
            {post.categories.length > 0 && (
              <>
                <span>·</span>
                <div className="flex gap-1.5">
                  {post.categories.map((cat) => (
                    <Link key={cat} href={`/categories/${cat}`}><span className="category-pill">{cat}</span></Link>
                  ))}
                </div>
              </>
            )}
          </div>

          {post.summary && (
            <div className="summary-card mt-6 p-5 rounded-lg">
              <p className="text-sm leading-relaxed font-serif" style={{ color: "var(--c-text-3)" }}>{post.summary}</p>
            </div>
          )}

          <div className="h-px mt-8" style={{ background: "var(--c-border-2)" }} />
        </header>

        {/* ── Cover ── */}
        {post.cover && (
          <div className="mb-10 -mx-6 sm:mx-0">
            <img src={post.cover} alt={post.title} className="w-full rounded-xl" style={{ boxShadow: "0 4px 24px var(--c-shadow)" }} />
          </div>
        )}

        {/* ── Content + TOC ── */}
        <div className="flex gap-10">
          {/* Sidebar TOC (desktop) */}
          <aside className="hidden lg:block w-48 flex-shrink-0">
            <TableOfContents />
          </aside>

          {/* Article body */}
          <div className="flex-1 min-w-0">
            <MarkdownRenderer content={post.markdown} />

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-12 pt-5" style={{ borderTop: "1px solid var(--c-border)" }}>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link key={tag} href={`/tags/${tag}`}>
                      <span className="tag-badge text-sm px-3 py-1">#{tag}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Prev / Next ── */}
        {(prev || next) && (
          <nav className="mt-14 pt-8">
            <div className="h-px mb-8" style={{ background: "var(--c-border-2)" }} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prev ? (
                <Link href={`/posts/${prev.slug}`} className="group flex flex-col p-5 rounded-lg border hover:opacity-75 transition-opacity" style={{ borderColor: "var(--c-border)", background: "var(--c-surface)" }}>
                  <span className="text-[11px] mb-2 flex items-center gap-1" style={{ color: "var(--c-text-4)" }}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    上一篇
                  </span>
                  <span className="text-sm font-serif font-[500] line-clamp-1" style={{ color: "var(--c-text)" }}>{prev.title}</span>
                </Link>
              ) : <div />}
              {next ? (
                <Link href={`/posts/${next.slug}`} className="group flex flex-col items-end text-right p-5 rounded-lg border hover:opacity-75 transition-opacity" style={{ borderColor: "var(--c-border)", background: "var(--c-surface)" }}>
                  <span className="text-[11px] mb-2 flex items-center gap-1" style={{ color: "var(--c-text-4)" }}>
                    下一篇 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </span>
                  <span className="text-sm font-serif font-[500] line-clamp-1" style={{ color: "var(--c-text)" }}>{next.title}</span>
                </Link>
              ) : <div />}
            </div>
          </nav>
        )}
      </article>
    </>
  );
}
