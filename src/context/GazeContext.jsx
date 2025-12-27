import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { FaceLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.js";

const GazeContext = createContext();

export const GazeProvider = ({ children }) => {
  const [gaze, setGaze] = useState({ x: 0, y: 0 });
  const [isMouseSim, setIsMouseSim] = useState(true);
  const landmarkerRef = useRef(null);
  const videoRef = useRef(null);
  
  // Constants from your working reference
  const SENSITIVITY_X = 8.0;
  const SENSITIVITY_Y = 8.0;

  useEffect(() => {
    // 1. MOUSE SIMULATION
    if (isMouseSim) {
      const move = (e) => setGaze({ x: e.clientX, y: e.clientY });
      window.addEventListener('mousemove', move);
      return () => window.removeEventListener('mousemove', move);
    }

    // 2. MEDIAPIPE SETUP
   const initMediaPipe = async () => {
  try {
    // 🔥 We use a specific version (0.10.x) to avoid the WASM Module error
    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    
    landmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      outputFaceBlendshapes: true,
      numFaces: 1
    });

    console.log("✅ MediaPipe FaceLandmarker Ready");
    startCamera();
  } catch (error) {
    console.error("❌ MediaPipe Init Error:", error);
    // Fallback: If GPU fails, try CPU
    if (error.message.includes('GPU')) {
       console.log("Switching to CPU delegate...");
       // ... retry logic ...
    }
  }
};

    const startCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      videoRef.current = video;

      const predict = () => {
        if (!landmarkerRef.current || video.paused) return;

        const results = landmarkerRef.current.detectForVideo(video, performance.now());

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];
          
          // Iris indices: 468 (Left), 473 (Right)
          const leftIris = landmarks[468];
          const rightIris = landmarks[473];

          // 🟢 THE "MAGIC" MATH FROM YOUR CODE
          const avgIrisX = (leftIris.x + rightIris.x) / 2;
          const avgIrisY = (leftIris.y + rightIris.y) / 2;

          // 1. Center the range (-0.5 to 0.5)
          // 2. Multiply by Sensitivity (Amplify movement)
          // 3. Offset back to 0-1 range
          let tunedX = (avgIrisX - 0.5) * SENSITIVITY_X + 0.5;
          let tunedY = (avgIrisY - 0.5) * SENSITIVITY_Y + 0.5;

          // Clamp to screen bounds
          tunedX = Math.max(0, Math.min(1, tunedX));
          tunedY = Math.max(0, Math.min(1, tunedY));

          // 4. Map to screen (Mirroring X)
          const screenX = (1 - tunedX) * window.innerWidth;
          const screenY = tunedY * window.innerHeight;

          // Exponential Smoothing (80% old, 20% new) to stop vibration
          setGaze(prev => ({
            x: prev.x * 0.8 + screenX * 0.2,
            y: prev.y * 0.8 + screenY * 0.2
          }));
        }
        requestAnimationFrame(predict);
      };

      video.onloadeddata = predict;
    };

    initMediaPipe();

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [isMouseSim]);

  return (
    <GazeContext.Provider value={{ gaze, isMouseSim, setIsMouseSim }}>
      {children}
    </GazeContext.Provider>
  );
};

export const useGaze = () => useContext(GazeContext);