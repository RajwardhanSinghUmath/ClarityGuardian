import { createContext, useState, useContext, useEffect, useRef } from 'react';
import webgazer from 'webgazer';

const GazeContext = createContext();

export const GazeProvider = ({ children }) => {
  const [gaze, setGaze] = useState({ x: 0, y: 0, timestamp: 0 });
  const [isMouseSim, setIsMouseSim] = useState(true); 
  const [isWebgazerReady, setIsWebgazerReady] = useState(false);

  useEffect(() => {
    // --- 1. MOUSE SIMULATION MODE ---
    if (isMouseSim) {
      const handleMouseMove = (e) => {
        setGaze({ x: e.clientX, y: e.clientY, timestamp: Date.now() });
      };
      window.addEventListener('mousemove', handleMouseMove);
      
      // Cleanup Mouse Listeners
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        // If we were using webgazer, stop it
        webgazer.pause();
      };
    }

    // --- 2. WEBGAYER MODE ---
    if (!isMouseSim) {
      webgazer
        .setGazeListener((data, timestamp) => {
          if (data) {
            setGaze({ x: data.x, y: data.y, timestamp });
          }
        })
        .begin();

      // Show the video and the red prediction dot
      webgazer.showVideoPreview(true).showPredictionPoints(true);
      
      // Optional: Smooth the data (highly recommended for your logic)
      webgazer.applyKalmanFilter(true); 

      setIsWebgazerReady(true);

      return () => {
        webgazer.pause();
        webgazer.showVideoPreview(false).showPredictionPoints(false);
      };
    }
  }, [isMouseSim]);

  return (
    <GazeContext.Provider value={{ gaze, setGaze, isMouseSim, setIsMouseSim, isWebgazerReady }}>
      {children}
    </GazeContext.Provider>
  );
};

export const useGaze = () => useContext(GazeContext);