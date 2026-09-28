import React, { useState } from "react";

const SAMPLE_JSON = `{
  "app": "Data Formatter & Viewer Suite",
  "version": "1.0.0",
  "developer": {
    "name": "Van Rodiansyah",
    "role": "Full Stack Developer",
    "skills": ["React", "Node.js", "TypeScript", "Python", "Docker"]
  },
  "features": [
    "HTML Formatter",
    "XML Formatter",
    "JSON Formatter",
    "YAML Formatter",
    "Interactive Tree Viewers"
  ],
  "settings": {
    "theme": "dark",
    "autoSave": true,
    "maxDepth": 10
  }
}`;

export function JsonFormatter() {
  const [inputJson, setInputJson] = useState(""); // Start empty as requested
  const [outputJson, setOutputJson] = useState("");
  const [indentSize, setIndentSize] = useState(2);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const calculateStats = (obj) => {
    let keyCount = 0;
    let maxDepth = 0;

    const traverse = (item, depth = 1) => {
      if (depth > maxDepth) maxDepth = depth;
      if (item && typeof item === "object") {
        if (!Array.isArray(item)) {
          keyCount += Object.keys(item).length;
        }
        Object.values(item).forEach((val) => traverse(val, depth + 1));
      }
    };

    traverse(obj);
    return { keyCount, maxDepth };
  };

  const handleFormat = () => {
    try {
      setError(null);
      if (!inputJson.trim()) {
        setOutputJson("");
        setStats(null);
        return;
      }

      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setOutputJson(formatted);
      setStats(calculateStats(parsed));
    } catch (err) {
      setError(err.message);
      setStats(null);
    }
  };

  const handleMinify = () => {
    try {
      setError(null);
      if (!inputJson.trim()) return;
      const parsed = JSON.parse(inputJson);
      const minified = JSON.stringify(parsed);
      setOutputJson(minified);
      setStats(calculateStats(parsed));
    } catch (err) {
      setError(err.message);
      setStats(null);
    }
  };

  const handleSortKeys = () => {
    try {
      setError(null);
      if (!inputJson.trim()) return;
      const parsed = JSON.parse(inputJson);

      const sortObjectKeys = (obj) => {
        if (Array.isArray(obj)) {
          return obj.map(sortObjectKeys);
        }
        if (obj !== null && typeof obj === "object") {
          return Object.keys(obj)
            .sort()
            .reduce((acc, key) => {
              acc[key] = sortObjectKeys(obj[key]);
              return acc;
            }, {});
        }
        return obj;
      };

      const sortedObj = sortObjectKeys(parsed);
      const formatted = JSON.stringify(sortedObj, null, indentSize);
      setOutputJson(formatted);
      setStats(calculateStats(sortedObj));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAutoRepair = () => {
    try {
      setError(null);
      if (!inputJson.trim()) return;
      let fixedStr = inputJson
        .replace(/,\s*([\]}])/g, "$1")
        .replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":')
        .replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');

      const parsed = JSON.parse(fixedStr);
      setInputJson(fixedStr);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setOutputJson(formatted);
      setStats(calculateStats(parsed));
    } catch (err) {
      setError(`Auto-repair failed: ${err.message}`);
    }
  };

  const handleCopy = () => {
    const textToCopy = outputJson || inputJson;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = outputJson || inputJson;
    if (!content) return;
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
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
        setInputJson(content);
        try {
          const parsed = JSON.parse(content);
          setOutputJson(JSON.stringify(parsed, null, indentSize));
          setStats(calculateStats(parsed));
          setError(null);
        } catch (err) {
          setError(err.message);
        }
      }
    };
    reader.readAsText(file);
  };

  const currentContent = outputJson || inputJson;

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
            <span>✨ Format JSON</span>
          </button>

          <button
            type="button"
            onClick={handleMinify}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl border border-gray-700 transition-colors text-sm"
          >
            ⚡ Minify
          </button>

          <button
            type="button"
            onClick={handleSortKeys}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-purple-300 font-medium rounded-xl border border-purple-500/30 transition-colors text-sm"
          >
            🔤 Sort Keys
          </button>

          <button
            type="button"
            onClick={handleAutoRepair}
            className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium rounded-xl border border-amber-500/40 transition-colors text-sm"
          >
            🛠️ Auto-Fix Loose JSON
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
              setInputJson(SAMPLE_JSON);
              try {
                const parsed = JSON.parse(SAMPLE_JSON);
                setOutputJson(JSON.stringify(parsed, null, indentSize));
                setStats(calculateStats(parsed));
                setError(null);
              } catch (err) {
                setError(err.message);
              }
            }}
            className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-green-400 text-xs font-mono font-semibold rounded-xl border border-gray-700 transition-colors flex items-center gap-1.5"
          >
            📄 Sample Data
          </button>

          <label className="px-3.5 py-2 bg-gray-800/80 hover:bg-gray-700 text-gray-300 text-xs font-mono rounded-xl cursor-pointer transition-colors">
            📁 Upload File
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-mono rounded-xl transition-colors"
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
              setInputJson("");
              setOutputJson("");
              setStats(null);
              setError(null);
            }}
            className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-mono rounded-xl border border-red-900/50 transition-colors"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/80 border border-red-800 rounded-2xl text-red-200 text-xs font-mono space-y-1">
          <p className="font-bold flex items-center gap-2">⚠️ Invalid JSON Syntax:</p>
          <p className="opacity-90">{error}</p>
        </div>
      )}

      {stats && (
        <div className="flex flex-wrap items-center gap-6 px-4 py-2.5 bg-green-500/10 border border-green-500/20 rounded-xl text-xs font-mono text-green-400">
          <span>📊 Total Keys: {stats.keyCount}</span>
          <span>📐 Max Depth: {stats.maxDepth}</span>
          <span>💾 Bytes: {new Blob([currentContent]).size} B</span>
        </div>
      )}

      {/* Editor & Output Split View */}
      <div className="grid lg:grid-cols-2 gap-6 w-full">
        {/* Input Pane */}
        <div className="card rounded-2xl p-5 flex flex-col space-y-3 w-full">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-300 font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              JSON Input
            </span>
            <span className="font-mono text-xs text-gray-400">
              {inputJson.length} karakter | {inputJson ? inputJson.split("\n").length : 0} baris
            </span>
          </div>

          <textarea
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            placeholder="Tempel atau ketik string JSON Anda di sini..."
            className="w-full h-[580px] bg-black/60 text-green-300 font-mono text-xs md:text-sm p-4 rounded-xl border border-gray-800 focus:border-green-500 focus:outline-none resize-y leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Output Pane */}
        <div className="card rounded-2xl p-5 flex flex-col space-y-3 w-full">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-blue-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              Formatted JSON Output
            </span>
            <span className="font-mono text-xs text-gray-400">
              {currentContent.length} karakter
            </span>
          </div>

          <textarea
            value={currentContent}
            readOnly
            placeholder="Hasil format JSON akan tampil di sini..."
            className="w-full h-[580px] bg-black/70 text-blue-200 font-mono text-xs md:text-sm p-4 rounded-xl border border-gray-800 focus:outline-none resize-y leading-relaxed"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
