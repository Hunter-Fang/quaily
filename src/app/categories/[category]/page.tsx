import Link from "next/link";
import { getPostsByCategory, getAllCategories } from "@/lib/notion";
import PostCard from "@/components/PostCard";
import type { Metadata } from "next";

export const revalidate = 10;

type PageProps = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const decoded = decodeURIComponent(category);
  return {
    title: `${decoded} - 分类`,
    description: `浏览椒盐不谈博客「${decoded}」分类下的所有文章，阅读关于${decoded}的思考与分享。`,
    alternates: {
      canonical: `/categories/${category}`,
    },
  };
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
      <header className="mb-12">
        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 text-stone hover:text-brand text-sm mb-6 transition-colors duration-200 group"
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          所有分类
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
          <span className="text-stone text-xs font-medium tracking-[0.15em] uppercase">
            Category
          </span>
        </div>
        <h1 className="font-serif text-3xl font-[500] text-near-black mb-2">
          {decoded}
        </h1>
        <p className="text-olive text-sm">共 {posts.length} 篇文章</p>
        <div className="h-px bg-border-warm mt-6" />
      </header>

      <div className="stagger-children space-y-5">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-center text-olive py-24">
          该分类下暂无文章
        </p>
      )}
    </div>
  );
}
