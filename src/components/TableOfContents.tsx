"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const article = document.querySelector(".article-content");
    if (!article) return;

    const els = article.querySelectorAll("h1, h2, h3");
    const items: TocItem[] = [];
    els.forEach((el, i) => {
      const id = `heading-${i}`;
      el.id = id;
      items.push({
        id,
        text: el.textContent || "",
        level: parseInt(el.tagName[1]),
      });
    });
    setHeadings(items);
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  // 少于 2 个标题不显示目录
  if (headings.length < 2) return null;

  return (
    <aside className="hidden lg:block w-48 flex-shrink-0">
      <nav className="toc-sidebar" aria-label="目录">
        <p className="text-xs font-medium tracking-[0.15em] uppercase mb-4" style={{ color: "var(--c-text-4)" }}>
          目录
        </p>
        <div className="flex flex-col gap-1">
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              className={activeId === h.id ? "active" : ""}
              style={{ paddingLeft: h.level > 2 ? "24px" : "12px" }}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {h.text}
            </a>
          ))}
        </div>
      </nav>
    </aside>
  );
}
