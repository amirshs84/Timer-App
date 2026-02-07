import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for managing study timer with WakeLock and visibility-based controls
 * @param {number} initialSeconds - Starting seconds for the timer
 * @returns {Object} Timer state and control functions
 */
export const useStudyTimer = (initialSeconds = 0) => {
  const [seconds, setSeconds] = useState(() => {
    // بازیابی زمان از localStorage در هنگام مقداردهی اولیه
    try {
      const savedState = localStorage.getItem('timerState');
      if (savedState) {
        const state = JSON.parse(savedState);
        if (state.isActive && state.startTime) {
          const now = Date.now();
          const startTime = new Date(state.startTime).getTime();
          if (!isNaN(startTime)) {
            const elapsedSeconds = Math.floor((now - startTime) / 1000);
            return elapsedSeconds >= 0 ? elapsedSeconds : initialSeconds;
          }
        }
      }
    } catch (e) {
      console.error("Failed to restore timer seconds:", e);
    }
    return initialSeconds;
  });

  const [isActive, setIsActive] = useState(() => {
    try {
      const savedState = localStorage.getItem('timerState');
      return savedState ? JSON.parse(savedState).isActive : false;
    } catch (e) { return false; }
  });

  const [isPaused, setIsPaused] = useState(() => {
    try {
      const savedState = localStorage.getItem('timerState');
      return savedState ? JSON.parse(savedState).isPaused : false;
    } catch (e) { return false; }
  });

  const [focusLost, setFocusLost] = useState(false);
  
  const wakeLockRef = useRef(null);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // بازیابی startTimeRef
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('timerState');
      if (savedState) {
        const state = JSON.parse(savedState);
        if (state.startTime) {
          startTimeRef.current = new Date(state.startTime);
        }
      }
    } catch (e) {}
  }, []);

  /**
   * WakeLock Logic
   */
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('Wake Lock acquired');
        
        // Handle wake lock release (e.g., when tab becomes invisible)
        wakeLockRef.current.addEventListener('release', () => {
          console.log('Wake Lock released');
        });
      }
    } catch (error) {
      // Silently handle errors (browser doesn't support or user denied)
      console.warn('Wake Lock request failed:', error);
    }
  };

  /**
   * Release the wake lock when timer stops
   */
  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      } catch (error) {
        console.warn('Wake Lock release failed:', error);
      }
    }
  };

  /**
   * Visibility Change Logic: Pause timer when user switches tabs/minimizes
   * This prevents time from running in the background and alerts user when they return
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isActive && !isPaused) {
        // User switched tabs or minimized - pause the timer
        setIsPaused(true);
        setFocusLost(true);
        console.log('Timer paused: Focus lost');
      } else if (document.visibilityState === 'visible' && focusLost) {
        // User returned - keep paused but clear the focus lost flag after alert
        console.log('Timer still paused: User returned');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, isPaused, focusLost]);

  /**
   * Timer count-up logic (شمارش از صفر به بالا)
   */
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused]);

  /**
   * Start the timer and acquire wake lock
   */
  const start = () => {
    if (isActive && !isPaused) return;

    // شروع جدید
    setSeconds(0);
    startTimeRef.current = new Date();
    setIsActive(true);
    setIsPaused(false);
    setFocusLost(false);
    requestWakeLock();
  };

  /**
   * Pause the timer (keeps wake lock active)
   */
  const pause = () => {
    setIsPaused(true);
  };

  /**
   * Resume the timer from paused state
   */
  const resume = () => {
    setIsPaused(false);
    setFocusLost(false);
  };

  /**
   * Stop the timer completely and release wake lock
   */
  const stop = () => {
    setIsActive(false);
    setIsPaused(false);
    setFocusLost(false);
    releaseWakeLock();
  };

  /**
   * Reset timer to initial value
   */
  const reset = () => {
    stop();
    setSeconds(initialSeconds);
  };

  return {
    seconds,
    isActive,
    isPaused,
    focusLost,
    start,
    pause,
    resume,
    stop,
    reset,
  };
};
