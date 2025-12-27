// src/components/GazeDebugger.jsx
import { useGaze } from '../context/GazeContext.jsx';
import { useConfusionDetector } from '../hooks/useConfusionDetector';

const GazeDebugger = ({ zones }) => {
  const { gaze, isMouseSim, setIsMouseSim } = useGaze();
  const confusion = useConfusionDetector(zones);

  return (
    <>
      {/* 1. The Visual Gaze Dot */}
      <div 
        style={{
          position: 'fixed',
          left: gaze.x,
          top: gaze.y,
          width: '15px',
          height: '15px',
          backgroundColor: confusion.isConfused ? 'red' : 'lime',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-50%, -50%)',
          transition: 'background-color 0.2s'
        }}
      />

      {/* 2. The Data HUD */}
      <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg font-mono text-xs z-[10000]">
        <p>X: {Math.round(gaze.x)} | Y: {Math.round(gaze.y)}</p>
        <p>Mode: {isMouseSim ? '🖱️ Mouse Sim' : '👁️ Webcam'}</p>
        <hr className="my-2 border-gray-600" />
        <p className={confusion.isConfused ? "text-red-400 font-bold" : "text-green-400"}>
          STATUS: {confusion.isConfused ? "CONFUSED!" : "Normal"}
        </p>
        {confusion.isConfused && <p>Reason: {confusion.reason}</p>}
        <button 
          onClick={() => setIsMouseSim(!isMouseSim)}
          className="mt-2 px-2 py-1 bg-blue-600 rounded"
        >
          Toggle Input
        </button>
      </div>
    </>
  );
};
export default GazeDebugger;