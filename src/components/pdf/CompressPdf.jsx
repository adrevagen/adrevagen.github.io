import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export function CompressPdf() {
  const [pdfFile, setPdfFile] = useState(null);
  const [buffer, setBuffer] = useState(null);
  const [compressionLevel, setCompressionLevel] = useState("recommended"); // 'extreme' | 'recommended' | 'low'
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressedResult, setCompressedResult] = useState(null); // { url, name, origSize, newSize, savings }
  const [error, setError] = useState(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setError("Silakan pilih file PDF yang valid.");
      return;
    }

    try {
      setError(null);
      setCompressedResult(null);
      const arrayBuffer = await file.arrayBuffer();
      setPdfFile(file);
      setBuffer(arrayBuffer);
    } catch (err) {
      setError(`Gagal membaca file PDF: ${err.message}`);
    }
  };

  const handleCompress = async () => {
    if (!pdfFile || !buffer) return;

    try {
      setIsProcessing(true);
      setError(null);
      setCompressedResult(null);

      // Compression settings preset
      let scale = 1.2;
      let quality = 0.65;

      if (compressionLevel === "extreme") {
        scale = 0.9;
        quality = 0.45;
      } else if (compressionLevel === "recommended") {
        scale = 1.2;
        quality = 0.65;
      } else if (compressionLevel === "low") {
        scale = 1.5;
        quality = 0.85;
      }

      // Load with pdfjs to render pages
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) });
      const pdfDocJs = await loadingTask.promise;
      const totalPages = pdfDocJs.numPages;

      const newPdfDoc = await PDFDocument.create();

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdfDocJs.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        const imgDataUrl = canvas.toDataURL("image/jpeg", quality);
        const imgBytes = await fetch(imgDataUrl).then((res) => res.arrayBuffer());

        const embeddedImg = await newPdfDoc.embedJpg(imgBytes);

        // Add page matching viewport aspect ratio
        const newPage = newPdfDoc.addPage([embeddedImg.width, embeddedImg.height]);
        newPage.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: embeddedImg.width,
          height: embeddedImg.height
        });
      }

      const compressedBytes = await newPdfDoc.save();
      const blob = new Blob([compressedBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const origSize = pdfFile.size;
      const newSize = blob.size;
      const savings = (((origSize - newSize) / origSize) * 100).toFixed(1);

      setCompressedResult({
        url,
        name: `${pdfFile.name.replace(".pdf", "")}_compressed.pdf`,
        origSize,
        newSize,
        savings
      });
    } catch (err) {
      setError(`Gagal mengkompres PDF: ${err.message}`);
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
              <span className="text-2xl">📦</span> Compress PDF (Kecilkan Ukuran PDF)
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Kurangi ukuran file PDF langsung di browser dengan tetap menjaga kualitas visual.
            </p>
          </div>

          {pdfFile && (
            <label className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs font-mono rounded-xl cursor-pointer transition-colors">
              🔄 Ganti File PDF
              <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
            </label>
          )}
        </div>

        {/* Upload Drop Zone when empty */}
        {!pdfFile && (
          <label className="border-2 border-dashed border-gray-800 hover:border-green-500/50 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all bg-black/40 hover:bg-black/60 group">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              📦
            </div>
            <p className="text-sm font-semibold text-white mb-1">
              Klik atau Seret 1 File PDF ke sini
            </p>
            <p className="text-xs text-gray-400 font-mono">
              Kompresi cerdas 100% Client-side tanpa mengunggah file ke server
            </p>
            <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
          </label>
        )}

        {/* File Meta & Compression Presets */}
        {pdfFile && (
          <div className="space-y-6">
            {/* File Info */}
            <div className="flex items-center justify-between p-4 bg-black/60 border border-gray-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-400 font-bold flex items-center justify-center text-xl">
                  📄
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{pdfFile.name}</h3>
                  <p className="text-xs font-mono text-gray-400">
                    Ukuran Asli: <span className="text-amber-300 font-bold">{formatBytes(pdfFile.size)}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPdfFile(null);
                  setBuffer(null);
                  setCompressedResult(null);
                  setError(null);
                }}
                className="text-xs font-mono text-red-400 hover:text-red-300"
              >
                Hapus
              </button>
            </div>

            {/* Compression Presets */}
            <div className="space-y-3">
              <label className="font-mono text-xs text-gray-400 uppercase font-bold tracking-wider block">
                Pilih Tingkat Kompresi:
              </label>

              <div className="grid sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setCompressionLevel("extreme")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    compressionLevel === "extreme"
                      ? "bg-green-500/10 border-green-500 text-green-400 font-semibold"
                      : "bg-black/40 border-gray-800 text-gray-300 hover:bg-black/60"
                  }`}
                >
                  <div className="text-base mb-1">⚡ Extreme Compression</div>
                  <div className="text-xs opacity-70">Ukuran terkecil, penurunan kualitas sedang</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCompressionLevel("recommended")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    compressionLevel === "recommended"
                      ? "bg-green-500/10 border-green-500 text-green-400 font-semibold"
                      : "bg-black/40 border-gray-800 text-gray-300 hover:bg-black/60"
                  }`}
                >
                  <div className="text-base mb-1">⭐ Recommended</div>
                  <div className="text-xs opacity-70">Kompresi tinggi dengan kualitas visual bagus</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCompressionLevel("low")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    compressionLevel === "low"
                      ? "bg-green-500/10 border-green-500 text-green-400 font-semibold"
                      : "bg-black/40 border-gray-800 text-gray-300 hover:bg-black/60"
                  }`}
                >
                  <div className="text-base mb-1">🎨 Less Compression</div>
                  <div className="text-xs opacity-70">Kualitas visual sangat tinggi, penurunan ukuran sedikit</div>
                </button>
              </div>
            </div>

            {/* Action Row */}
            <div className="pt-4 border-t border-gray-800 flex justify-end">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCompress}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 text-black font-bold rounded-xl shadow-xl shadow-green-500/25 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Memproses Kompresi...</span>
                  </>
                ) : (
                  <>
                    <span>📦 Kompres PDF Sekarang</span>
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
      {compressedResult && (
        <div className="card rounded-2xl p-6 bg-green-950/30 border border-green-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-2xl mx-auto">
            🎉
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Kompresi PDF Berhasil!</h3>
            <div className="flex items-center justify-center gap-4 text-xs font-mono mt-2">
              <span className="text-gray-400">Asli: <strong className="text-white">{formatBytes(compressedResult.origSize)}</strong></span>
              <span>➔</span>
              <span className="text-green-400">Hasil: <strong className="text-green-300">{formatBytes(compressedResult.newSize)}</strong></span>
              <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold">
                Hemat {compressedResult.savings}%
              </span>
            </div>
          </div>

          <a
            href={compressedResult.url}
            download={compressedResult.name}
            className="inline-flex items-center gap-2 px-8 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl shadow-lg shadow-green-500/30 transition-all text-sm font-mono"
          >
            <span>📥 Unduh Compressed PDF ({compressedResult.name})</span>
          </a>
        </div>
      )}
    </div>
  );
}
