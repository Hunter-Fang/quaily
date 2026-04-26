import type {
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

// Notion API 查询结果类型
interface NotionQueryResponse {
  results: (PageObjectResponse | { id: string })[];
  has_more: boolean;
  next_cursor: string | null;
}

const NOTION_TOKEN = process.env.NOTION_TOKEN!;
const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

// Revalidation interval in seconds — Notion changes will be reflected within this period
const REVALIDATE_SECONDS = 10;

// Use direct fetch for database queries to avoid SDK issues
async function queryDatabase(body: Record<string, unknown> = {}): Promise<NotionQueryResponse> {
  const res = await fetch(
    `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      next: { revalidate: REVALIDATE_SECONDS, tags: ["notion-posts"] },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Notion API error: ${res.status} ${err}`);
  }

  return res.json();
}

// ---------- Types ----------
export interface PostMeta {
  id: string;
  title: string;
  slug: string;
  date: string;
  status: string;
  type: string;
  categories: string[];
  tags: string[];
  summary: string;
  icon: string;
  cover: string | null;
}

export interface Post extends PostMeta {
  markdown: string;
}

// ---------- Helpers ----------
function extractPlainText(richText: RichTextItemResponse[]): string {
  return richText.map((t) => t.plain_text).join("");
}

function extractPageMeta(page: PageObjectResponse): PostMeta {
  const props = page.properties;

  const titleProp = props["title"];
  const title =
    titleProp?.type === "title" ? extractPlainText(titleProp.title) : "";

  const slugProp = props["slug"];
  const slug =
    slugProp?.type === "rich_text" ? extractPlainText(slugProp.rich_text) : "";

  const dateProp = props["date"];
  const date = dateProp?.type === "date" ? dateProp.date?.start ?? "" : "";

  const statusProp = props["status"];
  const status =
    statusProp?.type === "select" ? statusProp.select?.name ?? "" : "";

  const typeProp = props["type"];
  const type = typeProp?.type === "select" ? typeProp.select?.name ?? "" : "";

  const categoryProp = props["category"];
  const categories: string[] = [];
  if (categoryProp?.type === "select" && categoryProp.select) {
    categories.push(categoryProp.select.name);
  } else if (categoryProp?.type === "multi_select") {
    categoryProp.multi_select.forEach((c) => categories.push(c.name));
  }

  const tagsProp = props["tags"];
  const tags =
    tagsProp?.type === "multi_select"
      ? tagsProp.multi_select.map((t) => t.name)
      : [];

  const summaryProp = props["summary"];
  const summary =
    summaryProp?.type === "rich_text"
      ? extractPlainText(summaryProp.rich_text)
      : "";

  const iconProp = props["icon"];
  const icon =
    iconProp?.type === "rich_text"
      ? extractPlainText(iconProp.rich_text)
      : "";

  let cover: string | null = null;
  if (page.cover) {
    const rawUrl =
      page.cover.type === "external"
        ? page.cover.external.url
        : page.cover.type === "file"
          ? page.cover.file.url
          : null;
    // 过滤掉 Notion 自带的纯色/渐变默认封面
    if (rawUrl && !rawUrl.includes("notion.so/images/page-cover/")) {
      cover = rawUrl;
    }
  }

  return {
    id: page.id,
    title,
    slug: slug || page.id,
    date,
    status,
    type,
    categories,
    tags,
    summary,
    icon,
    cover,
  };
}

// ---------- Data fetching ----------

/** Get all published posts */
export async function getPublishedPosts(): Promise<PostMeta[]> {
  const response = await queryDatabase({
    filter: {
      and: [
        { property: "status", select: { equals: "Published" } },
        { property: "type", select: { equals: "Post" } },
      ],
    },
    sorts: [{ property: "date", direction: "descending" }],
  });

  return response.results
    .filter((p): p is PageObjectResponse => "properties" in p)
    .map(extractPageMeta);
}

