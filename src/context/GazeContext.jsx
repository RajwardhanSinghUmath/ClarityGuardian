import { createContext, useState, useContext, useEffect } from 'react';

const GazeContext = createContext();

export const GazeProvider = ({ children }) => {
  const [gaze, setGaze] = useState({ x: 0, y: 0, timestamp: 0 });
  const [isMouseSim, setIsMouseSim] = useState(true); // Toggle for your testing!

  // MOUSE SIMULATION: This allows YOU to work before Member 1 is finished
  useEffect(() => {
    if (!isMouseSim) return;

    const handleMouseMove = (e) => {
      setGaze({ x: e.clientX, y: e.clientY, timestamp: Date.now() });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMouseSim]);

  return (
    <GazeContext.Provider value={{ gaze, setGaze, isMouseSim, setIsMouseSim }}>
      {children}
    </GazeContext.Provider>
  );
};

export const useGaze = () => useContext(GazeContext);