import * as pdfjsLib from "pdfjs-dist";

// Configure pdfjs worker to reliable CDN URL matching installed pdfjs-dist version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function renderPdfPageThumbnail(arrayBuffer, pageNum = 1, scale = 0.35) {
  try {
    // Copy array buffer to avoid detach issues
    const bufferCopy = arrayBuffer.slice(0);
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(bufferCopy) });
    const pdfDoc = await loadingTask.promise;
    
    if (pageNum < 1 || pageNum > pdfDoc.numPages) return null;

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    return canvas.toDataURL("image/jpeg", 0.75);
  } catch (err) {
    console.warn("Could not generate PDF thumbnail:", err);
    return null;
  }
}

export async function renderAllPageThumbnails(arrayBuffer, maxPages = 50, scale = 0.3) {
  try {
    const bufferCopy = arrayBuffer.slice(0);
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(bufferCopy) });
    const pdfDoc = await loadingTask.promise;

    const thumbnails = [];
    const totalToRender = Math.min(pdfDoc.numPages, maxPages);

    for (let i = 1; i <= totalToRender; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      thumbnails.push({
        pageNum: i,
        dataUrl: canvas.toDataURL("image/jpeg", 0.75)
      });
    }

    return thumbnails;
  } catch (err) {
    console.warn("Could not generate page thumbnails:", err);
    return [];
  }
}
