import React, { useState, useCallback, useMemo } from 'react';
import { GazeProvider } from './context/GazeContext.jsx';
import { useConfusionDetector } from './hooks/useConfusionDetector';
import CheckoutForm from './features/CheckoutForm';
import GazeDebugger from './components/GazeDebugger';

const MainApp = () => {
  const [zones, setZones] = useState([
    { id: 'price-summary', left: 0, right: 0, top: 0, bottom: 0 },
    { id: 'terms-checkbox', left: 0, right: 0, top: 0, bottom: 0 },
    { id: 'pay-button', left: 0, right: 0, top: 0, bottom: 0 }
  ]);

  // 1. Memoize zones so the object reference stays the same unless data changes
  const memoizedZones = useMemo(() => zones, [zones]);

  // 2. Initialize Hook with memoized zones
  const confusion = useConfusionDetector(memoizedZones);

  // 3. Use useCallback so this function doesn't trigger re-renders in children
  const handleZoneUpdate = useCallback((newZones) => {
    // Basic check to see if top coordinate changed (prevents micro-update loops)
    setZones(prev => {
      if (JSON.stringify(prev) === JSON.stringify(newZones)) return prev;
      return newZones;
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">The Clarity Guardian</h1>
        <p className="text-gray-600">Smart Payment Confusion Detector</p>
      </header>

      <main className="max-w-4xl mx-auto relative">
        <CheckoutForm 
          confusion={confusion} 
          onZonesReady={handleZoneUpdate} 
        />
        <GazeDebugger zones={memoizedZones} />
      </main>

      {confusion.isConfused && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 animate-bounce bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg z-50">
          <p className="font-bold">Clarity Insight:</p>
          <p>It looks like you're focusing on the <strong>{confusion.zoneId}</strong>. Need help?</p>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <GazeProvider>
      <MainApp />
    </GazeProvider>
  );
}

export default App;