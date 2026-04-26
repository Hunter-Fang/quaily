import Link from "next/link";
import type { PostMeta } from "@/lib/notion";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}

function estimateReadingTime(summary: string): string {
  const minutes = Math.max(1, Math.ceil(summary.length / 500));
  return `${minutes} 分钟`;
}

export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link href={`/posts/${post.slug}`} className="block group">
      <article className="post-card p-6 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-2.5">
          <time className="text-[11px] font-medium tracking-wide" style={{ color: "var(--c-text-4)" }}>
            {formatDate(post.date)}
          </time>
          {post.summary && (
            <span className="text-[11px]" style={{ color: "var(--c-text-4)" }}>
              · {estimateReadingTime(post.summary)}
            </span>
          )}
        </div>

        <h2 className="font-serif font-[500] text-base leading-snug mb-2 group-hover:opacity-75 transition-opacity" style={{ color: "var(--c-text)" }}>
          {post.icon && !post.icon.includes("fa-") && <span className="mr-1.5 opacity-50">{post.icon}</span>}
          {post.title}
        </h2>

        {post.summary && (
          <p className="text-sm leading-relaxed line-clamp-2 mb-3 flex-1" style={{ color: "var(--c-text-3)" }}>
            {post.summary}
          </p>
        )}

        <div className="flex items-center gap-1.5 flex-wrap mt-auto">
          {post.categories.map((cat) => (
            <span key={cat} className="category-pill !text-[11px] !px-2 !py-0.5">{cat}</span>
          ))}
          {post.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="tag-badge !text-[10px]">#{tag}</span>
          ))}
        </div>
      </article>
    </Link>
  );
}
