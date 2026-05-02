import Link from "next/link";
import { getAllTags, getPostsByTag } from "@/lib/notion";

export const revalidate = 1800;
export const metadata = {
  title: "标签",
  description: "按标签浏览椒盐不谈博客的所有文章",
  alternates: { canonical: "/tags" },
};

export default async function TagsPage() {
  const tags = await getAllTags();
  const tagsWithCount = await Promise.all(
    tags.map(async (tag) => {
      const posts = await getPostsByTag(tag);
      return { name: tag, count: posts.length };
    })
  );
  tagsWithCount.sort((a, b) => b.count - a.count);
  const maxCount = tagsWithCount[0]?.count || 1;

  return (
    <div className="animate-fade-in-up">
      <div className="kami-section-header">
        <div className="eyebrow">Tags</div>
        <h1>标签</h1>
        <p className="mt-3" style={{ fontSize: "0.875rem", color: "var(--c-text-3)" }}>
          {tagsWithCount.length} 个标签 · 按文章数量排列
        </p>
        <div className="rule" />
      </div>

      {tags.length === 0 ? (
        <p className="text-center py-24" style={{ color: "var(--c-text-3)" }}>暂无标签</p>
      ) : (
        <div className="flex flex-wrap items-center gap-3 py-6">
          {tagsWithCount.map(({ name, count }) => {
            // font scale: 0.78rem (min) → 1.15rem (max)
            const t = count / maxCount;
            const fontSize = 0.78 + t * 0.37;
            const px = Math.round(7 + t * 5);
            const py = Math.round(3 + t * 3);
            return (
              <Link key={name} href={`/tags/${name}`}>
                <span
                  className="tag-badge transition-all"
                  style={{
                    fontSize: `${fontSize}rem`,
                    padding: `${py}px ${px}px`,
                    borderWidth: count === maxCount ? "1.5px" : "1px",
                  }}
                >
                  #{name}
                  <span
                    className="ml-1.5"
                    style={{ fontSize: "0.7em", opacity: 0.45 }}
                  >
                    {count}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
