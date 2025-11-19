// PdfSlideDeck.tsx
import { useEffect, useRef, useState } from "react";
import { pdfjs } from "../pdf";

type Props = {
  url: string;           // Blob URL
  page: number;          // 1-based
  maxWidth?: number;     // clamp, e.g. 1200
};

export default function PdfSlideDeck({ url, page, maxWidth = 1200 }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const docRef = useRef<any>(null);            
  const renderTaskRef = useRef<any>(null);
  const [containerW, setContainerW] = useState(900);

  // Observe container width (responsive)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = Math.min(e.contentRect.width, maxWidth);
        setContainerW(Math.max(320, Math.floor(w)));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxWidth]);

  // Load PDF once per url
  useEffect(() => {
    let destroyed = false;

    const load = async () => {
      if (docRef.current?.destroy) {
        try { await docRef.current.destroy(); } catch {}
      }
      const pdf = await pdfjs.getDocument(url).promise;
      if (destroyed) return;
      docRef.current = pdf;
    };

    load();

    return () => {
      destroyed = true;
      if (renderTaskRef.current?.cancel) {
        try { renderTaskRef.current.cancel(); } catch {}
      }
      if (docRef.current?.destroy) {
        try { docRef.current.destroy(); } catch {}
      }
      docRef.current = null;
    };
  }, [url]);

  // Render current page when page/containerW/doc ready
  useEffect(() => {
    const canvas = canvasRef.current;
    const pdf = docRef.current;
    if (!canvas || !pdf || !containerW) return;

    const doRender = async () => {
      if (renderTaskRef.current?.cancel) {
        try { renderTaskRef.current.cancel(); } catch {}
      }

      const p = Math.min(Math.max(page, 1), pdf.numPages);
      const pageObj = await pdf.getPage(p);

      const base = pageObj.getViewport({ scale: 1 });
      const scale = containerW / base.width;
      const viewport = pageObj.getViewport({ scale });

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // HiDPI
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, viewport.width, viewport.height);

      const task = pageObj.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = task;
      try { await task.promise; } catch {}
    };

    doRender();
  }, [page, containerW]);

  return (
    <div
      ref={wrapRef}
      style={{
        display: "grid",
        placeItems: "center",
        width: "100%",
        maxWidth,
        marginInline: "auto",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "auto",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,.25)",
        }}
      />
    </div>
  );
}
