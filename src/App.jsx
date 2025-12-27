import React, { useState } from 'react';
import { GazeProvider } from './context/GazeContext.jsx';
import { useConfusionDetector } from './hooks/useConfusionDetector';
import CheckoutForm from './features/CheckoutForm';
import GazeDebugger from './components/GazeDebugger';

// This is the "Main" content where the logic lives
const MainApp = () => {
  // 1. Define the "Interest Zones" for the Payment UI
  // In a real app, these could be updated dynamically via refs
  const [zones, setZones] = useState([
    { id: 'price-summary', left: 0, right: 0, top: 0, bottom: 0 },
    { id: 'terms-checkbox', left: 0, right: 0, top: 0, bottom: 0 },
    { id: 'pay-button', left: 0, right: 0, top: 0, bottom: 0 }
  ]);

  // 2. Initialize your Confusion Hook (Part 2)
  const confusion = useConfusionDetector(zones);

  // 3. Callback to update zone coordinates from the UI (Part 3)
  const handleZoneUpdate = (newZones) => {
    setZones(newZones);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">The Clarity Guardian</h1>
        <p className="text-gray-600">Smart Payment Confusion Detector</p>
      </header>

      <main className="max-w-4xl mx-auto relative">
        {/* The Checkout UI (Member 3's Work) */}
        <CheckoutForm 
          confusion={confusion} 
          onZonesReady={handleZoneUpdate} 
        />

        {/* The Gaze Visualizer & HUD (For your testing) */}
        <GazeDebugger zones={zones} />
      </main>

      {/* Confusion Overlay/Notification */}
      {confusion.isConfused && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 animate-bounce bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg z-50">
          <p className="font-bold">Clarity Insight:</p>
          <p>It looks like you're focusing on the <strong>{confusion.zoneId}</strong>. Need help?</p>
        </div>
      )}
    </div>
  );
};

// Root App Component
function App() {
  return (
    <GazeProvider>
      <MainApp />
    </GazeProvider>
  );
}

export default App;