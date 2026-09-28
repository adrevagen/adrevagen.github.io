import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export function PdfToImage() {
  const [pdfFile, setPdfFile] = useState(null);
  const [buffer, setBuffer] = useState(null);
  const [imageFormat, setImageFormat] = useState("jpeg"); // 'jpeg' | 'png'
  const [scale, setScale] = useState(2.0); // 1.5 = Standard, 2.5 = High DPI
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedImages, setConvertedImages] = useState([]); // { pageNum, dataUrl, blob }
  const [zipDownloadUrl, setZipDownloadUrl] = useState(null);
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
      setConvertedImages([]);
      setZipDownloadUrl(null);
      const arrayBuffer = await file.arrayBuffer();
      setPdfFile(file);
      setBuffer(arrayBuffer);
    } catch (err) {
      setError(`Gagal membaca file PDF: ${err.message}`);
    }
  };

  const handleConvert = async () => {
    if (!pdfFile || !buffer) return;

    try {
      setIsProcessing(true);
      setError(null);
      setConvertedImages([]);
      setZipDownloadUrl(null);

      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) });
      const pdfDoc = await loadingTask.promise;
      const totalPages = pdfDoc.numPages;

      const images = [];
      const zip = new JSZip();
      const baseName = pdfFile.name.replace(".pdf", "");

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        const mimeType = imageFormat === "png" ? "image/png" : "image/jpeg";
        const ext = imageFormat === "png" ? "png" : "jpg";
        const dataUrl = canvas.toDataURL(mimeType, 0.92);

        // Convert dataUrl to blob for zip
        const res = await fetch(dataUrl);
        const blob = await res.blob();

        const fileName = `${baseName}_page_${i}.${ext}`;
        zip.file(fileName, blob);

        images.push({
          pageNum: i,
          fileName,
          dataUrl,
          blobUrl: URL.createObjectURL(blob)
        });
      }

      setConvertedImages(images);

      // Generate ZIP blob for batch download
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);
      setZipDownloadUrl(zipUrl);
    } catch (err) {
      setError(`Gagal mengonversi PDF ke Gambar: ${err.message}`);
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
              <span className="text-2xl">📸</span> PDF to Image (PDF ke Gambar)
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Ekstrak setiap halaman dokumen PDF menjadi gambar JPG atau PNG resolusi tinggi secara instan.
            </p>
          </div>

          {pdfFile && (
            <label className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs font-mono rounded-xl cursor-pointer transition-colors">
              🔄 Ganti File PDF
              <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
            </label>
          )}
        </div>

        {/* Upload Dropzone when empty */}
        {!pdfFile && (
          <label className="border-2 border-dashed border-gray-800 hover:border-green-500/50 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all bg-black/40 hover:bg-black/60 group">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              📸
            </div>
            <p className="text-sm font-semibold text-white mb-1">
              Klik atau Seret 1 File PDF ke sini
            </p>
            <p className="text-xs text-gray-400 font-mono">
              Ekstrak halaman ke JPG / PNG kualitas tinggi (100% Client-side)
            </p>
            <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
          </label>
        )}

        {/* Options Row */}
        {pdfFile && (
          <div className="space-y-6">
            {/* File Info */}
            <div className="flex items-center justify-between p-4 bg-black/60 border border-gray-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 font-bold flex items-center justify-center text-xl">
                  📄
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{pdfFile.name}</h3>
                  <p className="text-xs font-mono text-gray-400">
                    Ukuran: {formatBytes(pdfFile.size)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPdfFile(null);
                  setBuffer(null);
                  setConvertedImages([]);
                  setZipDownloadUrl(null);
                  setError(null);
                }}
                className="text-xs font-mono text-red-400 hover:text-red-300"
              >
                Hapus
              </button>
            </div>

            {/* Formats & Quality Controls */}
            <div className="grid sm:grid-cols-2 gap-4 p-4 bg-black/40 border border-gray-800 rounded-xl">
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1.5 font-bold">Format Gambar Output:</label>
                <select
                  value={imageFormat}
                  onChange={(e) => setImageFormat(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-green-400 text-xs font-mono rounded-lg p-2 outline-none"
                >
                  <option value="jpeg">JPG (Ukuran Lebih Kecil, Cocok untuk Foto/Dokumen)</option>
                  <option value="png">PNG (Transparan & Kualitas Lossless)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1.5 font-bold">Resolusi & Kualitas Gambar:</label>
                <select
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 text-green-400 text-xs font-mono rounded-lg p-2 outline-none"
                >
                  <option value={1.5}>Standar (150 DPI - Cepat)</option>
                  <option value={2.0}>Tinggi (200 DPI - Rekomendasi)</option>
                  <option value={3.0}>Ultra HD (300 DPI - Kualitas Maksimal)</option>
                </select>
              </div>
            </div>

            {/* Action Row */}
            <div className="pt-4 border-t border-gray-800 flex justify-end">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConvert}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 text-black font-bold rounded-xl shadow-xl shadow-green-500/25 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Ekstrak Gambar...</span>
                  </>
                ) : (
                  <>
                    <span>📸 Ekstrak PDF ke Gambar Sekarang</span>
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

      {/* Result Gallery & ZIP Download */}
      {convertedImages.length > 0 && (
        <div className="card rounded-2xl p-6 bg-green-950/30 border border-green-500/30 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                🎉 Konversi Berhasil! ({convertedImages.length} Halaman Terkespor)
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Unduh gambar secara individual atau sebagai arsip ZIP sekaligus.</p>
            </div>

            {zipDownloadUrl && (
              <a
                href={zipDownloadUrl}
                download={`${pdfFile.name.replace(".pdf", "")}_images.zip`}
                className="px-6 py-2.5 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl shadow-lg shadow-green-500/30 transition-all text-xs font-mono flex items-center gap-2"
              >
                <span>📦 Unduh Semua (.ZIP)</span>
              </a>
            )}
          </div>

          {/* Visual Images Gallery Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[550px] overflow-y-auto p-1">
            {convertedImages.map((img) => (
              <div
                key={img.pageNum}
                className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex flex-col items-center justify-between space-y-3 hover:border-green-500/50 transition-all"
              >
                <div className="w-full h-44 rounded-lg bg-black/60 border border-gray-800 overflow-hidden flex items-center justify-center">
                  <img src={img.dataUrl} alt={img.fileName} className="max-h-full max-w-full object-contain" />
                </div>

                <div className="w-full text-center space-y-2">
                  <p className="text-xs font-semibold text-white font-mono">Halaman {img.pageNum}</p>
                  <a
                    href={img.blobUrl}
                    download={img.fileName}
                    className="block w-full py-1.5 bg-gray-800 hover:bg-green-500 hover:text-black text-gray-200 text-xs font-mono font-semibold rounded-lg transition-colors"
                  >
                    📥 Unduh
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
