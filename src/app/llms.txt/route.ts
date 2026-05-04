import { getPublishedPosts, getAllCategories, getAllTags } from "@/lib/notion";

const SITE_URL = "https://blog.focword.cn";
const SITE_TITLE = "椒盐不谈";
const SITE_DESCRIPTION = "关于想法、阅读与生活的个人博客，分享原创思考与感悟。";

export const revalidate = 86400; // 24 hours

export async function GET() {
  const posts = await getPublishedPosts();
  const categories = await getAllCategories();
  const tags = await getAllTags();

  const lines: string[] = [];

  // Header
  lines.push(`# ${SITE_TITLE}`);
  lines.push("");
  lines.push(SITE_DESCRIPTION);
  lines.push("");
  lines.push(`> Last updated: ${new Date().toISOString().split("T")[0]}`);
  lines.push("");

  // Site structure
  lines.push("## Site Structure");
  lines.push("");
  lines.push(`- [Home](${SITE_URL}): Latest blog posts`);
  lines.push(`- [Archive](${SITE_URL}/archive): All posts list`);
  lines.push(`- [Categories](${SITE_URL}/categories): Posts by category`);
  lines.push(`- [Tags](${SITE_URL}/tags): Posts by tag`);
  lines.push(`- [Sport](${SITE_URL}/sport): Sport activity records`);
  lines.push("");

  // Categories
  if (categories.length > 0) {
    lines.push("## Categories");
    lines.push("");
    categories.forEach((cat: string) => {
      lines.push(`- [${cat}](${SITE_URL}/categories/${encodeURIComponent(cat)})`);
    });
    lines.push("");
  }

  // Tags (top 20)
  if (tags.length > 0) {
    lines.push("## Tags");
    lines.push("");
    tags.slice(0, 20).forEach((tag: string) => {
      lines.push(`- [${tag}](${SITE_URL}/tags/${encodeURIComponent(tag)})`);
    });
    if (tags.length > 20) {
      lines.push("");
      lines.push(`... and ${tags.length - 20} more tags`);
    }
    lines.push("");
  }

  // Recent posts (last 30)
  lines.push("## Recent Posts");
  lines.push("");
  posts.slice(0, 30).forEach((post: any) => {
    const date = post.date || post.createdTime || "";
    const title = post.title || "Untitled";
    const slug = post.slug || post.id;
    lines.push(`- [${title}](${SITE_URL}/posts/${slug}) — ${date}`);
  });
  lines.push("");

  // Markdown content hints
  lines.push("## Content Guidelines");
  lines.push("");
  lines.push("This site provides content in the following formats:");
  lines.push(`- HTML: ${SITE_URL}/posts/[slug]`);
  lines.push(`- RSS/Atom Feed: ${SITE_URL}/feed.xml`);
  lines.push(`- Sitemap: ${SITE_URL}/sitemap.xml`);
  lines.push("");

  const content = lines.join("\n");

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "s-maxage=86400, stale-while-revalidate=3600",
    },
  });
}
