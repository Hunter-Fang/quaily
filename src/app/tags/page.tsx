import Link from "next/link";
import { getAllTags, getPostsByTag } from "@/lib/notion";

export const revalidate = 10;
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
        <div className="eyebrow"><span />Tags</div>
        <h1>标签</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--c-text-3)" }}>按标签浏览文章</p>
        <div className="rule" />
      </div>

      {/* Tag cloud with size variation */}
      <div className="flex flex-wrap items-center gap-3 justify-center py-8">
        {tagsWithCount.map(({ name, count }) => {
          const scale = 0.8 + (count / maxCount) * 0.6;
          return (
            <Link key={name} href={`/tags/${name}`} style={{ fontSize: `${scale}rem` }}>
              <span className="tag-badge" style={{ padding: `${4 * scale}px ${10 * scale}px` }}>
                #{name}
                <span className="ml-1.5 opacity-40 text-[0.7em]">{count}</span>
              </span>
            </Link>
          );
        })}
      </div>

      {tags.length === 0 && (
        <p className="text-center py-24" style={{ color: "var(--c-text-3)" }}>暂无标签</p>
      )}
    </div>
  );
}
