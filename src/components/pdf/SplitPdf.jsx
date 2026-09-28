import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { renderAllPageThumbnails } from "./pdfThumbnail";

export function SplitPdf() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [buffer, setBuffer] = useState(null);
  const [pageThumbnails, setPageThumbnails] = useState([]);
  const [pageOrder, setPageOrder] = useState([]); // List of page objects { pageNum, id, dataUrl }
  const [splitMode, setSplitMode] = useState("select"); // 'select' | 'range' | 'all'
  const [pageRangeStr, setPageRangeStr] = useState("1");
  const [selectedPageNums, setSelectedPageNums] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState(false);
  const [downloadUrls, setDownloadUrls] = useState([]);
  const [error, setError] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setError("Silakan pilih file PDF yang valid.");
      return;
    }

    try {
      setError(null);
      setDownloadUrls([]);
      setIsLoadingThumbnails(true);

      const arrayBuffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const count = doc.getPageCount();

      setPdfFile(file);
      setPageCount(count);
      setBuffer(arrayBuffer);
      setPageRangeStr(`1-${Math.min(count, 3)}`);

      // Render thumbnails for all pages
      const thumbs = await renderAllPageThumbnails(arrayBuffer, 50, 0.3);
      setPageThumbnails(thumbs);

      const initialPageOrder = Array.from({ length: count }, (_, i) => {
        const pageNum = i + 1;
        const thumbObj = thumbs.find((t) => t.pageNum === pageNum);
        return {
          id: Math.random().toString(36).substr(2, 9),
          pageNum,
          dataUrl: thumbObj ? thumbObj.dataUrl : null
        };
      });

      setPageOrder(initialPageOrder);
      setSelectedPageNums(Array.from({ length: count }, (_, i) => i + 1));
    } catch (err) {
      setError(`Gagal membaca file PDF: ${err.message}`);
    } finally {
      setIsLoadingThumbnails(false);
    }
  };

  const parseRanges = (str, total) => {
    const pages = new Set();
    const parts = str.split(",");

    parts.forEach((part) => {
      const range = part.trim().split("-");
      if (range.length === 1) {
        const num = parseInt(range[0], 10);
        if (!isNaN(num) && num >= 1 && num <= total) {
          pages.add(num);
        }
      } else if (range.length === 2) {
        const start = parseInt(range[0], 10);
        const end = parseInt(range[1], 10);
        if (!isNaN(start) && !isNaN(end)) {
          const from = Math.max(1, Math.min(start, end));
          const to = Math.min(total, Math.max(start, end));
          for (let i = from; i <= to; i++) {
            pages.add(i);
          }
        }
      }
    });

    return Array.from(pages);
  };

  // Drag & Drop Handlers for reordering pages
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newOrder = [...pageOrder];
    const [movedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, movedItem);

    setPageOrder(newOrder);
    setDraggedIndex(null);
  };

  const togglePageSelection = (pageNum) => {
    setSelectedPageNums((prev) =>
      prev.includes(pageNum) ? prev.filter((p) => p !== pageNum) : [...prev, pageNum]
    );
  };

  const handleSplit = async () => {
    if (!pdfFile || !buffer) return;

    try {
      setIsProcessing(true);
      setError(null);
      setDownloadUrls([]);

      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      if (splitMode === "all") {
        // Extract each page into individual PDF
        const urls = [];
        for (let i = 0; i < pageCount; i++) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(srcDoc, [i]);
          newPdf.addPage(copiedPage);

          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          urls.push({
            name: `${pdfFile.name.replace(".pdf", "")}_page_${i + 1}.pdf`,
            url,
            label: `Halaman ${i + 1}`
          });
        }
        setDownloadUrls(urls);
      } else {
        // Select or Range Mode using visual page order
        let targetPageNums = [];

        if (splitMode === "select") {
          targetPageNums = pageOrder
            .filter((p) => selectedPageNums.includes(p.pageNum))
            .map((p) => p.pageNum);
        } else if (splitMode === "range") {
          const validNums = parseRanges(pageRangeStr, pageCount);
          targetPageNums = pageOrder
            .filter((p) => validNums.includes(p.pageNum))
            .map((p) => p.pageNum);
        }

        if (targetPageNums.length === 0) {
          throw new Error("Pilih minimal 1 halaman untuk dipisah.");
        }

        const newPdf = await PDFDocument.create();
        const pageIndices = targetPageNums.map((num) => num - 1);
        const copiedPages = await newPdf.copyPages(srcDoc, pageIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));

        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        setDownloadUrls([
          {
            name: `${pdfFile.name.replace(".pdf", "")}_split.pdf`,
            url,
            label: `${targetPageNums.length} Halaman Terpisah`
          }
        ]);
      }
    } catch (err) {
      setError(`Gagal memisah PDF: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-6 w-full">
      {/* Upload & Controls Section */}
      <div className="card rounded-2xl p-6 md:p-8 space-y-6 bg-gray-950/80 border border-gray-800 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <span className="text-2xl">✂️</span> Split PDF (Pisahkan PDF)
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Klik thumbnail halaman untuk memilih dan geser (drag & drop) halaman untuk mengubah urutan pemisahan.
            </p>
          </div>

          {pdfFile && (
            <label className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs font-mono rounded-xl cursor-pointer transition-colors">
              🔄 Ganti File PDF
              <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
            </label>
          )}
        </div>

        {/* Drag & Drop Upload Area when empty */}
        {!pdfFile && (
          <label className="border-2 border-dashed border-gray-800 hover:border-green-500/50 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all bg-black/40 hover:bg-black/60 group">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              ✂️
            </div>
            <p className="text-sm font-semibold text-white mb-1">
              Klik atau Seret 1 File PDF ke sini
            </p>
            <p className="text-xs text-gray-400 font-mono">
              Pratinjau thumbnail halaman visual & drag & drop urutan (100% Aman)
            </p>
            <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
          </label>
        )}

        {/* File Loaded Configuration & Visual Thumbnails */}
        {pdfFile && (
          <div className="space-y-6">
            {/* File Meta Info */}
            <div className="flex items-center justify-between p-4 bg-black/60 border border-gray-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 font-bold flex items-center justify-center text-xl">
                  📄
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{pdfFile.name}</h3>
                  <p className="text-xs font-mono text-gray-400">
                    {pageCount} Total Halaman | {formatBytes(pdfFile.size)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPdfFile(null);
                  setBuffer(null);
                  setPageOrder([]);
                  setDownloadUrls([]);
                  setError(null);
                }}
                className="text-xs font-mono text-red-400 hover:text-red-300"
              >
                Hapus File
              </button>
            </div>

            {/* Split Mode Selector */}
            <div className="space-y-3">
              <label className="font-mono text-xs text-gray-400 uppercase font-bold tracking-wider block">
                Pilih Mode Pemisahan (Split Mode):
              </label>

              <div className="grid sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSplitMode("select")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    splitMode === "select"
                      ? "bg-green-500/10 border-green-500 text-green-400 font-semibold"
                      : "bg-black/40 border-gray-800 text-gray-300 hover:bg-black/60"
                  }`}
                >
                  <div className="text-base mb-1">🎯 Visual Thumbnail Picker</div>
                  <div className="text-xs opacity-70">Klik & Geser thumbnail halaman langsung</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSplitMode("range")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    splitMode === "range"
                      ? "bg-green-500/10 border-green-500 text-green-400 font-semibold"
                      : "bg-black/40 border-gray-800 text-gray-300 hover:bg-black/60"
                  }`}
                >
                  <div className="text-base mb-1">🔢 Rentang Halaman</div>
                  <div className="text-xs opacity-70">Ketik rentang (Contoh: 1-3, 5, 8-10)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSplitMode("all")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    splitMode === "all"
                      ? "bg-green-500/10 border-green-500 text-green-400 font-semibold"
                      : "bg-black/40 border-gray-800 text-gray-300 hover:bg-black/60"
                  }`}
                >
                  <div className="text-base mb-1">⚡ Ekstrak Semua Halaman</div>
                  <div className="text-xs opacity-70">1 file PDF per halaman</div>
                </button>
              </div>
            </div>

            {/* Range Mode Input Bar */}
            {splitMode === "range" && (
              <div className="space-y-2 p-4 bg-black/40 rounded-xl border border-gray-800">
                <label className="text-xs font-mono text-gray-300 block">
                  Masukkan Rentang Halaman (Total {pageCount} Halaman):
                </label>
                <input
                  type="text"
                  value={pageRangeStr}
                  onChange={(e) => setPageRangeStr(e.target.value)}
                  placeholder="Contoh: 1-3, 5, 7-10"
                  className="w-full px-4 py-2.5 bg-black/60 border border-gray-700 rounded-xl font-mono text-sm text-green-300 focus:border-green-400 focus:outline-none"
                />
              </div>
            )}

            {/* Visual Interactive Page Thumbnail Cards Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gray-300 font-bold">
                  Pratinjau Halaman ({selectedPageNums.length} dari {pageCount} Dipilih):
                </span>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-gray-500 hidden sm:inline">💡 Geser (drag) thumbnail untuk mengubah urutan</span>
                  <button
                    type="button"
                    onClick={() => setSelectedPageNums(Array.from({ length: pageCount }, (_, i) => i + 1))}
                    className="text-green-400 hover:underline"
                  >
                    Pilih Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPageNums([])}
                    className="text-red-400 hover:underline"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {isLoadingThumbnails ? (
                <div className="p-8 text-center font-mono text-xs text-gray-400 flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                  <span>Membuat thumbnail halaman...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-h-[520px] overflow-y-auto p-1">
                  {pageOrder.map((item, idx) => {
                    const isSelected = selectedPageNums.includes(item.pageNum);
                    return (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDrop={(e) => handleDrop(e, idx)}
                        onClick={() => togglePageSelection(item.pageNum)}
                        className={`relative group bg-gray-900/90 border rounded-2xl p-3 flex flex-col items-center cursor-pointer active:cursor-grabbing transition-all hover:shadow-xl ${
                          isSelected
                            ? "border-green-500 bg-green-500/5 ring-1 ring-green-500/30"
                            : "border-gray-800 opacity-60 hover:opacity-100"
                        } ${draggedIndex === idx ? "opacity-30 scale-95" : ""}`}
                      >
                        {/* Page Checkbox Selection Indicator */}
                        <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                          <div
                            className={`w-6 h-6 rounded-lg font-mono text-xs flex items-center justify-center font-bold shadow-md transition-all ${
                              isSelected
                                ? "bg-green-500 text-black shadow-green-500/30"
                                : "bg-gray-800 text-gray-400 border border-gray-700"
                            }`}
                          >
                            {isSelected ? "✓" : item.pageNum}
                          </div>
                        </div>

                        {/* Page Number Badge */}
                        <div className="absolute top-2 right-2 z-10 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-gray-300">
                          Hal {item.pageNum}
                        </div>

                        {/* Thumbnail Image Container */}
                        <div className="w-full h-44 rounded-xl bg-black/60 border border-gray-800 flex items-center justify-center overflow-hidden mb-2 mt-6 group-hover:border-gray-700">
                          {item.dataUrl ? (
                            <img
                              src={item.dataUrl}
                              alt={`Halaman ${item.pageNum}`}
                              className="max-h-full max-w-full object-contain shadow-md rounded"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-gray-500 p-2 text-center">
                              <span className="text-2xl mb-1">📄</span>
                              <span className="text-[10px] font-mono">Halaman {item.pageNum}</span>
                            </div>
                          )}
                        </div>

                        {/* Card Footer Status */}
                        <span className={`text-[11px] font-mono font-medium ${isSelected ? "text-green-400" : "text-gray-500"}`}>
                          {isSelected ? "Termasuk" : "Dilewati"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Row */}
            <div className="pt-4 border-t border-gray-800 flex justify-end">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSplit}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 text-black font-bold rounded-xl shadow-xl shadow-green-500/25 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Memproses Pemisahan...</span>
                  </>
                ) : (
                  <>
                    <span>✂️ Pisahkan PDF Sekarang ({selectedPageNums.length} Halaman)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-950/80 border border-red-800 rounded-2xl text-red-200 text-xs font-mono">
          ⚠️ {error}
        </div>
      )}

      {/* Download Links Box */}
      {downloadUrls.length > 0 && (
        <div className="card rounded-2xl p-6 bg-green-950/30 border border-green-500/30 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xl flex-shrink-0">
              🎉
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Pemisahan PDF Berhasil!</h3>
              <p className="text-xs text-gray-400">Total {downloadUrls.length} file PDF siap diunduh.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto">
            {downloadUrls.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                download={item.name}
                className="flex items-center justify-between p-3.5 bg-black/60 border border-gray-800 hover:border-green-500/50 rounded-xl text-xs font-mono text-white transition-all group"
              >
                <div className="truncate mr-2">
                  <p className="font-semibold truncate">{item.label}</p>
                  <p className="text-[10px] text-gray-400 truncate">{item.name}</p>
                </div>
                <span className="px-2.5 py-1 bg-green-500/20 text-green-400 rounded-lg group-hover:bg-green-500 group-hover:text-black font-bold transition-all flex-shrink-0">
                  Unduh
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
