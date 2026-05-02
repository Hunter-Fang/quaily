import Link from "next/link";
import type { PostMeta } from "@/lib/notion";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const bj = new Date(d.getTime() + 8 * 60 * 60 * 1000);
  return `${bj.getUTCFullYear()}年${bj.getUTCMonth() + 1}月${bj.getUTCDate()}日`;
}

function estimateReadingTime(summary: string): string {
  const minutes = Math.max(1, Math.ceil(summary.length / 500));
  return `${minutes} 分钟`;
}

export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link href={`/posts/${post.slug}`} className="block group h-full">
      <article
        className="post-card p-6 h-full flex flex-col"
        style={{ minHeight: "160px" }}
      >
        {/* Meta row */}
        <div className="flex items-center gap-2 mb-3">
          <time
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.4px",
              textTransform: "uppercase",
              color: "var(--c-text-4)",
            }}
          >
            {formatDate(post.date)}
          </time>
          {post.summary && (
            <span style={{ fontSize: "0.7rem", color: "var(--c-ring)" }}>
              · {estimateReadingTime(post.summary)} 阅读
            </span>
          )}
        </div>

        {/* Title */}
        <h2
          className="font-serif mb-2.5 group-hover:opacity-75 transition-opacity"
          style={{ fontWeight: 500, fontSize: "0.9375rem", lineHeight: 1.4, color: "var(--c-text)" }}
        >
          {post.icon && !post.icon.includes("fa-") && (
            <span className="mr-1.5" style={{ opacity: 0.45 }}>{post.icon}</span>
          )}
          {post.title}
        </h2>

        {/* Summary */}
        {post.summary && (
          <p
            className="line-clamp-2 flex-1 mb-4"
            style={{ fontSize: "0.8125rem", lineHeight: 1.65, color: "var(--c-text-3)" }}
          >
            {post.summary}
          </p>
        )}

        {/* Tags / Categories */}
        <div className="flex items-center gap-1.5 flex-wrap mt-auto">
          {post.categories.map((cat) => (
            <span key={cat} className="category-pill" style={{ fontSize: "0.68rem", padding: "1px 8px" }}>
              {cat}
            </span>
          ))}
          {post.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="tag-badge" style={{ fontSize: "0.65rem" }}>
              #{tag}
            </span>
          ))}
        </div>
      </article>
    </Link>
  );
}
