import React, { useState } from "react";

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Sample Document</title>
<style>
body { font-family: sans-serif; background: #111; color: #fff; padding: 20px; }
h1 { color: #00ff88; }
</style>
</head>
<body>
<div class="container">
<h1>Hello World</h1>
<p>This is a <strong>formatted HTML</strong> document with a list:</p>
<ul>
<li>Feature 1: Auto Indentation</li>
<li>Feature 2: Minify Support</li>
<li>Feature 3: Live Preview</li>
</ul>
<button type="button" onclick="alert('Clicked!')">Click Me</button>
</div>
</body>
</html>`;

export function HtmlFormatter() {
  const [inputHtml, setInputHtml] = useState(""); // Start empty as requested
  const [outputHtml, setOutputHtml] = useState("");
  const [indentSize, setIndentSize] = useState(2);
  const [activeView, setActiveView] = useState("code"); // 'code' | 'preview'
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const formatHtmlString = (html, indentSpaces = 2) => {
    try {
      setError(null);
      if (!html.trim()) return "";

      const indentStr = typeof indentSpaces === "number" ? " ".repeat(indentSpaces) : "\t";
      let formatted = "";
      let pad = 0;

      const tokens = html
        .replace(/>\s+</g, "><")
        .replace(/(<[^\/>]+?>)/g, "\n$1")
        .replace(/(<\/[^>]+?>)/g, "\n$1")
        .replace(/(\n\s*)+/g, "\n")
        .trim()
        .split("\n");

      const voidElements = new Set([
        "area", "base", "br", "col", "embed", "hr", "img", "input",
        "link", "meta", "param", "source", "track", "wbr"
      ]);

      tokens.forEach((token) => {
        const trimmed = token.trim();
        if (!trimmed) return;

        if (trimmed.match(/^<\//)) {
          pad = Math.max(0, pad - 1);
        }

        formatted += indentStr.repeat(pad) + trimmed + "\n";

        if (
          trimmed.match(/^<[^\/!]/) &&
          !trimmed.match(/\/>$/) &&
          !trimmed.match(/^<!/)
        ) {
          const tagNameMatch = trimmed.match(/^<([a-zA-Z0-9-]+)/);
          if (tagNameMatch) {
            const tagName = tagNameMatch[1].toLowerCase();
            if (!voidElements.has(tagName)) {
              pad++;
            }
          }
        }
      });

      return formatted.trim();
    } catch (err) {
      setError(err.message);
      return html;
    }
  };

  const handleFormat = () => {
    const formatted = formatHtmlString(inputHtml, indentSize);
    setOutputHtml(formatted);
  };

  const handleMinify = () => {
    try {
      setError(null);
      if (!inputHtml.trim()) return;
      const minified = inputHtml
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/>\s+</g, "><")
        .replace(/\s{2,}/g, " ")
        .trim();
      setOutputHtml(minified);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCopy = () => {
    const textToCopy = outputHtml || inputHtml;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = outputHtml || inputHtml;
    if (!content) return;
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setInputHtml(content);
        setOutputHtml(formatHtmlString(content, indentSize));
      }
    };
    reader.readAsText(file);
  };

  const currentContent = outputHtml || inputHtml;

  return (
    <div className="space-y-4 w-full">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-900/80 rounded-2xl border border-gray-800 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleFormat}
            className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center gap-2 text-sm"
          >
            <span>✨ Format HTML</span>
          </button>

          <button
            type="button"
            onClick={handleMinify}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl border border-gray-700 transition-colors text-sm"
          >
            ⚡ Minify
          </button>

          <div className="flex items-center gap-2 text-xs font-mono bg-black/40 px-3 py-2 rounded-xl border border-gray-800 text-gray-300">
            <span>Indent:</span>
            <select
              value={indentSize}
              onChange={(e) => setIndentSize(Number(e.target.value))}
              className="bg-gray-800 text-green-400 border border-gray-700 rounded px-2 py-0.5 outline-none"
            >
              <option value={2}>2 spasi</option>
              <option value={4}>4 spasi</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setInputHtml(SAMPLE_HTML);
              setOutputHtml(formatHtmlString(SAMPLE_HTML, indentSize));
            }}
            className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-green-400 text-xs font-mono font-semibold rounded-xl border border-gray-700 transition-colors flex items-center gap-1.5"
          >
            📄 Sample Data
          </button>

          <label className="px-3.5 py-2 bg-gray-800/80 hover:bg-gray-700 text-gray-300 text-xs font-mono rounded-xl cursor-pointer transition-colors">
            📁 Upload File
            <input type="file" accept=".html,.htm" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-mono rounded-xl transition-colors flex items-center gap-1.5"
          >
            {copied ? "✅ Copied!" : "📋 Copy"}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-mono rounded-xl transition-colors"
          >
            📥 Download
          </button>

          <button
            type="button"
            onClick={() => {
              setInputHtml("");
              setOutputHtml("");
            }}
            className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-mono rounded-xl border border-red-900/50 transition-colors"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-200 text-xs font-mono">
          ⚠️ Formatting note: {error}
        </div>
      )}

      {/* Wider Editor & Output Split View */}
      <div className="grid lg:grid-cols-2 gap-6 w-full">
        {/* Input Pane */}
        <div className="card rounded-2xl p-5 flex flex-col space-y-3 w-full">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-300 font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              HTML Input Code
            </span>
            <span className="font-mono text-xs text-gray-400">
              {inputHtml.length} karakter | {inputHtml ? inputHtml.split("\n").length : 0} baris
            </span>
          </div>

          <textarea
            value={inputHtml}
            onChange={(e) => setInputHtml(e.target.value)}
            placeholder="Tempel atau ketik kode HTML Anda di sini..."
            className="w-full h-[580px] bg-black/60 text-green-300 font-mono text-xs md:text-sm p-4 rounded-xl border border-gray-800 focus:border-green-500 focus:outline-none resize-y leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Output & Preview Pane */}
        <div className="card rounded-2xl p-5 flex flex-col space-y-3 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveView("code")}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
                  activeView === "code"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30 font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                💻 Formatted Code
              </button>
              <button
                type="button"
                onClick={() => setActiveView("preview")}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
                  activeView === "preview"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30 font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                👁️ Live Render
              </button>
            </div>

            <span className="font-mono text-xs text-gray-400">
              {currentContent.length} karakter
            </span>
          </div>

          {activeView === "code" ? (
            <textarea
              value={currentContent}
              readOnly
              placeholder="Hasil format HTML akan tampil di sini..."
              className="w-full h-[580px] bg-black/70 text-blue-200 font-mono text-xs md:text-sm p-4 rounded-xl border border-gray-800 focus:outline-none resize-y leading-relaxed"
              spellCheck={false}
            />
          ) : (
            <div className="w-full h-[580px] bg-white rounded-xl overflow-hidden border border-gray-800">
              <iframe
                title="HTML Live Preview"
                srcDoc={currentContent || "<p style='color:#666;padding:20px;font-family:sans-serif;'>Preview kosong</p>"}
                className="w-full h-full border-0"
                sandbox="allow-scripts"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
