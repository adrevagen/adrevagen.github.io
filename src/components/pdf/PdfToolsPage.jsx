import React, { useState, useEffect } from "react";
import { MergePdf } from "./MergePdf";
import { SplitPdf } from "./SplitPdf";

export function PdfToolsPage({ initialTab = "merge" }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <section className="section py-8 px-4 md:px-8 lg:px-12 w-full max-w-[1920px] mx-auto min-h-screen">
      <div className="space-y-6 w-full">
        {/* Page Header */}
        <div className="text-center space-y-2 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            100% PRIVATE CLIENT-SIDE PDF PROCESSING
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Online <span className="gradient-text">PDF Tools</span>
          </h1>
          <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
            Gabungkan (Merge) atau pisahkan (Split) dokumen PDF Anda langsung di browser secara gratis, aman, dan tanpa mengunggah file ke server luar.
          </p>
        </div>

        {/* PDF Sub-Tool Tabs */}
        <div className="card rounded-2xl p-2 bg-gray-950/90 border border-gray-800 backdrop-blur-md shadow-2xl w-full max-w-2xl mx-auto">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("merge")}
              className={`flex items-center justify-center gap-2.5 py-3 rounded-xl font-semibold text-xs md:text-sm transition-all duration-200 select-none ${
                activeTab === "merge"
                  ? "bg-gradient-to-r from-green-500 to-cyan-500 text-black shadow-lg shadow-green-500/25 scale-[1.02]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-lg">🔀</span>
              <span>Merge PDF (Gabung PDF)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("split")}
              className={`flex items-center justify-center gap-2.5 py-3 rounded-xl font-semibold text-xs md:text-sm transition-all duration-200 select-none ${
                activeTab === "split"
                  ? "bg-gradient-to-r from-green-500 to-cyan-500 text-black shadow-lg shadow-green-500/25 scale-[1.02]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-lg">✂️</span>
              <span>Split PDF (Pisah PDF)</span>
            </button>
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="transition-all duration-300 w-full">
          {activeTab === "merge" ? <MergePdf /> : <SplitPdf />}
        </div>
      </div>
    </section>
  );
}
