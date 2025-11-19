// src/components/PdfUpload.tsx
import { useRef } from "react";

type Props = {
  onLoaded: (buf: ArrayBuffer) => void;
};

export default function PdfUpload({ onLoaded }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const buf = await f.arrayBuffer();
    onLoaded(buf);
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFile}
      />
    </div>
  );
}
