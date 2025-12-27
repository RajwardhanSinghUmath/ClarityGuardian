import { useState, useEffect, useRef } from 'react';
import { useGaze } from '../context/GazeContext.jsx';

// Thresholds - Adjust these based on testing
const DWELL_THRESHOLD_MS = 3000; // 3 seconds in one zone = confusion
const SACCADE_VELOCITY_THRESHOLD = 0.5; // Pixels per ms
const REGRESSION_LIMIT = 3; // 3 returns to the same zone

export const useConfusionDetector = (zones) => {
  const { gaze } = useGaze();
  const [confusionState, setConfusionState] = useState({ isConfused: false, reason: '', zoneId: null });
  
  // Using refs to track state without re-triggering the hook too often
  const gazeHistory = useRef([]); 
  const zoneStats = useRef({}); // { 'price-tag': { dwell: 0, revisits: 0, lastEntry: Date.now() } }

  useEffect(() => {
    if (!gaze.x || !gaze.y) return;

    const now = Date.now();
    const currentPoint = { ...gaze, time: now };
    
    // 1. Update Gaze History (Sliding window of last 10 points)
    gazeHistory.current.push(currentPoint);
    if (gazeHistory.current.length > 10) gazeHistory.current.shift();

    // 2. Identify Current Zone
    const activeZone = zones.find(z => 
      gaze.x >= z.left && gaze.x <= z.right && gaze.y >= z.top && gaze.y <= z.bottom
    );

    if (activeZone) {
      const zId = activeZone.id;
      
      // Initialize zone tracker if new
      if (!zoneStats.current[zId]) {
        zoneStats.current[zId] = { dwell: 0, revisits: 0, lastTime: now };
      }

      const stats = zoneStats.current[zId];

      // 3. Logic: Dwell Time
      stats.dwell += (now - stats.lastTime);
      stats.lastTime = now;

      // 4. Logic: Regression (Detecting a "Return" to the zone)
      const prevPoint = gazeHistory.current[gazeHistory.current.length - 2];
      const wasInDifferentZone = prevPoint && !isGazeInSpecificZone(prevPoint.x, prevPoint.y, activeZone);
      
      if (wasInDifferentZone) {
        stats.revisits += 1;
      }

      // 5. Trigger Confusion Event
      if (stats.dwell > DWELL_THRESHOLD_MS) {
        setConfusionState({ isConfused: true, reason: 'High Dwell Time', zoneId: zId });
      } else if (stats.revisits > REGRESSION_LIMIT) {
        setConfusionState({ isConfused: true, reason: 'Frequent Re-reading', zoneId: zId });
      }
    } else {
      // User is looking at "white space" - reset active dwell timers
      Object.keys(zoneStats.current).forEach(id => {
        zoneStats.current[id].lastTime = now;
      });
    }

  }, [gaze, zones]);

  return confusionState;
};

// Helper to check if a specific coord is in a zone
const isGazeInSpecificZone = (x, y, zone) => {
  return x >= zone.left && x <= zone.right && y >= zone.top && y <= zone.bottom;
};