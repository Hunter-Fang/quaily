"use client";

import { useState, useRef } from "react";

// 注意：平均配速每100m 的值里含单引号 3'19，不含任何反斜杠，AI 直接输出即可
const PROMPT_TEMPLATE = `你是我的运动数据识别助手。我会发给你一张或多张运动记录截图，请识别图中数据，整理成 JSON 数组，直接输出 JSON，不要 markdown 代码块，不要任何解释。每张截图一条记录。

字段列表（严格按字段名，有数据填，没有不输出）：

必填：
- 活动名称: string（如"泳池游泳 晨练"）
- 日期时间: string（ISO 北京时间，如"2026-05-02T08:00:00.000+08:00"）
- 运动类型: string（只能选：游泳 / 划船机 / 跑步 / 骑行 / 爬楼梯 / 自由训练 / 羽毛球）
- 总时长: string（HH:MM:SS，如"01:31:46"）
- 消耗热量(kcal): number

选填：
- 运动状态: string（优秀 / 良好 / 一般）
- 总距离(m): number（米，km 转换为 m）
- 平均心率(bpm): number
- 最高心率(bpm): number
- 有氧训练效果: number（0-5，如 3.2）
- 无氧训练效果: number（0-5，如 0.5）
- 恢复时间(小时): number
- 平均配速每100m: string（只写数字和符号，如"3'19"，注意单引号不是双引号，不要加任何转义符）
- 备注: string

规则：没有的字段不输出；时长严格 HH:MM:SS；日期时间必须带+08:00。

示例输出：
[
  {
    "活动名称": "泳池游泳 晨练",
    "日期时间": "2026-05-02T08:00:00.000+08:00",
    "运动类型": "游泳",
    "运动状态": "优秀",
    "总时长": "01:31:46",
    "总距离(m)": 2000,
    "消耗热量(kcal)": 450,
    "平均心率(bpm)": 138,
    "最高心率(bpm)": 162,
    "恢复时间(小时)": 24,
    "有氧训练效果": 3.2,
    "无氧训练效果": 0.5,
    "平均配速每100m": "3'19"
  }
]

请识别我发给你的运动截图：`;

const EXAMPLE_JSON = `[
  {
    "活动名称": "泳池游泳 晨练",
    "日期时间": "2026-05-02T08:00:00.000+08:00",
    "运动类型": "游泳",
    "运动状态": "优秀",
    "总时长": "01:31:46",
    "总距离(m)": 2000,
    "消耗热量(kcal)": 450,
    "平均心率(bpm)": 138,
    "最高心率(bpm)": 162,
    "恢复时间(小时)": 24,
    "有氧训练效果": 3.2,
    "无氧训练效果": 0.5,
    "平均配速每100m": "3'19"
  }
]`;

const REQUIRED = ["活动名称", "日期时间", "运动类型", "总时长", "消耗热量(kcal)"];

const FIELDS = [
  ["活动名称",        "string ✱", "如: 泳池游泳 晨练"],
  ["日期时间",        "string ✱", "ISO 北京时间，如: 2026-05-02T08:00:00.000+08:00"],
  ["运动类型",        "string ✱", "游泳 / 划船机 / 跑步 / 骑行 / 爬楼梯 / 自由训练 / 羽毛球"],
  ["总时长",          "string ✱", "HH:MM:SS，如: 01:31:46"],
  ["消耗热量(kcal)",  "number ✱", "千卡"],
  ["运动状态",        "string",   "优秀 / 良好 / 一般"],
  ["总距离(m)",       "number",   "米"],
  ["平均心率(bpm)",   "number",   "bpm"],
  ["最高心率(bpm)",   "number",   "bpm"],
  ["有氧训练效果",    "number",   "0-5，如 3.2"],
  ["无氧训练效果",    "number",   "0-5，如 0.5"],
  ["恢复时间(小时)",  "number",   "小时"],
  ["平均配速每100m",  "string",   "如: 3'19（单引号，无转义）"],
  ["备注",            "string",   "自由文本"],
];

type ResultItem = { index: number; name: string; status: "ok" | "error"; id?: string; error?: string };
type UploadResult = { total: number; ok: number; fail: number; results: ResultItem[] };

