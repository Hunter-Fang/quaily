"use client";

import { useState, useRef } from "react";

// ── 提示词模板 ──────────────────────────────────────────────────
const PROMPT_TEMPLATE = `你是我的运动记录助手。我会给你描述一次或多次运动经历，请你将其整理成以下 JSON 格式，直接输出 JSON 数组（不要 markdown 代码块，不要解释）。

## 字段说明

必填字段：
- 活动名称: string（如"泳池游泳"、"划船机稳态有氧"）
- 日期时间: string（ISO 格式，北京时间，如"2026-05-01T08:00:00+08:00"）
- 运动类型: string（只能选：游泳 / 划船机 / 跑步 / 骑行 / 爬楼梯 / 自由训练 / 羽毛球）
- 总时长: string（格式"HH:MM:SS"，如"00:45:30"）
- 消耗热量: number（kcal）

选填字段：
- 设备来源: string（"VIVO WATCH 5" 或 "手动录入"，默认"手动录入"）
- 运动状态: string（优秀 / 良好 / 一般）
- 总距离: number（米，游泳/跑步/骑行填写）
- 平均心率: number（bpm）
- 最高心率: number（bpm）
- 有氧训练效果: number（0-5，保留一位小数）
- 无氧训练效果: number（0-5，保留一位小数）
- 恢复时间: number（小时）
- 平均配速: string（如"3'02\\" / 100m"）
- 备注: string
- 总趟数: number（游泳专项）
- 平均SWOLF: number（游泳专项）
- 总划水次数: number（游泳专项）
- 平均划水率: number（SPM，游泳专项）
- 总桨次: number（划船机专项）
- 平均桨频: number（划船机专项）
- 最高桨频: number（划船机专项）

## 示例输出

[
  {
    "活动名称": "泳池游泳",
    "日期时间": "2026-05-01T08:30:00+08:00",
    "运动类型": "游泳",
    "总时长": "00:45:30",
    "消耗热量": 420,
    "设备来源": "VIVO WATCH 5",
    "运动状态": "良好",
    "总距离": 1500,
    "平均心率": 132,
    "最高心率": 158,
    "有氧训练效果": 2.6,
    "无氧训练效果": 0.4,
    "恢复时间": 18,
    "平均配速": "3'02\\" / 100m",
    "总趟数": 30,
    "平均SWOLF": 44,
    "总划水次数": 980,
    "平均划水率": 21
  }
]

---

现在请处理我的描述：`;

// ── 示例 JSON ────────────────────────────────────────────────────
const EXAMPLE_JSON = `[
  {
    "活动名称": "泳池游泳",
    "日期时间": "2026-05-01T08:30:00+08:00",
    "运动类型": "游泳",
    "总时长": "00:45:30",
    "消耗热量": 420,
    "设备来源": "VIVO WATCH 5",
    "运动状态": "良好",
    "总距离": 1500,
    "平均心率": 132,
    "最高心率": 158,
    "有氧训练效果": 2.6,
    "无氧训练效果": 0.4,
    "恢复时间": 18,
    "平均配速": "3'02\\" / 100m",
    "总趟数": 30,
    "平均SWOLF": 44,
    "总划水次数": 980,
    "平均划水率": 21,
    "备注": "状态不错，后半程稍掉速"
  }
]`;

type ResultItem = {
  index: number;
  name: string;
  status: "ok" | "error";
  id?: string;
  error?: string;
};

type UploadResult = {
  total: number;
  ok: number;
  fail: number;
  results: ResultItem[];
};

