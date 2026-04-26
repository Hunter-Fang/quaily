import Link from "next/link";
import type { PostMeta } from "@/lib/notion";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function estimateReadingTime(text: string): string {
  const chars = text.length;
  const minutes = Math.max(1, Math.ceil(chars / 500));
  return `${minutes} 分钟`;
}

export default function FeaturedPost({ post }: { post: PostMeta }) {
  return (
    <Link href={`/posts/${post.slug}`} className="block group">
      <article className="featured-card p-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold tracking-[0.1em] uppercase" style={{ background: "var(--c-brand)", color: "var(--c-text-inv)" }}>
            最新
          </span>
          <time className="text-xs" style={{ color: "var(--c-text-4)" }}>
            {formatDate(post.date)}
          </time>
          {post.summary && (
            <span className="text-xs" style={{ color: "var(--c-text-4)" }}>
              · {estimateReadingTime(post.summary)}
            </span>
          )}
        </div>

        <h2 className="font-serif text-2xl font-[500] leading-[1.2] mb-3 group-hover:opacity-80 transition-opacity" style={{ color: "var(--c-text)" }}>
          {post.icon && !post.icon.includes("fa-") && (
            <span className="mr-2 opacity-50">{post.icon}</span>
          )}
          {post.title}
        </h2>

        {post.summary && (
          <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: "var(--c-text-3)" }}>
            {post.summary}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {post.categories.map((cat) => (
              <span key={cat} className="category-pill !text-xs">{cat}</span>
            ))}
          </div>
          <span className="text-xs flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: "var(--c-brand)" }}>
            阅读全文
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </article>
    </Link>
  );
}
