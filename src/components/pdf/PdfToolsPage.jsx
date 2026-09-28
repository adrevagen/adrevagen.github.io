import React, { useState, useEffect } from "react";
import { MergePdf } from "./MergePdf";
import { SplitPdf } from "./SplitPdf";
import { CompressPdf } from "./CompressPdf";
import { ImageToPdf } from "./ImageToPdf";
import { PdfToImage } from "./PdfToImage";

const PDF_TABS = [
  {
    id: "merge",
    label: "Merge PDF",
    icon: "🔀",
    desc: "Gabungkan banyak file PDF menjadi 1 dokumen tunggal dengan urutan interaktif"
  },
  {
    id: "split",
    label: "Split PDF",
    icon: "✂️",
    desc: "Pisahkan halaman PDF berdasarkan rentang, halaman terpilih, atau per halaman"
  },
  {
    id: "compress",
    label: "Compress PDF",
    icon: "📦",
    desc: "Kecilkan ukuran file PDF secara efisien langsung di browser"
  },
  {
    id: "img2pdf",
    label: "Image to PDF",
    icon: "🖼️",
    desc: "Ubah kumpulan gambar (JPG, PNG, WEBP) menjadi dokumen PDF multi-halaman"
  },
  {
    id: "pdf2img",
    label: "PDF to Image",
    icon: "📸",
    desc: "Ekstrak setiap halaman dokumen PDF menjadi gambar JPG/PNG resolusi tinggi"
  }
];

export function PdfToolsPage({ initialTab = "merge" }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const activeTabMeta = PDF_TABS.find((t) => t.id === activeTab) || PDF_TABS[0];

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
            Online <span className="gradient-text">PDF Tools Suite</span>
          </h1>
          <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
            Gabungkan, pisahkan, kompres, serta konversi Gambar ke PDF atau PDF ke Gambar secara gratis, cepat, dan aman langsung di browser Anda.
          </p>
        </div>

        {/* PDF Sub-Tool Tabs */}
        <div className="card rounded-2xl p-2 bg-gray-950/90 border border-gray-800 backdrop-blur-md shadow-2xl w-full">
          <div className="flex overflow-x-auto no-scrollbar gap-2 p-1 w-full justify-start md:justify-center">
            {PDF_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-xs md:text-sm whitespace-nowrap transition-all duration-200 select-none ${
                    isActive
                      ? "bg-gradient-to-r from-green-500 to-cyan-500 text-black shadow-lg shadow-green-500/25 scale-[1.02]"
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
            🔒 Tanpa Mengunggah File ke Server
          </span>
        </div>

        {/* Tab Content Panel */}
        <div className="transition-all duration-300 w-full">
          {activeTab === "merge" && <MergePdf />}
          {activeTab === "split" && <SplitPdf />}
          {activeTab === "compress" && <CompressPdf />}
          {activeTab === "img2pdf" && <ImageToPdf />}
          {activeTab === "pdf2img" && <PdfToImage />}
        </div>
      </div>
    </section>
  );
}
