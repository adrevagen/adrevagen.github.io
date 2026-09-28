import React, { useState } from "react";
import { PDFDocument, PageSizes } from "pdf-lib";

export function ImageToPdf() {
  const [imageItems, setImageItems] = useState([]); // { id, file, name, size, dataUrl, buffer }
  const [orientation, setOrientation] = useState("auto"); // 'auto' | 'portrait' | 'landscape'
  const [pageSize, setPageSize] = useState("a4"); // 'a4' | 'fit'
  const [margin, setMargin] = useState("small"); // 'none' | 'small' | 'big'
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [pdfFileName, setPdfFileName] = useState("images_converted.pdf");
  const [error, setError] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    const validImages = files.filter((f) => f.type.startsWith("image/"));

    if (validImages.length === 0) {
      setError("Silakan pilih file gambar yang valid (JPG, PNG, WEBP).");
      return;
    }

    setError(null);
    setDownloadUrl(null);

    const items = await Promise.all(
      validImages.map(async (file) => {
        const buffer = await file.arrayBuffer();
        const dataUrl = URL.createObjectURL(file);
        return {
          id: Math.random().toString(36).substr(2, 9),
          file,
          name: file.name,
          size: file.size,
          dataUrl,
          buffer
        };
      })
    );

    setImageItems((prev) => [...prev, ...items]);
  };

  const handleRemoveImage = (id) => {
    setImageItems((prev) => prev.filter((item) => item.id !== id));
    setDownloadUrl(null);
  };

  // Drag & Drop Reordering
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

    const newItems = [...imageItems];
    const [movedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, movedItem);

    setImageItems(newItems);
    setDraggedIndex(null);
    setDownloadUrl(null);
  };

  const handleConvertToPdf = async () => {
    if (imageItems.length === 0) {
      setError("Pilih minimal 1 gambar untuk dikonversi.");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const pdfDoc = await PDFDocument.create();

      let marginPx = 0;
      if (margin === "small") marginPx = 20;
      if (margin === "big") marginPx = 40;

      for (const item of imageItems) {
        let embeddedImage;
        const fileType = item.file.type.toLowerCase();

        if (fileType.includes("png")) {
          embeddedImage = await pdfDoc.embedPng(item.buffer);
        } else {
          // Convert WEBP/other format to JPG via Canvas if needed
          const img = new Image();
          img.src = item.dataUrl;
          await img.decode();

          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);

          const jpgDataUrl = canvas.toDataURL("image/jpeg", 0.9);
          const jpgBytes = await fetch(jpgDataUrl).then((r) => r.arrayBuffer());
          embeddedImage = await pdfDoc.embedJpg(jpgBytes);
        }

        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;

        let pageWidth = imgWidth + marginPx * 2;
        let pageHeight = imgHeight + marginPx * 2;

        if (pageSize === "a4") {
          // A4 dimensions
          const [a4W, a4H] = PageSizes.A4;
          let isLandscape = false;

          if (orientation === "landscape") isLandscape = true;
          else if (orientation === "portrait") isLandscape = false;
          else isLandscape = imgWidth > imgHeight;

          pageWidth = isLandscape ? a4H : a4W;
          pageHeight = isLandscape ? a4W : a4H;

          // Scale image to fit inside A4 margins
          const maxW = pageWidth - marginPx * 2;
          const maxH = pageHeight - marginPx * 2;
          const scale = Math.min(maxW / imgWidth, maxH / imgHeight);

          const drawW = imgWidth * scale;
          const drawH = imgHeight * scale;
          const x = (pageWidth - drawW) / 2;
          const y = (pageHeight - drawH) / 2;

          const page = pdfDoc.addPage([pageWidth, pageHeight]);
          page.drawImage(embeddedImage, { x, y, width: drawW, height: drawH });
        } else {
          // Fit image size
          const page = pdfDoc.addPage([pageWidth, pageHeight]);
          page.drawImage(embeddedImage, {
            x: marginPx,
            y: marginPx,
            width: imgWidth,
            height: imgHeight
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setPdfFileName(`images_to_pdf_${Date.now()}.pdf`);
    } catch (err) {
      setError(`Gagal mengonversi Gambar ke PDF: ${err.message}`);
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
      {/* Upload & Options Card */}
      <div className="card rounded-2xl p-6 md:p-8 space-y-6 bg-gray-950/80 border border-gray-800 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <span className="text-2xl">🖼️</span> Image to PDF (Gambar ke PDF)
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Ubah foto JPG, PNG, WEBP menjadi dokumen PDF multi-halaman. Geser kartu gambar untuk mengatur urutan.
            </p>
          </div>

          <label className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-cyan-500 text-black font-semibold rounded-xl cursor-pointer hover:opacity-90 transition-all shadow-lg shadow-green-500/20 text-xs font-mono flex items-center gap-2">
            <span>➕ Tambah Gambar</span>
            <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
          </label>
        </div>

        {/* Upload Dropzone when empty */}
        {imageItems.length === 0 && (
          <label className="border-2 border-dashed border-gray-800 hover:border-green-500/50 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all bg-black/40 hover:bg-black/60 group">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              🖼️
            </div>
            <p className="text-sm font-semibold text-white mb-1">
              Klik atau Seret Gambar (JPG, PNG, WEBP) ke sini
            </p>
            <p className="text-xs text-gray-400 font-mono">
              Mendukung banyak gambar sekaligus & drag & drop urutan
            </p>
            <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
          </label>
        )}

        {/* Loaded Images Settings & Visual Grid */}
        {imageItems.length > 0 && (
          <div className="space-y-6">
            {/* Options Bar */}
            <div className="grid sm:grid-cols-3 gap-4 p-4 bg-black/40 border border-gray-800 rounded-xl">
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1.5 font-bold">Orientasi Halaman:</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-green-400 text-xs font-mono rounded-lg p-2 outline-none"
                >
                  <option value="auto">Otomatis (Ikuti Rasio Gambar)</option>
                  <option value="portrait">Potret (Vertical)</option>
                  <option value="landscape">Lansekap (Horizontal)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1.5 font-bold">Ukuran Halaman:</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-green-400 text-xs font-mono rounded-lg p-2 outline-none"
                >
                  <option value="a4">A4 (Standar Dokumen)</option>
                  <option value="fit">Sesuai Ukuran Gambar (Fit Image)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1.5 font-bold">Margin Halaman:</label>
                <select
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-green-400 text-xs font-mono rounded-lg p-2 outline-none"
                >
                  <option value="none">Tanpa Margin (No Margin)</option>
                  <option value="small">Margin Kecil (Kecil)</option>
                  <option value="big">Margin Besar (Besar)</option>
                </select>
              </div>
            </div>

            {/* Visual Thumbnail Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-gray-400 px-1">
                <span>💡 Geser (drag & drop) gambar untuk mengubah urutan halaman ({imageItems.length} Gambar)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {imageItems.map((item, idx) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    className={`relative group bg-gray-900/90 border rounded-2xl p-3 flex flex-col items-center cursor-grab active:cursor-grabbing transition-all hover:shadow-xl ${
                      draggedIndex === idx
                        ? "border-green-500 opacity-40 scale-95"
                        : "border-gray-800 hover:border-green-500/60"
                    }`}
                  >
                    {/* Badge Number */}
                    <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-green-500 text-black font-mono font-bold text-[11px] flex items-center justify-center shadow-md">
                      {idx + 1}
                    </div>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(item.id)}
                      className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-red-950/80 hover:bg-red-600 text-white text-xs flex items-center justify-center transition-colors shadow"
                      title="Hapus gambar"
                    >
                      ✕
                    </button>

                    {/* Thumbnail Image Container */}
                    <div className="w-full h-44 rounded-xl bg-black/60 border border-gray-800 flex items-center justify-center overflow-hidden mb-3">
                      <img
                        src={item.dataUrl}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain shadow-md rounded"
                      />
                    </div>

                    {/* File Info */}
                    <div className="w-full text-center space-y-1">
                      <p className="text-xs font-semibold text-white truncate max-w-full" title={item.name}>
                        {item.name}
                      </p>
                      <p className="text-[10px] font-mono text-gray-400">{formatBytes(item.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Row */}
            <div className="pt-4 border-t border-gray-800 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => {
                  setImageItems([]);
                  setDownloadUrl(null);
                  setError(null);
                }}
                className="px-4 py-2 bg-red-950/40 text-red-300 border border-red-900/50 hover:bg-red-900/60 text-xs font-mono rounded-xl transition-colors"
              >
                🗑️ Bersihkan Semua
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConvertToPdf}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 text-black font-bold rounded-xl shadow-xl shadow-green-500/25 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Konversi ke PDF...</span>
                  </>
                ) : (
                  <>
                    <span>🖼️ Konversi Gambar ke PDF ({imageItems.length} Gambar)</span>
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

      {/* Result Box */}
      {downloadUrl && (
        <div className="card rounded-2xl p-6 bg-green-950/30 border border-green-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-2xl mx-auto">
            🎉
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Gambar Berhasil Dikonversi ke PDF!</h3>
            <p className="text-xs text-gray-400 mt-1">PDF baru Anda siap diunduh.</p>
          </div>

          <a
            href={downloadUrl}
            download={pdfFileName}
            className="inline-flex items-center gap-2 px-8 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl shadow-lg shadow-green-500/30 transition-all text-sm font-mono"
          >
            <span>📥 Unduh PDF ({pdfFileName})</span>
          </a>
        </div>
      )}
    </div>
  );
}