/** Get all pages (type = Page) */
export async function getPages(): Promise<PostMeta[]> {
  const response = await queryDatabase({
    filter: {
      and: [
        { property: "status", select: { equals: "Published" } },
        { property: "type", select: { equals: "Page" } },
      ],
    },
  });

  return response.results
    .filter((p): p is PageObjectResponse => "properties" in p)
    .map(extractPageMeta);
}

/** Get menu items */
export async function getMenuItems(): Promise<PostMeta[]> {
  const response = await queryDatabase({
    filter: {
      property: "type",
      select: { equals: "Menu" },
    },
    sorts: [{ property: "date", direction: "ascending" }],
  });

  return response.results
    .filter((p): p is PageObjectResponse => "properties" in p)
    .map(extractPageMeta);
}

/** Get a single post by slug */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  // First try to find by slug property
  const response = await queryDatabase({
    filter: {
      property: "slug",
      rich_text: { equals: slug },
    },
  });

  let page = response.results[0];

  // If not found by slug, try by page ID
  if (!page) {
    try {
      const res = await fetch(
        `https://api.notion.com/v1/pages/${slug}`,
        {
          headers: {
            Authorization: `Bearer ${NOTION_TOKEN}`,
            "Notion-Version": "2022-06-28",
          },
          next: { revalidate: REVALIDATE_SECONDS, tags: ["notion-posts"] },
        }
      );
      if (res.ok) {
        page = await res.json();
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }

  if (!page || !("properties" in page)) return null;

  const meta = extractPageMeta(page as PageObjectResponse);

  // Get page blocks and convert to markdown
  const blocks = await getPageBlocks(page.id);
  const markdown = await blocksToMarkdown(blocks);

  return { ...meta, markdown };
}

// Fetch all blocks for a page
async function getPageBlocks(pageId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;

  do {
    const url = `https://api.notion.com/v1/blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
      },
      next: { revalidate: REVALIDATE_SECONDS, tags: ["notion-posts"] },
    });

    if (!res.ok) break;

    const data = await res.json();
    blocks.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return blocks;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NotionBlock = any;

// Convert Notion blocks to markdown
async function blocksToMarkdown(blocks: NotionBlock[]): Promise<string> {
  const parts: string[] = [];
  for (const block of blocks) {
    parts.push(await blockToMd(block));
  }
  return parts.join("\n\n");
}

function richTextToMd(richTexts: { plain_text: string; annotations: { bold: boolean; italic: boolean; strikethrough: boolean; code: boolean; underline: boolean }; href: string | null }[]): string {
  if (!richTexts || richTexts.length === 0) return "";
  return richTexts.map((rt) => {
    let text = rt.plain_text;
    if (rt.annotations.code) text = `\`${text}\``;
    if (rt.annotations.bold) text = `**${text}**`;
    if (rt.annotations.italic) text = `*${text}*`;
    if (rt.annotations.strikethrough) text = `~~${text}~~`;
    if (rt.href) text = `[${text}](${rt.href})`;
    return text;
  }).join("");
}

