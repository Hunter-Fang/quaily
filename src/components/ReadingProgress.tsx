"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const isPostPage = pathname.startsWith("/posts/");

  useEffect(() => {
    if (!isPostPage) return;
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) { setProgress(0); return; }
      setProgress(Math.min(100, (scrollTop / docHeight) * 100));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isPostPage, pathname]);

  if (!isPostPage) return null;
  return (
    <div className="h-[2px] w-full">
      <div className="reading-progress-bar" style={{ width: `${progress}%` }} />
    </div>
  );
}
