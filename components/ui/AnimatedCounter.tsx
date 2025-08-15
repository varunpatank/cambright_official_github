"use client";

import { useState, useEffect } from 'react';

interface AnimatedCounterProps {
  baseValue: number;
  className?: string;
  suffix?: string;
}

export function AnimatedCounter({ baseValue, className = "", suffix = "" }: AnimatedCounterProps) {
  const [currentValue, setCurrentValue] = useState(baseValue);

  useEffect(() => {
    const interval = setInterval(() => {
      // Random chance to change (30% chance)
      if (Math.random() < 0.3) {
        // Random change between -3 to +3
        const change = Math.floor(Math.random() * 7) - 3;
        setCurrentValue(prev => Math.max(0, prev + change));
      }
    }, 2000 + Math.random() * 3000); // Random interval between 2-5 seconds

    return () => clearInterval(interval);
  }, []);

  // Reset to base value occasionally to prevent drift
  useEffect(() => {
    const resetInterval = setInterval(() => {
      setCurrentValue(baseValue);
    }, 30000); // Reset every 30 seconds

    return () => clearInterval(resetInterval);
  }, [baseValue]);

  return (
    <span className={className}>
      {currentValue.toLocaleString()}{suffix}
    </span>
  );
}
