import React, { useState, useEffect } from "react";
import * as yaml from "js-yaml";
import { TreeViewNode } from "./TreeViewNode";

const SAMPLE_YAML_VIEW = `server:
  host: "0.0.0.0"
  port: 8080
  ssl:
    enabled: true
    cert: "/etc/ssl/certs/server.crt"
    key: "/etc/ssl/private/server.key"

database:
  driver: "postgres"
  host: "db.internal.net"
  port: 5432
  credentials:
    username: "admin"
    password: "secretpassword"
  pool:
    min: 5
    max: 20

features:
  - name: "Authentication"
    status: "active"
    providers: ["oauth2", "jwt", "saml"]
  - name: "Real-time Metrics"
    status: "beta"
    intervalSeconds: 15`;

export function YamlViewer() {
  const [inputYaml, setInputYaml] = useState(""); // Start empty as requested
  const [parsedData, setParsedData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [maxExpandDepth, setMaxExpandDepth] = useState(2);
  const [treeKey, setTreeKey] = useState(0);
  const [error, setError] = useState(null);
  const [copiedPath, setCopiedPath] = useState(null);

  useEffect(() => {
    try {
      if (!inputYaml.trim()) {
        setParsedData(null);
        setError(null);
        return;
      }
      const data = yaml.load(inputYaml);
      setParsedData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setParsedData(null);
    }
  }, [inputYaml]);

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
              className="px-4 py-2 bg-black/50 text-xs font-mono text-white rounded-xl border border-gray-700 focus:border-purple-400 focus:outline-none w-72"
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
              className="px-2.5 py-1 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg font-bold"
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
            <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">
              Copied path: <code className="text-white">{copiedPath}</code>
            </span>
          )}

          <button
            type="button"
            onClick={() => setInputYaml(SAMPLE_YAML_VIEW)}
            className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-green-400 text-xs font-mono font-semibold rounded-xl border border-gray-700 transition-colors flex items-center gap-1.5"
          >
            📄 Sample Data
          </button>

          <button
            type="button"
            onClick={() => setInputYaml("")}
            className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-mono rounded-xl border border-red-900/50 transition-colors"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/70 border border-red-800 rounded-xl text-red-200 text-xs font-mono">
          ⚠️ YAML Syntax Error: {error}
        </div>
      )}

      {/* Main Split Inspector View */}
      <div className="grid lg:grid-cols-2 gap-6 w-full">
        {/* Left: Raw YAML Input */}
        <div className="card rounded-2xl p-5 flex flex-col space-y-3 w-full">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-purple-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              Raw YAML Input
            </span>
            <span className="font-mono text-xs text-gray-400">
              {inputYaml.length} karakter
            </span>
          </div>

          <textarea
            value={inputYaml}
            onChange={(e) => setInputYaml(e.target.value)}
            placeholder="Tempel kode YAML Anda di sini..."
            className="w-full h-[600px] bg-black/60 text-purple-200 font-mono text-xs md:text-sm p-4 rounded-xl border border-gray-800 focus:border-purple-400 focus:outline-none resize-y leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Right: Interactive Tree Inspector */}
        <div className="card rounded-2xl p-5 flex flex-col space-y-3 w-full">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-green-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
              YAML Tree Inspector
            </span>
            <span className="font-mono text-xs text-gray-400">
              Hover node untuk menyalin path
            </span>
          </div>

          <div className="w-full h-[600px] bg-black/70 p-4 rounded-xl border border-gray-800 overflow-auto font-mono text-xs md:text-sm leading-relaxed">
            {parsedData !== null ? (
              <TreeViewNode
                key={treeKey}
                name="yaml"
                value={parsedData}
                maxAutoExpandDepth={maxExpandDepth}
                searchQuery={searchQuery}
                onCopyPath={handleCopyPath}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 font-mono text-xs md:text-sm">
                {error ? "Perbaiki kesalahan YAML di sebelah kiri untuk melihat pohon data" : "Masukkan YAML valid atau klik 'Sample Data' untuk melihat inspektur pohon"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
