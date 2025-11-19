import { useCallback, useRef, useState, useEffect } from "react";
import CameraView from "./components/CameraView";
import GestureRec from "./components/GestureRec";
import PdfUpload from "./components/PdfUpload";
import PdfSlideDeck from "./components/PdfSlideDeck";

export default function App() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const lastFireRef = useRef(0);

  // revoke old object URL when it changes/unmounts
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const onPdfLoaded = useCallback(async (buf: ArrayBuffer) => {
    // replace previous URL (if any)
    setPageCount(null);
    setPage(1);

    const newUrl = URL.createObjectURL(new Blob([buf], { type: "application/pdf" }));
    // revoke the old one after switching
    setPdfUrl(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return newUrl;
    });

    // read page count using the URL (no buffer detachment issues)
    const { pdfjs } = await import("./pdf");
    const pdf = await pdfjs.getDocument(newUrl).promise;
    setPageCount(pdf.numPages);
  }, []);

  const next = useCallback(() => {
    setPage(p => (pageCount ? Math.min(p + 1, pageCount) : p + 1));
  }, [pageCount]);

  const prev = useCallback(() => setPage(p => Math.max(1, p - 1)), []);

  const handleGesture = useCallback((g: string, score: number) => {
    const now = Date.now();
    if (now - lastFireRef.current < 900) return; // cooldown
    lastFireRef.current = now;

    if (g === "Thumb_Up" || g === "Victory" || g === "Pointing_Up") next();
    else if (g === "Thumb_Down") prev();
  }, [next, prev]);

  return (
    <div style={{ display: "grid", gap: 16, padding: 24 }}>
      <CameraView />
      <GestureRec onGesture={handleGesture} />

      <PdfUpload onLoaded={onPdfLoaded} />

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={prev} disabled={!pdfUrl}>Prev</button>
        <button onClick={next} disabled={!pdfUrl}>Next</button>
        {pageCount ? <span>Page {page} / {pageCount}</span> : null}
      </div>

      {pdfUrl ? (
        <div style={{ width: "min(95vw, 1200px)", margin: "0 auto" }}>
          <PdfSlideDeck url={pdfUrl} page={page} maxWidth={1200} />
        </div>
      ) : (
        <div style={{ opacity: 0.6 }}>Upload a Google Slides PDF to begin</div>
      )}
    </div>
  );
}
