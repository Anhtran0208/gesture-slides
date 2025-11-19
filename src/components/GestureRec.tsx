import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";

const MODEL_URL = `${import.meta.env.BASE_URL}models/gesture_recognizer.task`
type GestureRecProps = { onGesture?: (g: string, score: number) => void };

const RUNNING_MODE = "VIDEO"
export default function GestureRec({onGesture}: GestureRecProps){
    const recognizeRef = useRef<GestureRecognizer | null>(null)
    const [gestureName, setGestureName] = useState<string>("None")
    const [gestureDisplayName, setGestureDisplayName] = useState<string>("None")
    const [gestureScore, setGestureScore] = useState<number>(0)

    useEffect(() => {
        let videoRunning = true

        const initModel = async () => {
            const vision = await FilesetResolver.forVisionTasks(`${import.meta.env.BASE_URL}wasm`)

            const gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: MODEL_URL
                },
                numHands: 2,
                runningMode: RUNNING_MODE
            })

            recognizeRef.current = gestureRecognizer
            loop()
        }

        // keep calling mediapipe, otherwise, it only call once
        const loop = () => {
            if (!videoRunning) return  
            const gestureRecognizer = recognizeRef.current 
            const video = document.getElementById("camera") as HTMLVideoElement | null 
                  const next = () => requestAnimationFrame(loop);

            if (!video){console.log("no video")
                next()
                return
            }
            if (!gestureRecognizer) {
                console.log("no gesture rec")
                next()
                return
            }
                if (video && video.readyState < 2) {
                    console.log("video not ready")
                    next()
                    // requestAnimationFrame(loop)
                return
            }

            const currentTime = Date.now()
            const results = gestureRecognizer.recognizeForVideo(video, currentTime)

            if (results.gestures.length > 0){
                const topGesture = results.gestures[0][0]
                console.log("top result", topGesture)
                const name = topGesture.categoryName;
                const score = topGesture.score;
                setGestureName(name)
                setGestureDisplayName(topGesture.displayName)
                setGestureScore(score)

                if (score >= 0.65){
                    onGesture?.(name, score)
                }
            }

            requestAnimationFrame(loop)
        }
        initModel()

        return () => {
            videoRunning = false 
            recognizeRef.current?.close() 
        }
    }, [])

    return (
       <div style={{ color: "black", textAlign: "center", marginTop: 12 }}>
    <p>Detected Gesture display name: <b>{gestureDisplayName}</b></p>
    <p> Category name: <b>{gestureName}</b></p>
    <p>Score: <b>{gestureScore}</b></p>
  </div> 
    )
}