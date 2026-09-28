import React, { useState } from "react";

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="bk101">
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide</title>
    <genre>Computer</genre>
    <price>44.95</price>
    <publish_date>2000-10-01</publish_date>
    <description>An in-depth look at creating applications with XML.</description>
  </book>
  <book id="bk102">
    <author>Ralls, Kim</author>
    <title>Midnight Rain</title>
    <genre>Fantasy</genre>
    <price>5.95</price>
    <publish_date>2000-12-16</publish_date>
    <description>A former architect battles corporate zombies.</description>
  </book>
</catalog>`;

export function XmlFormatter() {
  const [inputXml, setInputXml] = useState(""); // Start empty as requested
  const [outputXml, setOutputXml] = useState("");
  const [indentSize, setIndentSize] = useState(2);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const formatXmlString = (xml, spaces = 2) => {
    try {
      setError(null);
      if (!xml.trim()) return "";

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, "application/xml");

      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        throw new Error(parseError[0].textContent || "Invalid XML syntax");
      }

      const indentStr = " ".repeat(spaces);

      const serializeNode = (node, depth = 0) => {
        let output = "";
        const indent = indentStr.repeat(depth);

        if (node.nodeType === Node.ELEMENT_NODE) {
          output += `${indent}<${node.nodeName}`;

          for (let i = 0; i < node.attributes.length; i++) {
            const attr = node.attributes[i];
            output += ` ${attr.name}="${attr.value}"`;
          }

          if (node.childNodes.length === 0) {
            output += " />\n";
          } else if (node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE) {
            const textContent = node.childNodes[0].nodeValue.trim();
            output += `>${textContent}</${node.nodeName}>\n`;
          } else {
            output += ">\n";
            for (let i = 0; i < node.childNodes.length; i++) {
              output += serializeNode(node.childNodes[i], depth + 1);
            }
            output += `${indent}</${node.nodeName}>\n`;
          }
        } else if (node.nodeType === Node.TEXT_NODE) {
          const text = node.nodeValue.trim();
          if (text) {
            output += `${indent}${text}\n`;
          }
        } else if (node.nodeType === Node.COMMENT_NODE) {
          output += `${indent}<!--${node.nodeValue}-->\n`;
        }

        return output;
      };

      let result = "";
      const xmlDeclMatch = xml.match(/^<\?xml[^>]*\?>/i);
      if (xmlDeclMatch) {
        result += xmlDeclMatch[0] + "\n";
      }

      for (let i = 0; i < xmlDoc.childNodes.length; i++) {
        result += serializeNode(xmlDoc.childNodes[i], 0);
      }

      return result.trim();
    } catch (err) {
      setError(err.message);
      return xml;
    }
  };

  const handleFormat = () => {
    const formatted = formatXmlString(inputXml, indentSize);
    setOutputXml(formatted);
  };

  const handleMinify = () => {
    try {
      setError(null);
      if (!inputXml.trim()) return;
      const minified = inputXml
        .replace(/>\s+</g, "><")
        .replace(/<!--[\s\S]*?-->/g, "")
        .trim();
      setOutputXml(minified);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleXmlToJson = () => {
    try {
      setError(null);
      if (!inputXml.trim()) return;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(inputXml, "application/xml");

      const parseError = xmlDoc.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        throw new Error(parseError[0].textContent || "Invalid XML syntax");
      }

      const xmlToJsonNode = (node) => {
        const obj = {};

        if (node.nodeType === Node.ELEMENT_NODE && node.attributes.length > 0) {
          obj["@attributes"] = {};
          for (let i = 0; i < node.attributes.length; i++) {
            const attr = node.attributes[i];
            obj["@attributes"][attr.name] = attr.value;
          }
        }

        if (node.hasChildNodes()) {
          for (let i = 0; i < node.childNodes.length; i++) {
            const item = node.childNodes[i];
            const nodeName = item.nodeName;

            if (item.nodeType === Node.TEXT_NODE) {
              const text = item.nodeValue.trim();
              if (text) return text;
            } else if (item.nodeType === Node.ELEMENT_NODE) {
              if (obj[nodeName] === undefined) {
                obj[nodeName] = xmlToJsonNode(item);
              } else {
                if (!Array.isArray(obj[nodeName])) {
                  obj[nodeName] = [obj[nodeName]];
                }
                obj[nodeName].push(xmlToJsonNode(item));
              }
            }
          }
        }
        return obj;
      };

      const jsonObj = {};
      for (let i = 0; i < xmlDoc.childNodes.length; i++) {
        const node = xmlDoc.childNodes[i];
        if (node.nodeType === Node.ELEMENT_NODE) {
          jsonObj[node.nodeName] = xmlToJsonNode(node);
        }
      }

      setOutputXml(JSON.stringify(jsonObj, null, indentSize));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCopy = () => {
    const textToCopy = outputXml || inputXml;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = outputXml || inputXml;
    if (!content) return;
    const blob = new Blob([content], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.xml";
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
        setInputXml(content);
        setOutputXml(formatXmlString(content, indentSize));
      }
    };
    reader.readAsText(file);
  };

  const currentContent = outputXml || inputXml;

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
            <span>✨ Format XML</span>
          </button>

          <button
            type="button"
            onClick={handleMinify}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl border border-gray-700 transition-colors text-sm"
          >
            ⚡ Minify XML
          </button>

          <button
            type="button"
            onClick={handleXmlToJson}
            className="px-4 py-2 bg-blue-600/80 hover:bg-blue-500 text-white font-medium rounded-xl border border-blue-500/50 transition-colors text-sm"
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
              setInputXml(SAMPLE_XML);
              setOutputXml(formatXmlString(SAMPLE_XML, indentSize));
            }}
            className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-green-400 text-xs font-mono font-semibold rounded-xl border border-gray-700 transition-colors flex items-center gap-1.5"
          >
            📄 Sample Data
          </button>

          <label className="px-3.5 py-2 bg-gray-800/80 hover:bg-gray-700 text-gray-300 text-xs font-mono rounded-xl cursor-pointer transition-colors">
            📁 Upload File
            <input type="file" accept=".xml" onChange={handleFileUpload} className="hidden" />
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
              setInputXml("");
              setOutputXml("");
            }}
            className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-mono rounded-xl border border-red-900/50 transition-colors"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/80 border border-red-800 rounded-2xl text-red-200 text-xs font-mono space-y-1">
          <p className="font-bold flex items-center gap-2">⚠️ XML Validation Error:</p>
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
              XML Input Data
            </span>
            <span className="font-mono text-xs text-gray-400">
              {inputXml.length} karakter | {inputXml ? inputXml.split("\n").length : 0} baris
            </span>
          </div>

          <textarea
            value={inputXml}
            onChange={(e) => setInputXml(e.target.value)}
            placeholder="Tempel atau ketik kode XML Anda di sini..."
            className="w-full h-[580px] bg-black/60 text-green-300 font-mono text-xs md:text-sm p-4 rounded-xl border border-gray-800 focus:border-green-500 focus:outline-none resize-y leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Output Pane */}
        <div className="card rounded-2xl p-5 flex flex-col space-y-3 w-full">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-blue-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              Formatted XML Output
            </span>
            <span className="font-mono text-xs text-gray-400">
              {currentContent.length} karakter
            </span>
          </div>

          <textarea
            value={currentContent}
            readOnly
            placeholder="Hasil format XML akan tampil di sini..."
            className="w-full h-[580px] bg-black/70 text-blue-200 font-mono text-xs md:text-sm p-4 rounded-xl border border-gray-800 focus:outline-none resize-y leading-relaxed"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
