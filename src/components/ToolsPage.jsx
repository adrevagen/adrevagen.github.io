import React, { useState } from "react";
import { HtmlFormatter } from "./formatters/HtmlFormatter";
import { XmlFormatter } from "./formatters/XmlFormatter";
import { JsonFormatter } from "./formatters/JsonFormatter";
import { YamlFormatter } from "./formatters/YamlFormatter";
import { JsonViewer } from "./viewers/JsonViewer";
import { YamlViewer } from "./viewers/YamlViewer";

const TABS = [
  {
    id: "html-formatter",
    label: "HTML Formatter",
    icon: "🌐",
    desc: "Format, beautify, minify dan live render data HTML"
  },
  {
    id: "xml-formatter",
    label: "XML Formatter",
    icon: "📄",
    desc: "Format, validasi, minify dan konversi XML ke JSON"
  },
  {
    id: "json-formatter",
    label: "JSON Formatter",
    icon: "⚙️",
    desc: "Format, minify, urutkan key dan perbaiki objek JSON"
  },
  {
    id: "yaml-formatter",
    label: "YAML Formatter",
    icon: "📋",
    desc: "Format, validasi dan konversi YAML ke JSON"
  },
  {
    id: "json-viewer",
    label: "JSON Viewer",
    icon: "🌳",
    desc: "Inspektur pohon interaktif & pencarian node untuk JSON"
  },
  {
    id: "yaml-viewer",
    label: "YAML Viewer",
    icon: "🌿",
    desc: "Inspektur pohon interaktif & pencarian node untuk YAML"
  }
];

export function ToolsPage() {
  const [activeTab, setActiveTab] = useState("html-formatter");

  const activeTabMeta = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <section className="section py-8 px-4 md:px-8 lg:px-12 w-full max-w-[1920px] mx-auto min-h-screen">
      <div className="space-y-6 w-full">
        {/* Page Title Header */}
        <div className="text-center space-y-2 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            ONLINE DATA FORMATTERS & TREE VIEWERS
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Developer <span className="gradient-text">Data Tools</span>
          </h1>
          <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
            Format, validasi, kompresi, dan inspeksi visual data HTML, XML, JSON, dan YAML langsung di browser Anda.
          </p>
        </div>

        {/* Tab Navigation Bar */}
        <div className="card rounded-2xl p-2 bg-gray-950/90 border border-gray-800 backdrop-blur-md shadow-2xl w-full">
          <div className="flex overflow-x-auto no-scrollbar gap-2 p-1 w-full justify-start md:justify-center">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium text-xs md:text-sm whitespace-nowrap transition-all duration-200 select-none ${
                    isActive
                      ? "bg-gradient-to-r from-green-500 to-cyan-500 text-black font-semibold shadow-lg shadow-green-500/25 scale-[1.02]"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Description Banner */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-gray-900/60 rounded-xl border border-gray-800/80 text-xs font-mono text-gray-400 w-full">
          <div className="flex items-center gap-3">
            <span className="text-lg">{activeTabMeta.icon}</span>
            <span className="text-white font-semibold">{activeTabMeta.label}:</span>
            <span>{activeTabMeta.desc}</span>
          </div>
          <span className="hidden sm:inline-block text-[11px] text-green-400/80">
            🔒 100% Client-side Processing
          </span>
        </div>

        {/* Tab Content Panel */}
        <div className="transition-all duration-300 w-full">
          {activeTab === "html-formatter" && <HtmlFormatter />}
          {activeTab === "xml-formatter" && <XmlFormatter />}
          {activeTab === "json-formatter" && <JsonFormatter />}
          {activeTab === "yaml-formatter" && <YamlFormatter />}
          {activeTab === "json-viewer" && <JsonViewer />}
          {activeTab === "yaml-viewer" && <YamlViewer />}
        </div>
      </div>
    </section>
  );
}
