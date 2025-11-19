// src/pdf.ts
import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// ESM worker
(pdfjs as any).GlobalWorkerOptions.workerSrc = workerUrl;
// Some environments require explicitly creating the worker port:
(pdfjs as any).GlobalWorkerOptions.workerPort = new Worker(workerUrl, { type: "module" });

// Fonts/cmaps (copy to /public first, same as Option A)
(pdfjs as any).GlobalWorkerOptions.standardFontDataUrl = `${import.meta.env.BASE_URL}standard_fonts/`;
(pdfjs as any).GlobalWorkerOptions.cMapUrl = `${import.meta.env.BASE_URL}cmaps/`;
(pdfjs as any).GlobalWorkerOptions.cMapPacked = true;

export { pdfjs };
