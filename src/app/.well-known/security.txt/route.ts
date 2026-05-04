import { NextRequest, NextResponse } from "next/server";

export const revalidate = 86400; // 24 hours

export async function GET(request: NextRequest) {
  const content = `# Security Policy for blog.focword.cn
Contact: mailto:security@focword.cn
Preferred-Languages: zh, en
Canonical: https://blog.focword.cn/.well-known/security.txt
Policy: https://blog.focword.cn/security-policy
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "s-maxage=86400",
    },
  });
}
