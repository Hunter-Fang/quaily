import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageUrl = (p: number) => (p === 1 ? basePath : `${basePath}?page=${p}`);

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  const ChevronLeft = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
  const ChevronRight = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-12" aria-label="分页导航">
      {currentPage > 1 ? (
        <Link href={getPageUrl(currentPage - 1)} className="page-btn">
          <ChevronLeft />
        </Link>
      ) : (
        <span className="page-btn" style={{ opacity: 0.3, cursor: "not-allowed" }}>
          <ChevronLeft />
        </span>
      )}

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            style={{ padding: "0 4px", fontSize: "0.8rem", color: "var(--c-text-4)" }}
          >
            ···
          </span>
        ) : (
          <Link
            key={p}
            href={getPageUrl(p)}
            className={`page-btn${p === currentPage ? " active" : ""}`}
          >
            {p}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link href={getPageUrl(currentPage + 1)} className="page-btn">
          <ChevronRight />
        </Link>
      ) : (
        <span className="page-btn" style={{ opacity: 0.3, cursor: "not-allowed" }}>
          <ChevronRight />
        </span>
      )}
    </nav>
  );
}
