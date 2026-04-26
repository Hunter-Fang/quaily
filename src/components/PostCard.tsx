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

export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="post-card group p-6">
      <Link href={`/posts/${post.slug}`} className="block">
        {/* Date & Categories */}
        <div className="flex items-center gap-2.5 mb-3">
          <time className="text-xs text-stone font-medium tracking-wide">
            {formatDate(post.date)}
          </time>
          {post.categories.length > 0 && (
            <>
              <span className="text-ring-warm">·</span>
              <div className="flex gap-1.5">
                {post.categories.map((cat) => (
                  <span key={cat} className="category-pill !text-xs !px-2 !py-0.5">
                    {cat}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Title */}
        <h2 className="font-serif text-lg font-[500] text-near-black group-hover:text-brand transition-colors duration-200 mb-2 leading-snug">
          {post.icon && (
            <span className="mr-2 opacity-50">{post.icon.includes("fa-") ? "📝" : post.icon}</span>
          )}
          {post.title}
        </h2>

        {/* Summary */}
        {post.summary && (
          <p className="text-olive text-sm leading-relaxed line-clamp-2 mb-3">
            {post.summary}
          </p>
        )}

        {/* Tags + Read more */}
        <div className="flex items-center justify-between mt-auto">
          {post.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span key={tag} className="tag-badge">
                  #{tag}
                </span>
              ))}
            </div>
          ) : (
            <div />
          )}
          <span className="text-xs text-stone group-hover:text-brand transition-colors duration-200 flex items-center gap-1">
            阅读
            <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </Link>
    </article>
  );
}
