import Link from "next/link";
import { getAllCategories, getPostsByCategory } from "@/lib/notion";

export const revalidate = 1800;
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
        <div className="eyebrow">Categories</div>
        <h1>分类</h1>
        <p className="mt-3" style={{ fontSize: "0.875rem", color: "var(--c-text-3)" }}>
          按分类浏览文章
        </p>
        <div className="rule" />
      </div>

      {categories.length === 0 ? (
        <p className="text-center py-24" style={{ color: "var(--c-text-3)" }}>暂无分类</p>
      ) : (
        <div className="stagger-children grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {catsWithCount.map(({ name, count }) => (
            <Link key={name} href={`/categories/${name}`} className="block">
              <div className="metric-card cursor-pointer text-left" style={{ textAlign: "left" }}>
                <div
                  className="font-serif mb-1"
                  style={{ fontWeight: 500, fontSize: "2rem", lineHeight: 1.1, color: "var(--c-brand)", fontVariantNumeric: "tabular-nums" }}
                >
                  {count}
                </div>
                <div
                  style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", fontWeight: 500, color: "var(--c-text-2)" }}
                >
                  {name}
                </div>
                <div
                  style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", fontWeight: 600, color: "var(--c-text-4)", letterSpacing: "0.4px", textTransform: "uppercase", marginTop: "4px" }}
                >
                  篇文章
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
