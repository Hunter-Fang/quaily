import Link from "next/link";
import { getPostsByTag, getAllTags } from "@/lib/notion";
import PostCard from "@/components/PostCard";
import type { Metadata } from "next";

export const revalidate = 10;
type PageProps = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return { title: `#${decoded} - 标签`, description: `浏览带有「#${decoded}」标签的所有文章`, alternates: { canonical: `/tags/${tag}` } };
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
      <Link href="/tags" className="inline-flex items-center gap-1.5 text-sm mb-6 hover:opacity-70 transition-opacity" style={{ color: "var(--c-text-4)" }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        所有标签
      </Link>
      <div className="kami-section-header">
        <div className="eyebrow"><span />Tag</div>
        <h1>#{decoded}</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--c-text-3)" }}>共 {posts.length} 篇文章</p>
        <div className="rule" />
      </div>

      <div className="stagger-children grid grid-cols-1 sm:grid-cols-2 gap-5">
        {posts.map((post) => <PostCard key={post.id} post={post} />)}
      </div>

      {posts.length === 0 && (
        <p className="text-center py-24 font-serif" style={{ color: "var(--c-text-3)" }}>该标签下暂无文章</p>
      )}
    </div>
  );
}
