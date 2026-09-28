import React, { useState } from "react";
import * as yaml from "js-yaml";

const SAMPLE_YAML = `version: "3.8"
services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://user:pass@localhost:5432/mydb
    volumes:
      - ./src:/app/src
    restart: always

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:`;

export function YamlFormatter() {
  const [inputYaml, setInputYaml] = useState(""); // Start empty as requested
  const [outputYaml, setOutputYaml] = useState("");
  const [indentSize, setIndentSize] = useState(2);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const handleFormat = () => {
    try {
      setError(null);
      if (!inputYaml.trim()) {
        setOutputYaml("");
        return;
      }

      const parsed = yaml.load(inputYaml);
      const formatted = yaml.dump(parsed, { indent: indentSize });
      setOutputYaml(formatted);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleYamlToJson = () => {
    try {
      setError(null);
      if (!inputYaml.trim()) return;
      const parsed = yaml.load(inputYaml);
      const jsonStr = JSON.stringify(parsed, null, indentSize);
      setOutputYaml(jsonStr);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCopy = () => {
    const textToCopy = outputYaml || inputYaml;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = outputYaml || inputYaml;
    if (!content) return;
    const blob = new Blob([content], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.yaml";
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
        setInputYaml(content);
        try {
          const parsed = yaml.load(content);
          setOutputYaml(yaml.dump(parsed, { indent: indentSize }));
          setError(null);
        } catch (err) {
          setError(err.message);
        }
      }
    };
    reader.readAsText(file);
  };

  const currentContent = outputYaml || inputYaml;

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
            <span>✨ Format YAML</span>
          </button>

          <button
            type="button"
            onClick={handleYamlToJson}
            className="px-4 py-2 bg-purple-600/80 hover:bg-purple-500 text-white font-medium rounded-xl border border-purple-500/50 transition-colors text-sm"
          >
            🔄 Convert to JSON
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
              setInputYaml(SAMPLE_YAML);
              try {
                const parsed = yaml.load(SAMPLE_YAML);
                setOutputYaml(yaml.dump(parsed, { indent: indentSize }));
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
            <input type="file" accept=".yaml,.yml" onChange={handleFileUpload} className="hidden" />
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
              setInputYaml("");
              setOutputYaml("");
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
          <p className="font-bold flex items-center gap-2">⚠️ Invalid YAML Syntax:</p>
          <p className="opacity-90">{error}</p>
        </div>
      )}

      {/* Editor & Output Split View */}
      <div className="grid lg:grid-cols-2 gap-6 w-full">
        {/* Input Pane */}
        <div className="card rounded-2xl p-5 flex flex-col space-y-3 w-full">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-300 font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              YAML Input Data
            </span>
            <span className="font-mono text-xs text-gray-400">
              {inputYaml.length} karakter | {inputYaml ? inputYaml.split("\n").length : 0} baris
            </span>
          </div>

          <textarea
            value={inputYaml}
            onChange={(e) => setInputYaml(e.target.value)}
            placeholder="Tempel atau ketik kode YAML Anda di sini..."
            className="w-full h-[580px] bg-black/60 text-green-300 font-mono text-xs md:text-sm p-4 rounded-xl border border-gray-800 focus:border-green-500 focus:outline-none resize-y leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Output Pane */}
        <div className="card rounded-2xl p-5 flex flex-col space-y-3 w-full">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-purple-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              Formatted Output
            </span>
            <span className="font-mono text-xs text-gray-400">
              {currentContent.length} karakter
            </span>
          </div>

          <textarea
            value={currentContent}
            readOnly
            placeholder="Hasil format YAML akan tampil di sini..."
            className="w-full h-[580px] bg-black/70 text-purple-200 font-mono text-xs md:text-sm p-4 rounded-xl border border-gray-800 focus:outline-none resize-y leading-relaxed"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
