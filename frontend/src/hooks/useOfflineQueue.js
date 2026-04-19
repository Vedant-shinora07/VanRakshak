import { useState, useEffect } from 'react';
import { syncOffline } from '../api';

export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  const updateCount = () => {
    const queue = JSON.parse(localStorage.getItem('vr_offline_queue') || '[]');
    setPendingCount(queue.length);
  };

  useEffect(() => {
    updateCount();
    
    const handleOnline = async () => {
      setIsOnline(true);
      const queue = JSON.parse(localStorage.getItem('vr_offline_queue') || '[]');
      if (queue.length > 0) {
        try {
          await syncOffline();
          localStorage.setItem('vr_offline_queue', '[]');
          updateCount();
        } catch (e) {
          console.error('Auto sync failed', e);
        }
      }
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToQueue = (operationType, payload) => {
    const queue = JSON.parse(localStorage.getItem('vr_offline_queue') || '[]');
    queue.push({ operationType, payload, timestamp: Date.now() });
    localStorage.setItem('vr_offline_queue', JSON.stringify(queue));
    updateCount();
  };

  return { isOnline, pendingCount, addToQueue };
}
