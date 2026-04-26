import Link from "next/link";
import { getAllCategories, getPostsByCategory } from "@/lib/notion";

export const revalidate = 10;

export const metadata = {
  title: "分类",
  description: "按分类浏览椒盐不谈博客的所有文章，快速找到感兴趣的话题与内容。",
  alternates: {
    canonical: "/categories",
  },
};

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  const categoriesWithCount = await Promise.all(
    categories.map(async (cat) => {
      const posts = await getPostsByCategory(cat);
      return { name: cat, count: posts.length };
    })
  );

  categoriesWithCount.sort((a, b) => b.count - a.count);

  return (
    <div className="animate-fade-in-up">
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
          <span className="text-stone text-xs font-medium tracking-[0.15em] uppercase">
            Categories
          </span>
        </div>
        <h1 className="font-serif text-3xl font-[500] text-near-black mb-2">
          分类
        </h1>
        <p className="text-olive text-sm">按分类浏览文章</p>
        <div className="h-px bg-border-warm mt-6" />
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categoriesWithCount.map(({ name, count }) => (
          <Link key={name} href={`/categories/${name}`}>
            <div className="post-card group p-5 flex items-center justify-between">
              <span className="font-serif font-[500] text-near-black group-hover:text-brand transition-colors duration-200">
                {name}
              </span>
              <span className="text-xs text-stone bg-tag-08 px-2.5 py-1 rounded">
                {count} 篇
              </span>
            </div>
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="text-center text-olive py-24">
          暂无分类
        </p>
      )}
    </div>
  );
}
