import React, { useState, useEffect } from "react";
import { TreeViewNode } from "./TreeViewNode";

const SAMPLE_JSON_VIEW = `{
  "store": {
    "name": "Tech Emporium",
    "location": "Jakarta",
    "open": true,
    "metrics": {
      "rating": 4.9,
      "visitors": 12500,
      "verified": true
    },
    "categories": ["Electronics", "Software", "Gadgets"],
    "products": [
      {
        "id": "P101",
        "name": "Wireless Mechanical Keyboard",
        "price": 129.99,
        "inStock": true,
        "tags": ["rgb", "bluetooth", "hot-swap"]
      },
      {
        "id": "P102",
        "name": "Ultra-wide Curved Monitor 34-inch",
        "price": 499.00,
        "inStock": false,
        "tags": ["4k", "hdr", "144hz"]
      }
    ]
  }
}`;

export function JsonViewer() {
  const [inputJson, setInputJson] = useState(""); // Start empty as requested
  const [parsedData, setParsedData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [maxExpandDepth, setMaxExpandDepth] = useState(2);
  const [treeKey, setTreeKey] = useState(0);
  const [error, setError] = useState(null);
  const [copiedPath, setCopiedPath] = useState(null);

  useEffect(() => {
    try {
      if (!inputJson.trim()) {
        setParsedData(null);
        setError(null);
        return;
      }
      const data = JSON.parse(inputJson);
      setParsedData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setParsedData(null);
    }
  }, [inputJson]);

  const handleCopyPath = (path) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2500);
  };

  const handleExpandDepth = (depth) => {
    setMaxExpandDepth(depth);
    setTreeKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-4 w-full">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-900/80 rounded-2xl border border-gray-800 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Filter */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search key atau value..."
              className="px-4 py-2 bg-black/50 text-xs font-mono text-white rounded-xl border border-gray-700 focus:border-green-400 focus:outline-none w-72"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Depth Controls */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-gray-800 text-xs font-mono">
            <span className="text-gray-400 px-2">Expand:</span>
            <button
              type="button"
              onClick={() => handleExpandDepth(1)}
              className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300"
            >
              L1
            </button>
            <button
              type="button"
              onClick={() => handleExpandDepth(2)}
              className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300"
            >
              L2
            </button>
            <button
              type="button"
              onClick={() => handleExpandDepth(10)}
              className="px-2.5 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg font-bold"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={() => handleExpandDepth(0)}
              className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300"
            >
              Collapse
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {copiedPath && (
            <span className="text-xs font-mono text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
              Copied path: <code className="text-white">{copiedPath}</code>
            </span>
          )}

          <button
            type="button"
            onClick={() => setInputJson(SAMPLE_JSON_VIEW)}
            className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-green-400 text-xs font-mono font-semibold rounded-xl border border-gray-700 transition-colors flex items-center gap-1.5"
          >
            📄 Sample Data
          </button>

          <button
            type="button"
            onClick={() => setInputJson("")}
            className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-mono rounded-xl border border-red-900/50 transition-colors"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/70 border border-red-800 rounded-xl text-red-200 text-xs font-mono">
          ⚠️ Syntax Error: {error}
        </div>
      )}

      {/* Main Split Inspector View */}
      <div className="grid lg:grid-cols-2 gap-6 w-full">
        {/* Left: Input Editor */}
        <div className="card rounded-2xl p-5 flex flex-col space-y-3 w-full">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-300 font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Raw JSON Input
            </span>
            <span className="font-mono text-xs text-gray-400">
              {inputJson.length} karakter
            </span>
          </div>

          <textarea
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            placeholder="Tempel string JSON Anda di sini..."
            className="w-full h-[600px] bg-black/60 text-amber-200 font-mono text-xs md:text-sm p-4 rounded-xl border border-gray-800 focus:border-amber-400 focus:outline-none resize-y leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Right: Interactive Tree Inspector */}
        <div className="card rounded-2xl p-5 flex flex-col space-y-3 w-full">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-green-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
              Interactive Tree View
            </span>
            <span className="font-mono text-xs text-gray-400">
              Hover node untuk menyalin path
            </span>
          </div>

          <div className="w-full h-[600px] bg-black/70 p-4 rounded-xl border border-gray-800 overflow-auto font-mono text-xs md:text-sm leading-relaxed">
            {parsedData !== null ? (
              <TreeViewNode
                key={treeKey}
                name="root"
                value={parsedData}
                maxAutoExpandDepth={maxExpandDepth}
                searchQuery={searchQuery}
                onCopyPath={handleCopyPath}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 font-mono text-xs md:text-sm">
                {error ? "Perbaiki kesalahan JSON di sebelah kiri untuk melihat pohon data" : "Masukkan JSON valid atau klik 'Sample Data' untuk melihat pohon interaktif"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
