import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 left-3 z-[10020] pop-panel bg-[#FFE600] text-[#0D0D0D] px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-extrabold">
      <WifiOff className="w-4 h-4 text-[#FF1E42]" strokeWidth={2.8} />
      <span>Offline Mode — Ready to Play</span>
    </div>
  );
};
