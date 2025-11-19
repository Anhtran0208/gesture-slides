import { useEffect, useRef } from "react";

export default function CameraView() {
  // create ref for video element
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // add canvas for handmark can be drawn
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        drawToCanvas();
      }
    };
    const drawToCanvas = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;
      const render = () => {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(render);
      };
      requestAnimationFrame(render);
    };
    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);
  return (
    <>
      <video
        id="camera"
        ref={videoRef}
        style={{ display: "none" }}
        autoPlay
        playsInline
        muted
      />
    </>
  );
}
