import * as pdfjsLib from "pdfjs-dist";

// Worker servido desde /public
pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

export async function pdfFirstPageToPngDataUrl(file, scale = 2) {
  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;

  const page = await pdf.getPage(1); // 1-based
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  await page.render({ canvasContext: context, viewport }).promise;

  return canvas.toDataURL("image/png");
}
