import Link from "next/link";

interface PaginationProps { currentPage: number; totalPages: number; basePath: string; }

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;
  const getPageUrl = (page: number) => page === 1 ? basePath : `${basePath}?page=${page}`;
  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) pages.push(i);
    else if (pages[pages.length - 1] !== "...") pages.push("...");
  }

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-10" aria-label="分页导航">
      {currentPage > 1 ? (
        <Link href={getPageUrl(currentPage - 1)} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md hover:opacity-70 transition-opacity" style={{ color: "var(--c-text-3)" }}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          上一页
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm" style={{ color: "var(--c-ring)" }}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          上一页
        </span>
      )}

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`e-${i}`} className="px-2 text-sm" style={{ color: "var(--c-text-4)" }}>...</span>
        ) : (
          <Link key={page} href={getPageUrl(page)} className={`inline-flex items-center justify-center w-8 h-8 text-sm rounded-md transition-opacity ${page === currentPage ? "" : "hover:opacity-70"}`} style={page === currentPage ? { background: "var(--c-brand)", color: "var(--c-text-inv)", fontWeight: 500 } : { color: "var(--c-text-2)" }}>
            {page}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link href={getPageUrl(currentPage + 1)} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md hover:opacity-70 transition-opacity" style={{ color: "var(--c-text-3)" }}>
          下一页 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm" style={{ color: "var(--c-ring)" }}>
          下一页 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </span>
      )}
    </nav>
  );
}
