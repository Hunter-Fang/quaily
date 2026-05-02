import Link from "next/link";
import type { PostMeta } from "@/lib/notion";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const bj = new Date(d.getTime() + 8 * 60 * 60 * 1000);
  return `${bj.getUTCFullYear()}年${bj.getUTCMonth() + 1}月${bj.getUTCDate()}日`;
}

function estimateReadingTime(text: string): string {
  const minutes = Math.max(1, Math.ceil(text.length / 500));
  return `${minutes} 分钟`;
}

export default function FeaturedPost({ post }: { post: PostMeta }) {
  return (
    <Link href={`/posts/${post.slug}`} className="block group">
      <article className="featured-card p-8">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-5">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "2px 9px",
              borderRadius: "3px",
              background: "var(--c-brand)",
              color: "var(--c-text-inv)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "1.2px",
              textTransform: "uppercase",
            }}
          >
            最新
          </span>
          <time
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.3px",
              textTransform: "uppercase",
              color: "var(--c-text-4)",
            }}
          >
            {formatDate(post.date)}
          </time>
          {post.summary && (
            <span style={{ fontSize: "0.72rem", color: "var(--c-text-4)" }}>
              · {estimateReadingTime(post.summary)} 阅读
            </span>
          )}
        </div>

        {/* Title */}
        <h2
          className="font-serif mb-3 group-hover:opacity-80 transition-opacity"
          style={{ fontWeight: 500, fontSize: "1.5rem", lineHeight: 1.25, color: "var(--c-text)" }}
        >
          {post.icon && !post.icon.includes("fa-") && (
            <span className="mr-2" style={{ opacity: 0.45 }}>{post.icon}</span>
          )}
          {post.title}
        </h2>

        {/* Summary */}
        {post.summary && (
          <p
            className="line-clamp-2 mb-5"
            style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "var(--c-text-3)" }}
          >
            {post.summary}
          </p>
        )}

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {post.categories.map((cat) => (
              <span key={cat} className="category-pill" style={{ fontSize: "0.72rem" }}>
                {cat}
              </span>
            ))}
          </div>
          <span
            className="flex items-center gap-1.5 group-hover:gap-2.5 transition-all"
            style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", fontWeight: 500, color: "var(--c-brand)" }}
          >
            阅读全文
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </article>
    </Link>
  );
}