async function blockToMd(block: NotionBlock): Promise<string> {
  const type = block.type;

  switch (type) {
    case "paragraph":
      return richTextToMd(block.paragraph.rich_text);

    case "heading_1":
      return `## ${richTextToMd(block.heading_1.rich_text)}`;

    case "heading_2":
      return `### ${richTextToMd(block.heading_2.rich_text)}`;

    case "heading_3":
      return `#### ${richTextToMd(block.heading_3.rich_text)}`;

    case "bulleted_list_item":
      return `- ${richTextToMd(block.bulleted_list_item.rich_text)}`;

    case "numbered_list_item":
      return `1. ${richTextToMd(block.numbered_list_item.rich_text)}`;

    case "to_do": {
      const checked = block.to_do.checked ? "x" : " ";
      return `- [${checked}] ${richTextToMd(block.to_do.rich_text)}`;
    }

    case "toggle": {
      const summaryText = richTextToMd(block.toggle.rich_text);
      if (block.has_children) {
        const children = await getPageBlocks(block.id);
        const childrenMd: string[] = [];
        for (const child of children) {
          childrenMd.push(await blockToMd(child));
        }
        return `<details><summary>${summaryText}</summary>\n\n${childrenMd.join("\n\n")}\n\n</details>`;
      }
      return `<details><summary>${summaryText}</summary></details>`;
    }

    case "quote": {
      const lines = [`> ${richTextToMd(block.quote.rich_text)}`];
      if (block.has_children) {
        const children = await getPageBlocks(block.id);
        for (const child of children) {
          const childMd = await blockToMd(child);
          if (childMd) {
            lines.push(...childMd.split("\n").map((l: string) => `> ${l}`));
          }
        }
      }
      return lines.join("\n");
    }

    case "callout": {
      const icon = block.callout.icon?.emoji || "💡";
      const lines = [`> ${icon} ${richTextToMd(block.callout.rich_text)}`];
      if (block.has_children) {
        const children = await getPageBlocks(block.id);
        for (const child of children) {
          const childMd = await blockToMd(child);
          if (childMd) {
            lines.push(...childMd.split("\n").map((l: string) => `> ${l}`));
          }
        }
      }
      return lines.join("\n");
    }

    case "code": {
      const lang = block.code.language || "";
      const code = richTextToMd(block.code.rich_text);
      return `\`\`\`${lang}\n${code}\n\`\`\``;
    }

    case "image": {
      const url =
        block.image.type === "external"
          ? block.image.external.url
          : block.image.file?.url || "";
      const caption = block.image.caption
        ? richTextToMd(block.image.caption)
        : "";
      return `![${caption}](${url})`;
    }

    case "video": {
      const videoUrl =
        block.video.type === "external"
          ? block.video.external.url
          : block.video.file?.url || "";
      return `[Video](${videoUrl})`;
    }

    case "bookmark":
      return `[${block.bookmark.url}](${block.bookmark.url})`;

    case "link_preview":
      return `[${block.link_preview.url}](${block.link_preview.url})`;

    case "divider":
      return "---";

    case "table_of_contents":
      return "";

    case "embed":
      return `[Embed](${block.embed.url})`;

    case "equation":
      return `$$${block.equation.expression}$$`;

    default:
      return "";
  }
}

/** Get posts by category */
export async function getPostsByCategory(category: string): Promise<PostMeta[]> {
  const response = await queryDatabase({
    filter: {
      and: [
        { property: "status", select: { equals: "Published" } },
        { property: "type", select: { equals: "Post" } },
        { property: "category", select: { equals: category } },
      ],
    },
    sorts: [{ property: "date", direction: "descending" }],
  });

  return response.results
    .filter((p): p is PageObjectResponse => "properties" in p)
    .map(extractPageMeta);
}

/** Get posts by tag */
export async function getPostsByTag(tag: string): Promise<PostMeta[]> {
  const response = await queryDatabase({
    filter: {
      and: [
        { property: "status", select: { equals: "Published" } },
        { property: "type", select: { equals: "Post" } },
        { property: "tags", multi_select: { contains: tag } },
      ],
    },
    sorts: [{ property: "date", direction: "descending" }],
  });

  return response.results
    .filter((p): p is PageObjectResponse => "properties" in p)
    .map(extractPageMeta);
}

/** Get all unique categories */
export async function getAllCategories(): Promise<string[]> {
  const posts = await getPublishedPosts();
  const categorySet = new Set<string>();
  posts.forEach((p) => p.categories.forEach((c) => categorySet.add(c)));
  return Array.from(categorySet);
}

/** Get all unique tags */
export async function getAllTags(): Promise<string[]> {
  const posts = await getPublishedPosts();
  const tagSet = new Set<string>();
  posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet);
}

/** Get adjacent posts (prev/next) for a given slug */
export async function getAdjacentPosts(
  slug: string
): Promise<{ prev: PostMeta | null; next: PostMeta | null }> {
  const posts = await getPublishedPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) return { prev: null, next: null };
  // posts is sorted by date descending, so "next" is older (index+1), "prev" is newer (index-1)
  return {
    prev: index > 0 ? posts[index - 1] : null,
    next: index < posts.length - 1 ? posts[index + 1] : null,
  };
}
