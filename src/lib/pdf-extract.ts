// PDF text extraction using pdfjs-dist. Worker loaded via Vite ?url import.
import * as pdfjs from "pdfjs-dist";
// @ts-ignore - Vite worker URL import
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

(pdfjs as any).GlobalWorkerOptions.workerSrc = workerUrl;

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
  isScanned: boolean;
}

export async function extractPdfText(file: File, onProgress?: (pct: number) => void): Promise<PdfExtractionResult> {
  const buf = await file.arrayBuffer();
  const pdf = await (pdfjs as any).getDocument({ data: buf }).promise;
  const pageCount = pdf.numPages;
  const pageTexts: string[] = [];
  for (let p = 1; p <= pageCount; p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    const txt = tc.items.map((i: any) => ("str" in i ? i.str : "")).join(" ").replace(/\s+/g, " ").trim();
    if (txt) pageTexts.push(txt);
    onProgress?.(Math.round((p / pageCount) * 100));
  }
  const text = pageTexts.map((t, i) => `### Page ${i + 1}\n\n${t}`).join("\n\n");
  // Heuristic: very little text per page = likely scanned
  const alpha = (text.match(/[a-zA-Z]/g) || []).length;
  const isScanned = alpha < pageCount * 40;
  return { text, pageCount, isScanned };
}
