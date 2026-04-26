"use client";

import ReactMarkdown from "react-markdown";

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="article-content">
      <ReactMarkdown
        components={{
          img: ({ src, alt, ...props }) => (
            <img src={src} alt={alt || ""} loading="lazy" className="my-6 rounded-xl max-w-full h-auto" {...props} />
          ),
          a: ({ href, children, ...props }) => (
            <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noopener noreferrer" : undefined} {...props}>
              {children}
            </a>
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isBlock = String(children).includes("\n");
            if (isBlock) {
              return (
                <pre className="my-6 p-5 rounded-lg overflow-x-auto text-sm border" style={{ background: "var(--c-code-bg)", color: "var(--c-code-text)", borderColor: "var(--c-code-border)" }}>
                  <code className={match ? `language-${match[1]}` : ""} {...props}>{children}</code>
                </pre>
              );
            }
            return <code className={className} {...props}>{children}</code>;
          },
          pre: ({ children }) => <>{children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
