
import React, { useState, useRef, ReactNode } from 'react';
import { Loader2, ArrowDown } from 'lucide-react';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({ children, onRefresh }) => {
  const [pullChange, setPullChange] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);

  // Constants
  const THRESHOLD = 80; // Pixel distance to trigger refresh
  const MAX_PULL = 140; // Max pixels you can pull down visually

  // --- MOBILE TOUCH EVENTS ---

  const handleTouchStart = (e: React.TouchEvent) => {
    if (contentRef.current && contentRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      isDragging.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    if (contentRef.current && contentRef.current.scrollTop > 0) {
        isDragging.current = false;
        setPullChange(0);
        return;
    }

    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    if (diff > 0) {
      // Prevent default pull-to-refresh behavior of browser if we are handling it
      if (e.cancelable) e.preventDefault();
      
      // Logarithmic resistance (makes it harder to pull as you go further)
      const newPull = Math.min(diff * 0.45, MAX_PULL); 
      setPullChange(newPull);
    }
  };

  const handleTouchEnd = async () => {
    isDragging.current = false;
    if (pullChange >= THRESHOLD) {
      triggerRefresh();
    } else {
      setPullChange(0);
    }
  };

  const triggerRefresh = async () => {
    if (refreshing) return;
    
    // Haptic feedback for mobile
    if (navigator.vibrate) navigator.vibrate(10);
    
    setRefreshing(true);
    setPullChange(THRESHOLD); // Snap to loading position
    
    try {
        await onRefresh();
    } finally {
        // Wait a tiny bit for animation to finish then close
        setTimeout(() => {
            setRefreshing(false);
            setPullChange(0);
        }, 500);
    }
  };

  // Rotation calculation based on pull percentage
  const rotation = Math.min((pullChange / THRESHOLD) * 360, 360);
  
  return (
    <div 
        className="relative h-full flex flex-col overflow-hidden"
    >
        {/* Refresh Spinner Indicator - Pinterest Style */}
        <div 
            className="absolute top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
            style={{ 
                transform: `translateY(${Math.max(pullChange - 60, 10)}px)`,
                opacity: pullChange > 0 || refreshing ? 1 : 0,
                transition: isDragging.current ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s'
            }}
        >
            <div className={`
                w-10 h-10 rounded-full flex items-center justify-center shadow-md border border-transparent dark:border-[#333]
                ${refreshing ? 'bg-white dark:bg-[#222]' : 'bg-[#E60023] text-white'}
                transition-colors duration-300
            `}>
                {refreshing ? (
                    <Loader2 className="w-5 h-5 text-[#E60023] animate-spin" />
                ) : (
                    <ArrowDown 
                        className="w-5 h-5" 
                        style={{ transform: `rotate(${rotation}deg)` }} 
                    />
                )}
            </div>
        </div>

        {/* Scrollable Content Container 
            REMOVED: 'scrollbar-hide' class to allow visible scrollbar on desktop
        */}
        <div
            ref={contentRef}
            className="flex-1 overflow-y-auto overscroll-none"
            style={{ 
                transform: `translateY(${refreshing ? THRESHOLD : pullChange}px)`,
                transition: isDragging.current ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                overscrollBehaviorY: 'none' // Critical for blocking native browser refresh
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {children}
        </div>
    </div>
  );
};

export default PullToRefresh;
