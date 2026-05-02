import Link from "next/link";
import { getPostsByCategory, getAllCategories } from "@/lib/notion";
import PostCard from "@/components/PostCard";
import type { Metadata } from "next";

export const revalidate = 1800;
type PageProps = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const decoded = decodeURIComponent(category);
  return { title: `${decoded} - 分类`, description: `浏览「${decoded}」分类下的所有文章`, alternates: { canonical: `/categories/${category}` } };
}

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((cat) => ({ category: cat }));
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const decoded = decodeURIComponent(category);
  const posts = await getPostsByCategory(decoded);

  return (
    <div className="animate-fade-in-up">
      <Link href="/categories" className="inline-flex items-center gap-1.5 text-sm mb-6 hover:opacity-70 transition-opacity" style={{ color: "var(--c-text-4)" }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        所有分类
      </Link>
      <div className="kami-section-header">
        <div className="eyebrow"><span />Category</div>
        <h1>{decoded}</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--c-text-3)" }}>共 {posts.length} 篇文章</p>
        <div className="rule" />
      </div>

      <div className="stagger-children grid grid-cols-1 sm:grid-cols-2 gap-5">
        {posts.map((post) => <PostCard key={post.id} post={post} />)}
      </div>

      {posts.length === 0 && (
        <p className="text-center py-24" style={{ color: "var(--c-text-3)" }}>该分类下暂无文章</p>
      )}
    </div>
  );
}