export default function SportUploadPage() {
  const [jsonText, setJsonText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [parseError, setParseError] = useState("");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── 复制提示词 ──
  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(PROMPT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── 验证 JSON ──
  const validateJson = (text: string): { ok: boolean; error?: string; count?: number } => {
    if (!text.trim()) return { ok: false, error: "内容为空" };
    try {
      const parsed = JSON.parse(text);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      return { ok: true, count: arr.length };
    } catch (e: unknown) {
      return { ok: false, error: `JSON 格式错误：${String(e).slice(0, 80)}` };
    }
  };

  const validation = jsonText ? validateJson(jsonText) : null;

  // ── 上传 ──
  const handleUpload = async () => {
    const v = validateJson(jsonText);
    if (!v.ok) {
      setParseError(v.error || "格式错误");
      return;
    }
    setParseError("");
    setUploading(true);
    setResult(null);

    try {
      const res = await fetch("/api/sport/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonText,
      });
      const data = await res.json() as UploadResult;
      setResult(data);
    } catch (e) {
      setParseError(`网络错误：${String(e)}`);
    } finally {
      setUploading(false);
    }
  };

  // ── 填入示例 ──
  const handleFillExample = () => {
    setJsonText(EXAMPLE_JSON);
    setResult(null);
    setParseError("");
    textareaRef.current?.focus();
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)", fontFamily: "var(--font-sans)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--c-brand)", display: "inline-block" }} />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--c-text-4)" }}>
              Sport Upload
            </span>
          </div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: "1.875rem", lineHeight: 1.2, color: "var(--c-text)", marginBottom: 10 }}>
            运动记录上传
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--c-text-3)", lineHeight: 1.6 }}>
            将运动数据以 JSON 格式上传到 Notion 数据库。支持单条或批量上传。
          </p>
          <div style={{ height: 1, background: "var(--c-border-2)", marginTop: 24 }} />
        </div>

        {/* Step 1 — 复制提示词 */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: "1.05rem", color: "var(--c-text)", borderLeft: "3px solid var(--c-brand)", paddingLeft: 12, marginBottom: 14 }}>
            第一步 · 让 AI 生成 JSON
          </h2>
          <p style={{ fontSize: "0.8125rem", color: "var(--c-text-3)", marginBottom: 16, lineHeight: 1.65 }}>
            复制下面的提示词，粘贴给 AI（ChatGPT、Claude 等），然后描述你的运动经历，AI 会输出符合格式的 JSON。
          </p>
          <button
            onClick={handleCopyPrompt}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 20px",
              borderRadius: 7,
              border: "1px solid var(--c-border)",
              background: copied ? "var(--c-brand)" : "var(--c-surface)",
              color: copied ? "var(--c-text-inv)" : "var(--c-brand)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.8375rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {copied ? (
              <>
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                已复制！
              </>
            ) : (
              <>
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                一键复制 AI 提示词
              </>
            )}
          </button>

          {/* 提示词预览 */}
          <details style={{ marginTop: 14 }}>
            <summary style={{ fontSize: "0.775rem", color: "var(--c-text-4)", cursor: "pointer", userSelect: "none" }}>
              查看提示词内容 ▾
            </summary>
            <pre style={{
              marginTop: 10,
              padding: "14px 16px",
              borderRadius: 8,
              background: "var(--c-surface)",
              border: "1px solid var(--c-border)",
              fontSize: "0.75rem",
              lineHeight: 1.6,
              color: "var(--c-text-3)",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>
              {PROMPT_TEMPLATE}
            </pre>
          </details>
        </section>

        {/* Step 2 — 粘贴 & 上传 */}
        <section style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: "1.05rem", color: "var(--c-text)", borderLeft: "3px solid var(--c-brand)", paddingLeft: 12 }}>
              第二步 · 粘贴 JSON 上传
            </h2>
            <button
              onClick={handleFillExample}
              style={{
                fontSize: "0.72rem", color: "var(--c-text-4)", cursor: "pointer",
                background: "none", border: "none", padding: "2px 4px",
                textDecoration: "underline", textUnderlineOffset: 3,
              }}
            >
              填入示例
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={jsonText}
            onChange={(e) => { setJsonText(e.target.value); setResult(null); setParseError(""); }}
            placeholder={`粘贴 AI 输出的 JSON 数组，例如：\n[\n  {\n    "活动名称": "泳池游泳",\n    "日期时间": "2026-05-01T08:30:00+08:00",\n    ...\n  }\n]`}
            style={{
              width: "100%",
              minHeight: 260,
              padding: "14px 16px",
              borderRadius: 8,
              border: `1.5px solid ${parseError ? "#b53333" : validation?.ok ? "var(--c-brand)" : "var(--c-border)"}`,
              background: "var(--c-surface)",
              color: "var(--c-text)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              lineHeight: 1.6,
              resize: "vertical",
              outline: "none",
              transition: "border-color 0.2s",
              boxSizing: "border-box",
            }}
            spellCheck={false}
          />

          {/* 状态提示 */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
            <div style={{ fontSize: "0.75rem" }}>
              {parseError && (
                <span style={{ color: "#b53333" }}>✗ {parseError}</span>
              )}
              {!parseError && validation?.ok && (
                <span style={{ color: "#2d6a4f" }}>✓ 格式正确，共 {validation.count} 条记录</span>
              )}
              {!parseError && validation && !validation.ok && (
                <span style={{ color: "#b53333" }}>✗ {validation.error}</span>
              )}
            </div>
            <span style={{ fontSize: "0.7rem", color: "var(--c-text-4)" }}>
              {jsonText.length > 0 ? `${jsonText.length} 字符` : ""}
            </span>
          </div>

          {/* 上传按钮 */}
          <button
            onClick={handleUpload}
            disabled={uploading || !jsonText.trim()}
            style={{
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              padding: "12px",
              borderRadius: 8,
              border: "none",
              background: uploading || !jsonText.trim() ? "var(--c-warm-sand)" : "var(--c-brand)",
              color: uploading || !jsonText.trim() ? "var(--c-text-4)" : "var(--c-text-inv)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: uploading || !jsonText.trim() ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {uploading ? (
              <>
                <svg style={{ animation: "spin 1s linear infinite" }} width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.7-5.3M20 15a9 9 0 01-14.7 5.3" />
                </svg>
                正在上传到 Notion…
              </>
            ) : (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                上传到 Notion
              </>
            )}
          </button>
        </section>

        {/* 上传结果 */}
        {result && (
          <section>
            <div style={{
              padding: "16px 20px",
              borderRadius: 8,
              background: result.fail === 0 ? "#f0fdf4" : result.ok === 0 ? "#fef2f2" : "#fffbeb",
              border: `1px solid ${result.fail === 0 ? "#bbf7d0" : result.ok === 0 ? "#fecaca" : "#fde68a"}`,
              marginBottom: 16,
            }}>
              <p style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: 4, color: result.fail === 0 ? "#166534" : result.ok === 0 ? "#991b1b" : "#92400e" }}>
                {result.fail === 0
                  ? `✓ 全部上传成功！共 ${result.ok} 条`
                  : result.ok === 0
                    ? `✗ 全部失败，共 ${result.fail} 条`
                    : `⚠ 部分成功：${result.ok} 成功 / ${result.fail} 失败`}
              </p>
              <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                共 {result.total} 条 · 成功 {result.ok} · 失败 {result.fail}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {result.results.map((r) => (
                <div key={r.index} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "12px 16px",
                  borderRadius: 8,
                  background: "var(--c-surface)",
                  border: `1px solid ${r.status === "ok" ? "var(--c-border)" : "#fecaca"}`,
                }}>
                  <span style={{ fontSize: "0.875rem", flexShrink: 0, marginTop: 1 }}>
                    {r.status === "ok" ? "✅" : "❌"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, fontSize: "0.8375rem", color: "var(--c-text)", marginBottom: 2 }}>
                      {r.name}
                    </p>
                    {r.status === "ok" && r.id && (
                      <p style={{ fontSize: "0.72rem", color: "var(--c-text-4)", fontFamily: "var(--font-mono)" }}>
                        ID: {r.id}
                      </p>
                    )}
                    {r.status === "error" && r.error && (
                      <p style={{ fontSize: "0.72rem", color: "#b53333" }}>
                        {r.error}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {result.ok > 0 && (
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <a
                  href="https://fanghongtao.notion.site/bd890c54c1314740851444e50004e5f5"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontSize: "0.8rem", color: "var(--c-brand)",
                    textDecoration: "underline", textUnderlineOffset: 3,
                  }}
                >
                  在 Notion 中查看 →
                </a>
              </div>
            )}
          </section>
        )}

        {/* 字段速查 */}
        <details style={{ marginTop: 48 }}>
          <summary style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--c-text-4)", cursor: "pointer", userSelect: "none", marginBottom: 8 }}>
            字段速查表 ▾
          </summary>
          <div style={{ marginTop: 12, overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: "0.775rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--c-brand)" }}>
                  <th style={{ textAlign: "left", padding: "8px 10px", fontFamily: "var(--font-serif)", fontWeight: 500, color: "var(--c-text-3)" }}>字段名</th>
                  <th style={{ textAlign: "left", padding: "8px 10px", fontFamily: "var(--font-serif)", fontWeight: 500, color: "var(--c-text-3)" }}>类型</th>
                  <th style={{ textAlign: "left", padding: "8px 10px", fontFamily: "var(--font-serif)", fontWeight: 500, color: "var(--c-text-3)" }}>说明</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["活动名称", "string ✱", "如: 泳池游泳"],
                  ["日期时间", "string ✱", "ISO 北京时间，如: 2026-05-01T08:00:00+08:00"],
                  ["运动类型", "string ✱", "游泳 / 划船机 / 跑步 / 骑行 / 爬楼梯 / 自由训练 / 羽毛球"],
                  ["总时长", "string ✱", "HH:MM:SS 格式，如: 00:45:30"],
                  ["消耗热量", "number ✱", "kcal"],
                  ["设备来源", "string", "VIVO WATCH 5 或 手动录入"],
                  ["运动状态", "string", "优秀 / 良好 / 一般"],
                  ["总距离", "number", "米（m）"],
                  ["平均心率", "number", "bpm"],
                  ["最高心率", "number", "bpm"],
                  ["有氧训练效果", "number", "0-5，如 2.6"],
                  ["无氧训练效果", "number", "0-5，如 0.4"],
                  ["恢复时间", "number", "小时"],
                  ["平均配速", "string", "如: 3'02\" / 100m"],
                  ["备注", "string", "自由文本"],
                  ["总趟数", "number", "游泳专项"],
                  ["平均SWOLF", "number", "游泳专项"],
                  ["总划水次数", "number", "游泳专项"],
                  ["平均划水率", "number", "SPM，游泳专项"],
                  ["总桨次", "number", "划船机专项"],
                  ["平均桨频", "number", "划船机专项"],
                  ["最高桨频", "number", "划船机专项"],
                ].map(([field, type, desc]) => (
                  <tr key={field} style={{ borderBottom: "1px solid var(--c-border)" }}>
                    <td style={{ padding: "7px 10px", fontFamily: "var(--font-mono)", color: "var(--c-brand)", fontWeight: 600 }}>{field}</td>
                    <td style={{ padding: "7px 10px", color: "var(--c-text-4)" }}>{type}</td>
                    <td style={{ padding: "7px 10px", color: "var(--c-text-3)" }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
