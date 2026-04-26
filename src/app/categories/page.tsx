import Link from "next/link";
import { getAllCategories, getPostsByCategory } from "@/lib/notion";

export const revalidate = 10;
export const metadata = {
  title: "分类",
  description: "按分类浏览椒盐不谈博客的所有文章",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await getAllCategories();
  const catsWithCount = await Promise.all(
    categories.map(async (cat) => {
      const posts = await getPostsByCategory(cat);
      return { name: cat, count: posts.length };
    })
  );
  catsWithCount.sort((a, b) => b.count - a.count);

  return (
    <div className="animate-fade-in-up">
      <div className="kami-section-header">
        <div className="eyebrow"><span />Categories</div>
        <h1>分类</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--c-text-3)" }}>按分类浏览文章</p>
        <div className="rule" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {catsWithCount.map(({ name, count }) => (
          <Link key={name} href={`/categories/${name}`}>
            <div className="metric-card group cursor-pointer hover:shadow-md transition-shadow">
              <div className="metric-value">{count}</div>
              <div className="metric-label mt-1">{name}</div>
            </div>
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="text-center py-24" style={{ color: "var(--c-text-3)" }}>暂无分类</p>
      )}
    </div>
  );
}
