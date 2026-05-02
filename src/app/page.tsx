import { getPublishedPosts } from "@/lib/notion";
import PostCard from "@/components/PostCard";
import FeaturedPost from "@/components/FeaturedPost";
import Pagination from "@/components/Pagination";

export const revalidate = 10;

const POSTS_PER_PAGE = 10;

type PageProps = { searchParams: Promise<{ page?: string }> };

export default async function HomePage({ searchParams }: PageProps) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);

  const allPosts = await getPublishedPosts();
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));

  const startIndex = (safeCurrentPage - 1) * POSTS_PER_PAGE;
  const posts = allPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  const featured = safeCurrentPage === 1 && posts.length > 0 ? posts[0] : null;
  const restPosts = safeCurrentPage === 1 ? posts.slice(1) : posts;

  return (
    <div className="animate-fade-in-up">

      {/* ── Hero — kami eyebrow pattern ── */}
      <section className="kami-section-header">
        <div className="eyebrow">Personal Blog</div>
        <h1>椒盐不谈</h1>
        <p
          className="mt-4 max-w-md"
          style={{ color: "var(--c-text-3)", fontSize: "0.9375rem", lineHeight: 1.65 }}
        >
          想法、阅读与生活的记录。
          <br />
          <span style={{ color: "var(--c-text-4)", fontSize: "0.8125rem" }}>
            不定期更新，但每一篇都认真写。
          </span>
        </p>
        <div className="rule" />
      </section>

      {/* ── Featured ── */}
      {featured && (
        <section className="mb-10">
          <FeaturedPost post={featured} />
        </section>
      )}

      {/* ── Article Grid ── */}
      {restPosts.length > 0 && (
        <section className="stagger-children grid grid-cols-1 sm:grid-cols-2 gap-4">
          {restPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      )}

      {posts.length === 0 && (
        <div className="text-center py-24">
          <p className="font-serif mb-2" style={{ fontSize: "1.1rem", color: "var(--c-text-3)", fontWeight: 500 }}>
            尚无文章
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--c-text-4)" }}>
            在 Notion 数据库中创建并发布文章即可在这里看到
          </p>
        </div>
      )}

      <Pagination currentPage={safeCurrentPage} totalPages={totalPages} basePath="/" />

      {allPosts.length > 0 && (
        <p
          className="text-center mt-8"
          style={{ fontSize: "0.7rem", color: "var(--c-text-4)", letterSpacing: "0.5px", textTransform: "uppercase" }}
        >
          共 {allPosts.length} 篇文章
        </p>
      )}
    </div>
  );
}
