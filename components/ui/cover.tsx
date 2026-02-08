"use client";
import React, { useEffect, useId, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { SparklesCore } from "./sparkles";

export const Cover = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  const [hovered, setHovered] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      ref={ref}
      className={cn(
        "relative hover:bg-neutral-900/80 group/cover inline-block bg-neutral-900 px-2 py-2 transition duration-200 rounded-lg",
        className
      )}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: {
                duration: 0.3,
              },
            }}
            className="h-full w-full overflow-hidden absolute inset-0 rounded-lg"
          >
            <motion.div
              animate={{
                translateX: ["-50%", "0%"],
              }}
              transition={{
                translateX: {
                  duration: 20,
                  ease: "linear",
                  repeat: Infinity,
                },
              }}
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
          </motion.div>
        )}
      </AnimatePresence>
      {beamData.map((beam, index) => (
        <Beam
          key={index}
          hovered={hovered}
          duration={beam.duration}
          delay={beam.delay}
          width={containerWidth}
          style={{
            top: `${beam.position}px`,
          }}
        />
      ))}
      <motion.span
        key={String(hovered)}
        animate={{
          scale: hovered ? 0.95 : 1,
        }}
        exit={{
          filter: "none",
          scale: 1,
        }}
        transition={{
          duration: 0.2,
          scale: {
            duration: 0.2,
          },
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
          key={String(hovered)}
          gradientUnits="userSpaceOnUse"
          initial={{
            x1: "0%",
            x2: hovered ? "-10%" : "-5%",
            y1: 0,
            y2: 0,
          }}
          animate={{
            x1: "110%",
            x2: hovered ? "100%" : "105%",
            y1: 0,
            y2: 0,
          }}
          transition={{
            duration: hovered ? 0.5 : duration ?? 2,
            ease: "linear",
            repeat: Infinity,
            delay: hovered ? Math.random() * (1 - 0.2) + 0.2 : 0,
            repeatDelay: hovered ? Math.random() * (2 - 1) + 1 : delay ?? 1,
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
