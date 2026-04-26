import Link from "next/link";
import { getPostsByTag, getAllTags } from "@/lib/notion";
import PostCard from "@/components/PostCard";
import type { Metadata } from "next";

export const revalidate = 10;

type PageProps = {
  params: Promise<{ tag: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `#${decoded} - 标签`,
    description: `浏览椒盐不谈博客带有「#${decoded}」标签的所有文章，发现更多相关内容。`,
    alternates: {
      canonical: `/tags/${tag}`,
    },
  };
}

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ tag }));
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const posts = await getPostsByTag(decoded);

  return (
    <div className="animate-fade-in-up">
      <header className="mb-12">
        <Link
          href="/tags"
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
          所有标签
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
          <span className="text-stone text-xs font-medium tracking-[0.15em] uppercase">
            Tag
          </span>
        </div>
        <h1 className="font-serif text-3xl font-[500] text-near-black mb-2">
          #{decoded}
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
        <p className="text-center text-olive py-24 font-serif">
          该标签下暂无文章
        </p>
      )}
    </div>
  );
}