const S = {
  page:  { minHeight: "100vh", background: "var(--c-bg)", fontFamily: "var(--font-sans)" } as React.CSSProperties,
  wrap:  { maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" } as React.CSSProperties,
  h2:    { fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: "1.05rem", color: "var(--c-text)", borderLeft: "3px solid var(--c-brand)", paddingLeft: 12, marginBottom: 14, lineHeight: 1.3 } as React.CSSProperties,
  card:  { background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 8 } as React.CSSProperties,
};

export default function SportUploadPage() {
  const [jsonText, setJsonText]     = useState("");
  const [uploading, setUploading]   = useState(false);
  const [result, setResult]         = useState<UploadResult | null>(null);
  const [parseError, setParseError] = useState("");
  const [copied, setCopied]         = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(PROMPT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validate = (text: string): { ok: boolean; count?: number; error?: string } => {
    if (!text.trim()) return { ok: false };
    try {
      const arr = Array.isArray(JSON.parse(text)) ? JSON.parse(text) : [JSON.parse(text)];
      for (let i = 0; i < arr.length; i++) {
        const missing = REQUIRED.filter(k => arr[i][k] === undefined || arr[i][k] === null || arr[i][k] === "");
        if (missing.length) return { ok: false, error: `第 ${i + 1} 条缺少：${missing.join("、")}` };
      }
      return { ok: true, count: arr.length };
    } catch (e) {
      return { ok: false, error: `JSON 格式错误：${String(e).replace("SyntaxError: ", "").slice(0, 60)}` };
    }
  };

  const validation = jsonText ? validate(jsonText) : null;

  const handleUpload = async () => {
    const v = validate(jsonText);
    if (!v.ok) { setParseError(v.error || "格式错误"); return; }
    setParseError(""); setUploading(true); setResult(null);
    try {
      const res  = await fetch("/api/sport/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: jsonText });
      const data = await res.json() as UploadResult;
      setResult(data);
    } catch (e) {
      setParseError(`网络错误：${String(e)}`);
    } finally {
      setUploading(false);
    }
  };

  const borderColor = parseError ? "#b53333"
    : validation?.ok ? "var(--c-brand)"
    : validation && !validation.ok ? "#b53333"
    : "var(--c-border)";

  return (
    <div style={S.page}>
      <div style={S.wrap}>

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
          <p style={{ fontSize: "0.875rem", color: "var(--c-text-3)", lineHeight: 1.65 }}>
            截图发给 AI → 复制 JSON → 上传到 Notion
          </p>
          <div style={{ height: 1, background: "var(--c-border-2)", marginTop: 24 }} />
        </div>

        {/* Step 1 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={S.h2}>第一步 · 复制提示词发给 AI</h2>
          <p style={{ fontSize: "0.8125rem", color: "var(--c-text-3)", marginBottom: 16, lineHeight: 1.65 }}>
            复制提示词 → 粘贴给 <strong style={{ color: "var(--c-text-2)" }}>ChatGPT-4o / Claude</strong> → 发送运动截图（一张或多张）→ AI 输出 JSON
          </p>
          <button
            onClick={handleCopyPrompt}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 7,
              border: "1px solid var(--c-border)",
              background: copied ? "var(--c-brand)" : "var(--c-surface)",
              color: copied ? "var(--c-text-inv)" : "var(--c-brand)",
              fontFamily: "var(--font-sans)", fontSize: "0.8375rem", fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            {copied
              ? <><svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>已复制！</>
              : <><svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>一键复制提示词</>
            }
          </button>
        </section>

        {/* Step 2 */}
        <section style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ ...S.h2, marginBottom: 0 }}>第二步 · 粘贴 JSON 上传</h2>
            <button
              onClick={() => { setJsonText(EXAMPLE_JSON); setResult(null); setParseError(""); textareaRef.current?.focus(); }}
              style={{ fontSize: "0.72rem", color: "var(--c-text-4)", cursor: "pointer", background: "none", border: "none", textDecoration: "underline", textUnderlineOffset: 3 }}
            >
              填入示例
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={jsonText}
            onChange={e => { setJsonText(e.target.value); setResult(null); setParseError(""); }}
            placeholder={`粘贴 AI 输出的 JSON，单条 {} 或数组 [{},{}] 均可`}
            style={{
              width: "100%", minHeight: 240, padding: "14px 16px", borderRadius: 8,
              border: `1.5px solid ${borderColor}`,
              background: "var(--c-surface)", color: "var(--c-text)",
              fontFamily: "var(--font-mono)", fontSize: "0.8rem", lineHeight: 1.6,
              resize: "vertical", outline: "none", transition: "border-color 0.2s",
              boxSizing: "border-box",
            }}
            spellCheck={false}
          />

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: "0.75rem" }}>
            <span>
              {(parseError || (validation && !validation.ok)) && <span style={{ color: "#b53333" }}>✗ {parseError || validation?.error}</span>}
              {!parseError && validation?.ok && <span style={{ color: "#2d6a4f" }}>✓ 格式正确，共 {validation.count} 条</span>}
            </span>
            <span style={{ color: "var(--c-text-4)" }}>{jsonText.length > 0 ? `${jsonText.length} 字符` : ""}</span>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading || !jsonText.trim()}
            style={{
              marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              width: "100%", padding: "12px", borderRadius: 8, border: "none",
              background: uploading || !jsonText.trim() ? "var(--c-warm-sand)" : "var(--c-brand)",
              color: uploading || !jsonText.trim() ? "var(--c-text-4)" : "var(--c-text-inv)",
              fontFamily: "var(--font-sans)", fontSize: "0.875rem", fontWeight: 600,
              cursor: uploading || !jsonText.trim() ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {uploading
              ? <><svg style={{ animation: "spin 1s linear infinite" }} width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.7-5.3M20 15a9 9 0 01-14.7 5.3"/></svg>写入 Notion 中…</>
              : <><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>上传到 Notion</>
            }
          </button>
        </section>

        {/* 结果 */}
        {result && (
          <section style={{ marginBottom: 40 }}>
            <div style={{
              padding: "16px 20px", borderRadius: 8, marginBottom: 16,
              background: result.fail === 0 ? "#f0fdf4" : result.ok === 0 ? "#fef2f2" : "#fffbeb",
              border: `1px solid ${result.fail === 0 ? "#bbf7d0" : result.ok === 0 ? "#fecaca" : "#fde68a"}`,
            }}>
              <p style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: 4, color: result.fail === 0 ? "#166534" : result.ok === 0 ? "#991b1b" : "#92400e" }}>
                {result.fail === 0 ? `✓ 全部成功，共 ${result.ok} 条` : result.ok === 0 ? `✗ 全部失败` : `⚠ ${result.ok} 成功 / ${result.fail} 失败`}
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--c-text-4)" }}>共 {result.total} 条 · 成功 {result.ok} · 失败 {result.fail}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {result.results.map(r => (
                <div key={r.index} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderRadius: 8, ...S.card, borderColor: r.status === "ok" ? "var(--c-border)" : "#fecaca" }}>
                  <span style={{ flexShrink: 0, marginTop: 1 }}>{r.status === "ok" ? "✅" : "❌"}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 500, fontSize: "0.8375rem", color: "var(--c-text)", marginBottom: 2 }}>{r.name}</p>
                    {r.status === "ok" && r.id && <p style={{ fontSize: "0.7rem", color: "var(--c-text-4)", fontFamily: "var(--font-mono)" }}>ID: {r.id}</p>}
                    {r.status === "error" && <p style={{ fontSize: "0.72rem", color: "#b53333" }}>{r.error}</p>}
                  </div>
                </div>
              ))}
            </div>
            {result.ok > 0 && (
              <p style={{ textAlign: "center", marginTop: 20 }}>
                <a href="https://fanghongtao.notion.site/bd890c54c1314740851444e50004e5f5" target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "0.8rem", color: "var(--c-brand)", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  在 Notion 中查看 →
                </a>
              </p>
            )}
          </section>
        )}

        {/* 字段速查 */}
        <details style={{ marginTop: 40 }}>
          <summary style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--c-text-4)", cursor: "pointer", userSelect: "none" }}>字段速查 ▾</summary>
          <div style={{ marginTop: 12, overflowX: "auto", ...S.card, padding: 0 }}>
            <table style={{ width: "100%", fontSize: "0.775rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--c-brand)" }}>
                  {["字段名", "类型", "说明"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontFamily: "var(--font-serif)", fontWeight: 500, color: "var(--c-text-3)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FIELDS.map(([field, type, desc]) => (
                  <tr key={field} style={{ borderBottom: "1px solid var(--c-border)" }}>
                    <td style={{ padding: "7px 12px", fontFamily: "var(--font-mono)", color: "var(--c-brand)", fontWeight: 600, whiteSpace: "nowrap" }}>{field}</td>
                    <td style={{ padding: "7px 12px", color: "var(--c-text-4)", whiteSpace: "nowrap" }}>{type}</td>
                    <td style={{ padding: "7px 12px", color: "var(--c-text-3)" }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
