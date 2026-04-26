import { getPublishedPosts } from "@/lib/notion";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";

export const revalidate = 10;

const POSTS_PER_PAGE = 10;

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);

  const allPosts = await getPublishedPosts();
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));

  const startIndex = (safeCurrentPage - 1) * POSTS_PER_PAGE;
  const posts = allPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  return (
    <div className="animate-fade-in-up">
      {/* Hero section — kami editorial header */}
      <section className="mb-14">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
          <span className="text-stone text-xs font-medium tracking-[0.15em] uppercase">
            Personal Blog
          </span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-[500] text-near-black leading-[1.1] mb-4">
          椒盐不谈
        </h1>
        <p className="text-olive text-base leading-relaxed max-w-md">
          想法、阅读与生活的记录。
          <br />
          <span className="text-stone text-sm">不定期更新，但每一篇都认真写。</span>
        </p>
        <div className="h-px bg-border-warm mt-8" />
      </section>

      {/* Post list */}
      <section className="stagger-children space-y-5">
        {posts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-olive text-lg mb-2 font-serif font-[500]">
              尚无文章
            </p>
            <p className="text-stone text-sm">
              在 Notion 数据库中创建并发布文章即可在这里看到
            </p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </section>

      {/* Pagination */}
      <Pagination
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        basePath="/"
      />

      {/* Post count */}
      {allPosts.length > 0 && (
        <p className="text-center text-stone/50 text-xs mt-8 tracking-wide">
          共 {allPosts.length} 篇文章
        </p>
      )}
    </div>
  );
}
