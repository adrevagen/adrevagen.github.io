import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { renderPdfPageThumbnail } from "./pdfThumbnail";

export function MergePdf() {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [mergedFileName, setMergedFileName] = useState("merged.pdf");
  const [error, setError] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validPdfs = selectedFiles.filter((file) => file.type === "application/pdf" || file.name.endsWith(".pdf"));

    if (validPdfs.length === 0) {
      setError("Silakan pilih file PDF yang valid.");
      return;
    }

    setError(null);
    setDownloadUrl(null);

    // Read page counts and render page 1 thumbnails for each PDF
    const fileItems = await Promise.all(
      validPdfs.map(async (file) => {
        try {
          const buffer = await file.arrayBuffer();
          const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
          const pageCount = doc.getPageCount();

          // Render thumbnail of first page
          const thumbnailUrl = await renderPdfPageThumbnail(buffer, 1, 0.35);

          return {
            id: Math.random().toString(36).substr(2, 9),
            file,
            name: file.name,
            size: file.size,
            pageCount,
            thumbnailUrl,
            buffer
          };
        } catch (err) {
          return {
            id: Math.random().toString(36).substr(2, 9),
            file,
            name: file.name,
            size: file.size,
            pageCount: "?",
            thumbnailUrl: null,
            error: "Gagal membaca PDF (Mungkin dilindungi kata sandi)"
          };
        }
      })
    );

    setPdfFiles((prev) => [...prev, ...fileItems]);
  };

  const handleRemoveFile = (id) => {
    setPdfFiles((prev) => prev.filter((item) => item.id !== id));
    setDownloadUrl(null);
  };

  const handleMoveFile = (index, direction) => {
    const newFiles = [...pdfFiles];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newFiles.length) return;
    const temp = newFiles[index];
    newFiles[index] = newFiles[targetIndex];
    newFiles[targetIndex] = temp;
    setPdfFiles(newFiles);
    setDownloadUrl(null);
  };

  // Drag & Drop Handlers for reordering cards
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

    const newFiles = [...pdfFiles];
    const [movedItem] = newFiles.splice(draggedIndex, 1);
    newFiles.splice(dropIndex, 0, movedItem);

    setPdfFiles(newFiles);
    setDraggedIndex(null);
    setDownloadUrl(null);
  };

  const handleMerge = async () => {
    if (pdfFiles.length < 2) {
      setError("Pilih minimal 2 file PDF untuk digabungkan.");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const mergedPdf = await PDFDocument.create();

      for (const item of pdfFiles) {
        if (item.error) continue;
        const pdfDoc = await PDFDocument.load(item.buffer, { ignoreEncryption: true });
        const pageIndices = pdfDoc.getPageIndices();
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pageIndices);
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setMergedFileName(`merged_${Date.now()}.pdf`);
    } catch (err) {
      setError(`Gagal menggabungkan PDF: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPages = pdfFiles.reduce((acc, cur) => acc + (typeof cur.pageCount === "number" ? cur.pageCount : 0), 0);
  const totalSize = pdfFiles.reduce((acc, cur) => acc + cur.size, 0);

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
              <span className="text-2xl">🔀</span> Merge PDF (Gabung PDF)
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Geser (drag & drop) thumbnail kartu untuk mengurutkan file sebelum digabungkan.
            </p>
          </div>

          <label className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-cyan-500 text-black font-semibold rounded-xl cursor-pointer hover:opacity-90 transition-all shadow-lg shadow-green-500/20 text-xs font-mono flex items-center gap-2">
            <span>➕ Tambah File PDF</span>
            <input type="file" accept=".pdf" multiple onChange={handleFileSelect} className="hidden" />
          </label>
        </div>

        {/* Drag & Drop Upload Area when empty */}
        {pdfFiles.length === 0 && (
          <label className="border-2 border-dashed border-gray-800 hover:border-green-500/50 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all bg-black/40 hover:bg-black/60 group">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              🔀
            </div>
            <p className="text-sm font-semibold text-white mb-1">
              Klik atau Seret file PDF ke sini
            </p>
            <p className="text-xs text-gray-400 font-mono">
              Pratinjau thumbnail interaktif & drag & drop urutan (100% Aman & Diproses Lokal)
            </p>
            <input type="file" accept=".pdf" multiple onChange={handleFileSelect} className="hidden" />
          </label>
        )}

        {/* Visual Drag & Drop Thumbnail Grid */}
        {pdfFiles.length > 0 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400 px-1">
              <span>💡 Geser / Drag kartu PDF untuk mengubah urutan ({pdfFiles.length} File | {totalPages} Halaman Total)</span>
              <span>Total ukuran: {formatBytes(totalSize)}</span>
            </div>

            {/* Thumbnail Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {pdfFiles.map((item, idx) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  className={`relative group bg-gray-900/90 border rounded-2xl p-3 flex flex-col items-center cursor-grab active:cursor-grabbing transition-all hover:shadow-xl ${
                    draggedIndex === idx
                      ? "border-green-500 opacity-40 scale-95"
                      : "border-gray-800 hover:border-green-500/60 hover:bg-gray-900"
                  }`}
                >
                  {/* Badge Number */}
                  <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-green-500 text-black font-mono font-bold text-[11px] flex items-center justify-center shadow-md">
                    {idx + 1}
                  </div>

                  {/* Drag Handle & Delete Button */}
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(item.id);
                      }}
                      className="w-6 h-6 rounded-full bg-red-950/80 hover:bg-red-600 text-white text-xs flex items-center justify-center transition-colors shadow"
                      title="Hapus file"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Thumbnail Image Container */}
                  <div className="w-full h-44 rounded-xl bg-black/60 border border-gray-800 flex items-center justify-center overflow-hidden mb-3 relative group-hover:border-gray-700">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain shadow-md rounded"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-500 p-2 text-center">
                        <span className="text-3xl mb-1">📄</span>
                        <span className="text-[10px] font-mono">PDF Preview</span>
                      </div>
                    )}
                  </div>

                  {/* File Metadata */}
                  <div className="w-full text-center space-y-1">
                    <p className="text-xs font-semibold text-white truncate max-w-full" title={item.name}>
                      {item.name}
                    </p>
                    <div className="flex items-center justify-center gap-1 text-[11px] font-mono text-gray-400">
                      <span className="bg-gray-800 px-1.5 py-0.5 rounded text-green-400 font-bold">
                        {item.pageCount} hal
                      </span>
                      <span>•</span>
                      <span>{formatBytes(item.size)}</span>
                    </div>
                  </div>

                  {/* Reorder Buttons (For Touch/Accessibility) */}
                  <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-gray-800/80 w-full justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveFile(idx, -1)}
                      className="px-2 py-0.5 text-[10px] font-mono bg-gray-800 hover:bg-gray-700 disabled:opacity-30 rounded text-gray-300"
                      title="Geser ke kiri"
                    >
                      ◀
                    </button>
                    <span className="text-[10px] font-mono text-gray-500">Urutan</span>
                    <button
                      type="button"
                      disabled={idx === pdfFiles.length - 1}
                      onClick={() => handleMoveFile(idx, 1)}
                      className="px-2 py-0.5 text-[10px] font-mono bg-gray-800 hover:bg-gray-700 disabled:opacity-30 rounded text-gray-300"
                      title="Geser ke kanan"
                    >
                      ▶
                    </button>
                  </div>
                </div>
              ))}

              {/* Add More Files Card */}
              <label className="border-2 border-dashed border-gray-800 hover:border-green-500/50 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all bg-black/30 hover:bg-black/50 h-56 text-center group">
                <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform">
                  ➕
                </div>
                <span className="text-xs font-semibold text-gray-300">Tambah File</span>
                <span className="text-[10px] font-mono text-gray-500 mt-1">PDF Lainnya</span>
                <input type="file" accept=".pdf" multiple onChange={handleFileSelect} className="hidden" />
              </label>
            </div>

            {/* Merge Action Row */}
            <div className="pt-4 border-t border-gray-800 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => {
                  setPdfFiles([]);
                  setDownloadUrl(null);
                  setError(null);
                }}
                className="px-4 py-2 bg-red-950/40 text-red-300 border border-red-900/50 hover:bg-red-900/60 text-xs font-mono rounded-xl transition-colors"
              >
                🗑️ Bersihkan Semua
              </button>

              <button
                type="button"
                disabled={isProcessing || pdfFiles.length < 2}
                onClick={handleMerge}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 text-black font-bold rounded-xl shadow-xl shadow-green-500/25 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Proses Menggabungkan...</span>
                  </>
                ) : (
                  <>
                    <span>🔀 Gabungkan PDF Sekarang ({pdfFiles.length} File)</span>
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

      {/* Download Success Box */}
      {downloadUrl && (
        <div className="card rounded-2xl p-6 bg-green-950/30 border border-green-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-2xl mx-auto">
            🎉
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">PDF Berhasil Digabungkan!</h3>
            <p className="text-xs text-gray-400 mt-1">Dokumen gabungan siap diunduh secara instant.</p>
          </div>

          <a
            href={downloadUrl}
            download={mergedFileName}
            className="inline-flex items-center gap-2 px-8 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl shadow-lg shadow-green-500/30 transition-all text-sm font-mono"
          >
            <span>📥 Unduh Merged PDF ({mergedFileName})</span>
          </a>
        </div>
      )}
    </div>
  );
}
