"use client";
import React, { useEffect, useId, useState, useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SparklesCore } from "./sparkles";

// Isolated sparkle canvas — never re-renders after mount
const SparkleCanvas = React.memo(({ overlayRef }: { overlayRef: React.RefObject<HTMLDivElement> }) => (
  <div
    ref={overlayRef}
    style={{ opacity: 0.08, transition: "opacity 0.8s ease-in-out" }}
    className="h-full w-full overflow-hidden absolute inset-0 rounded-lg pointer-events-none"
  >
    <motion.div
      animate={{ translateX: ["-50%", "0%"] }}
      transition={{ translateX: { duration: 20, ease: "linear", repeat: Infinity } }}
      className="w-[200%] h-full flex"
    >
      <SparklesCore
        background="transparent"
        minSize={1.5}
        maxSize={3}
        particleDensity={150}
        className="w-full h-full"
        particleColor="#FFFFFF"
      />
      <SparklesCore
        background="transparent"
        minSize={1.5}
        maxSize={3}
        particleDensity={150}
        className="w-full h-full"
        particleColor="#FFFFFF"
      />
    </motion.div>
  </div>
));

export const Cover = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Auto-cycle the sparkle effect: 2s on, 3.5s off
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const cycle = (on: boolean) => {
      timeoutId = setTimeout(() => {
        // Update opacity directly on DOM — no React re-render, canvas stays alive
        if (overlayRef.current) {
          overlayRef.current.style.opacity = on ? "1" : "0.08";
        }
        cycle(!on);
      }, on ? 2000 : 3500);
    };
    cycle(true);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setHovered(true);
    if (overlayRef.current) overlayRef.current.style.opacity = "1";
  }, []);
  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    if (overlayRef.current) overlayRef.current.style.opacity = "0.08";
  }, []);

  const isActive = hovered || active;

  const [containerWidth, setContainerWidth] = useState(0);
  const [beamPositions, setBeamPositions] = useState<number[]>([]);

  useEffect(() => {
    if (ref.current) {
      setContainerWidth(ref.current?.clientWidth ?? 0);

      const height = ref.current?.clientHeight ?? 0;
      // Fewer beams for better performance
      const numberOfBeams = Math.floor(height / 25);
      const positions = Array.from(
        { length: numberOfBeams },
        (_, i) => (i + 1) * (height / (numberOfBeams + 1))
      );
      setBeamPositions(positions);
    }
  }, [ref.current]);

  // Memoize beam data to prevent recalculation
  const beamData = useMemo(() => 
    beamPositions.map((position, index) => ({
      position,
      duration: Math.random() * 2 + 1.5,
      delay: Math.random() * 2 + 1,
    })),
    [beamPositions]
  );

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={ref}
      className={cn(
        "relative hover:bg-neutral-900/80 group/cover inline-block bg-neutral-900 px-2 py-2 transition duration-200 rounded-2xl",
        className
      )}
    >
      <SparkleCanvas overlayRef={overlayRef} />
      {beamData.map((beam, index) => (
        <Beam
          key={index}
          hovered={isActive}
          duration={beam.duration}
          delay={beam.delay}
          width={containerWidth}
          style={{
            top: `${beam.position}px`,
          }}
        />
      ))}
      <motion.span
        animate={{
          scale: isActive ? 0.95 : 1,
          filter: isActive ? "brightness(1.1)" : "brightness(1)",
        }}
        transition={{
          duration: 0.6,
          ease: "easeInOut",
        }}
        className={cn(
          "text-white inline-block relative z-20 group-hover/cover:text-white transition duration-200"
        )}
      >
        {children}
      </motion.span>
      <CircleIcon className="absolute -right-[2px] -top-[2px]" size={3} />
      <CircleIcon className="absolute -bottom-[2px] -right-[2px]" delay={0.4} size={3} />
      <CircleIcon className="absolute -left-[2px] -top-[2px]" delay={0.8} size={3} />
      <CircleIcon className="absolute -bottom-[2px] -left-[2px]" delay={1.6} size={3} />
    </div>
  );
};

export const Beam = ({
  className,
  delay,
  duration,
  hovered,
  width = 600,
  ...svgProps
}: {
  className?: string;
  delay?: number;
  duration?: number;
  hovered?: boolean;
  width?: number;
} & React.ComponentProps<typeof motion.svg>) => {
  const id = useId();

  return (
    <motion.svg
      width={width ?? "600"}
      height="3"
      viewBox={`0 0 ${width ?? "600"} 3`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("absolute inset-x-0 w-full", className)}
      {...svgProps}
    >
      <motion.path
        d={`M0 1.5H${width ?? "600"}`}
        stroke={`url(#svgGradient-${id})`}
        strokeWidth="2"
      />

      <defs>
        <motion.linearGradient
          id={`svgGradient-${id}`}
          gradientUnits="userSpaceOnUse"
          initial={{
            x1: "0%",
            x2: "-5%",
            y1: 0,
            y2: 0,
          }}
          animate={{
            x1: "110%",
            x2: "105%",
            y1: 0,
            y2: 0,
          }}
          transition={{
            duration: duration ?? 2,
            ease: "linear",
            repeat: Infinity,
            delay: 0,
            repeatDelay: delay ?? 1,
          }}
        >
          <stop stopColor="#a458ea" stopOpacity="0" />
          <stop stopColor="#771fb1" />
          <stop offset="1" stopColor="#9f27c3" stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </motion.svg>
  );
};

export const CircleIcon = ({
  className,
  delay,
  size = 3,
}: {
  className?: string;
  delay?: number;
  size?: number;
}) => {
  return (
    <div
      className={cn(
        `pointer-events-none animate-pulse group-hover/cover:hidden group-hover/cover:opacity-100 group rounded-full bg-purple-400 opacity-40 group-hover/cover:bg-white`,
        className
      )}
      style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
    ></div>
  );
};
