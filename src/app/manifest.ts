import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "椒盐不谈",
    short_name: "椒盐不谈",
    description: "关于想法、阅读与生活的个人博客",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F0EB",
    theme_color: "#1B365D",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    categories: ["blog", "personal", "technology"],
    lang: "zh-CN",
  };
}
