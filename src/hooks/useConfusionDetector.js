import { useState, useEffect, useRef } from 'react';
import { useGaze } from '../context/GazeContext.jsx';

const DWELL_THRESHOLD_MS = 3000;
const REGRESSION_LIMIT = 3;
const SACCADE_THRESHOLD_PX = 200; // Distance for a "panic" jump
const SCANNING_LIMIT = 6;         // Number of jumps to trigger

export const useConfusionDetector = (zones) => {
  const { gaze } = useGaze();
  const [confusionState, setConfusionState] = useState({ isConfused: false, reason: '', zoneId: null });
  
  const zoneStats = useRef({}); 
  const lastGazeRef = useRef(gaze);
  const erraticJumps = useRef(0);
  const isLocked = useRef(false); // 🔥 Stops all logic after first trigger

  // Sync gaze to Ref so heartbeat can see it without restarting the effect
  useEffect(() => {
    // Saccade Logic: Detect large jumps between gaze updates
    if (!isLocked.current && lastGazeRef.current) {
      const dist = Math.sqrt(
        Math.pow(gaze.x - lastGazeRef.current.x, 2) + 
        Math.pow(gaze.y - lastGazeRef.current.y, 2)
      );

      if (dist > SACCADE_THRESHOLD_PX) {
        erraticJumps.current += 1;
        console.log(`🚀 Saccade Detected! Count: ${erraticJumps.current}`);
      } else {
        erraticJumps.current = Math.max(0, erraticJumps.current - 0.05);
      }
    }
    lastGazeRef.current = gaze;
  }, [gaze]);

  useEffect(() => {
    const heartbeat = setInterval(() => {
      if (isLocked.current) return; // Exit if already confused

      const now = Date.now();
      const currentGaze = lastGazeRef.current;
      if (!currentGaze || (currentGaze.x === 0 && currentGaze.y === 0)) return;

      // 1. Identify Active Zone
      const activeZone = zones.find(z => 
        currentGaze.x >= z.left && currentGaze.x <= z.right && currentGaze.y >= z.top && currentGaze.y <= z.bottom
      );

      if (activeZone) {
        const zId = activeZone.id;
        if (!zoneStats.current[zId]) {
          zoneStats.current[zId] = { dwell: 0, revisits: 0, wasInside: false };
        }

        const stats = zoneStats.current[zId];
        
        // 2. Dwell Logic (Counts even if mouse is still)
        stats.dwell += 100;
        
        // 3. Revisit Logic
        if (!stats.wasInside) {
          stats.revisits += 1;
          stats.wasInside = true;
          console.log(`🔄 Revisit to ${zId}: ${stats.revisits}`);
        }

        // --- CHECK FOR FIRST TRIGGER ---
        if (stats.dwell > DWELL_THRESHOLD_MS) {
          triggerConfusion('High Dwell Time', zId);
        } else if (stats.revisits > REGRESSION_LIMIT) {
          triggerConfusion('Frequent Re-reading', zId);
        }
      } else {
        // 🔥 RESET DWELL: User looked away, so restart the 3s timer
        Object.keys(zoneStats.current).forEach(id => {
          zoneStats.current[id].dwell = 0;
          zoneStats.current[id].wasInside = false;
        });
      }

      // 4. Global Saccade Check
      if (erraticJumps.current > SCANNING_LIMIT) {
        triggerConfusion('Erratic Scanning', 'viewport');
      }

    }, 100);

    // Helper to lock the state and stop the heartbeat logic
    const triggerConfusion = (reason, id) => {
      isLocked.current = true;
      setConfusionState({ isConfused: true, reason, zoneId: id });
      console.log(`🛑 LOGIC LOCKED: ${reason} on ${id}`);
      clearInterval(heartbeat);
    };

    return () => clearInterval(heartbeat);
  }, [zones]);

  return confusionState;
};