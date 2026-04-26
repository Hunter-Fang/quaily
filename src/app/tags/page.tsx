import Link from "next/link";
import { getAllTags, getPostsByTag } from "@/lib/notion";

export const revalidate = 10;

export const metadata = {
  title: "标签",
  description: "按标签浏览椒盐不谈博客的所有文章，快速找到感兴趣的话题与内容。",
  alternates: {
    canonical: "/tags",
  },
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

  return (
    <div className="animate-fade-in-up">
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
          <span className="text-stone text-xs font-medium tracking-[0.15em] uppercase">
            Tags
          </span>
        </div>
        <h1 className="font-serif text-3xl font-[500] text-near-black mb-2">
          标签
        </h1>
        <p className="text-olive text-sm">按标签浏览文章</p>
        <div className="h-px bg-border-warm mt-6" />
      </header>

      <div className="flex flex-wrap gap-3">
        {tagsWithCount.map(({ name, count }) => (
          <Link key={name} href={`/tags/${name}`}>
            <span className="tag-badge text-sm px-4 py-2.5 hover:shadow-none">
              #{name}
              <span className="ml-2 text-xs opacity-40">{count}</span>
            </span>
          </Link>
        ))}
      </div>

      {tags.length === 0 && (
        <p className="text-center text-olive py-24">
          暂无标签
        </p>
      )}
    </div>
  );
}
