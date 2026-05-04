import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/upload/",
          "*.json$",
        ],
      },
      // GPTBot
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/api/", "/upload/"],
      },
      // Googlebot
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/"],
      },
      // Bingbot
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/api/"],
      },
      // Baiduspider
      {
        userAgent: "Baiduspider",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: "https://blog.focword.cn/sitemap.xml",
    host: "https://blog.focword.cn",
  };
}
