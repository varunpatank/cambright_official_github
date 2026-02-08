"use client";
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SparklesCore } from "./sparkles";

interface StarryBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  /** Height of the starry section - default is "200px" */
  height?: string;
  /** Show the meteor/beam lines - default true */
  showMeteors?: boolean;
  /** Intensity of particles - "low" | "medium" | "high" - default "medium" */
  intensity?: "low" | "medium" | "high";
}

const CircleIcon = ({ className, delay, size = 3 }: { className?: string; delay?: number; size?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 0.7, 0.4, 0.7], 
        scale: 1 
      }}
      transition={{
        duration: 3,
        delay: delay || 0,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
      className={cn(
        `rounded-full bg-purple-400 shadow-lg shadow-purple-500/50`,
        className
      )}
      style={{
        width: `${size * 4}px`,
        height: `${size * 4}px`,
        willChange: "transform, opacity",
      }}
    />
  );
};

const Beam = ({
  className,
  width = 600,
  delay,
  duration,
}: {
  className?: string;
  width?: number;
  delay?: number;
  duration?: number;
}) => {
  const id = React.useId();

  return (
    <motion.div
      initial={{ x: -width, opacity: 0 }}
      animate={{ 
        x: width * 2,
        opacity: [0, 0.8, 0.8, 0],
      }}
      transition={{
        duration: duration || 10,
        delay: delay || 0,
        repeat: Infinity,
        repeatDelay: Math.random() * 6 + 4,
        ease: "linear",
      }}
      style={{ willChange: "transform, opacity" }}
      className={cn(
        "absolute inset-0 flex items-center pointer-events-none",
        className
      )}
    >
      <svg
        viewBox={`0 0 ${width} 3`}
        width={width}
        height="3"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d={`M0 1.5 H${width}`}
          stroke={`url(#gradient-${id})`}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient
            id={`gradient-${id}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0)" />
            <stop offset="30%" stopColor="rgba(168, 85, 247, 0.8)" />
            <stop offset="70%" stopColor="rgba(139, 92, 246, 1)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
};

export const StarryBackground = ({
  className,
  children,
  height = "200px",
  showMeteors = true,
  intensity = "medium",
}: StarryBackgroundProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reduced particle density for better performance
  const particleDensity = {
    low: 40,
    medium: 60,
    high: 90,
  }[intensity];

  // Fewer beams for smoother animation
  const numberOfBeams = {
    low: 2,
    medium: 3,
    high: 4,
  }[intensity];

  // Generate beam data with more spread out timing
  const beamData = useMemo(() => 
    Array.from({ length: numberOfBeams }, (_, i) => ({
      top: `${(i + 1) * (100 / (numberOfBeams + 1))}%`,
      duration: Math.random() * 3 + 8, // Slower beams (8-11s)
      delay: Math.random() * 4 + i * 1.5, // More staggered delays
    })),
    [numberOfBeams]
  );

  if (!mounted) {
    return (
      <div 
        className={cn("relative w-full bg-neutral-950 rounded-xl overflow-hidden", className)}
        style={{ minHeight: height }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full bg-neutral-950 rounded-xl overflow-hidden",
        className
      )}
      style={{ minHeight: height }}
    >
      {/* Sparkles/Stars Layer */}
      <div className="absolute inset-0 z-0">
        <SparklesCore
          id="starry-background-sparkles"
          background="transparent"
          minSize={1}
          maxSize={2.5}
          particleDensity={particleDensity}
          className="w-full h-full"
          particleColor="#FFFFFF"
          speed={0.3}
        />
      </div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />

      {/* Meteor/Beam Lines */}
      {showMeteors && (
        <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none">
          {beamData.map((beam, index) => (
            <div
              key={index}
              className="absolute w-full"
              style={{ top: beam.top }}
            >
              <Beam
                delay={beam.delay}
                duration={beam.duration}
                width={800}
              />
            </div>
          ))}
        </div>
      )}

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 z-[3]">
        <CircleIcon delay={0} size={2} />
      </div>
      <div className="absolute top-4 right-4 z-[3]">
        <CircleIcon delay={0.5} size={2.5} />
      </div>
      <div className="absolute bottom-4 left-4 z-[3]">
        <CircleIcon delay={1} size={2} />
      </div>
      <div className="absolute bottom-4 right-4 z-[3]">
        <CircleIcon delay={1.5} size={2.5} />
      </div>

      {/* Content layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default StarryBackground;
