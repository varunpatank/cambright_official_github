// v0.0.01 salah
"use client";
import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import MagicButton from "../MagicButton";
import { HandHeart } from "lucide-react";
import ArrowDown from "../ArrowDown";

export const HeroParallax = ({
  products,
}: {
  products: {
    title: string;
    thumbnail: string;
  }[];
}) => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-700, 500]),
    springConfig
  );

  return (
    <div
      ref={ref}
      className="h-[300vh] overflow-hidden antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d]"
    >
      <div className="max-w-7xl relative mx-auto py-20 md:py-40 px-4 w-full items-center justify-center text-center top-0">
        <h1 className="text-2xl md:text-7xl font-bold text-white">
          Support Education, <br /> Save{" "}
          <span className="text-destructive">Lives</span>
        </h1>
        <p className="max-w-2xl mx-auto text-base md:text-xl mt-8 text-neutral-200">
          Children, women, and men in Gaza and Sudan face bombing and starvation
          daily, losing their dreams and lacking access to education, food, and
          water. This suffering extends to the impoverished worldwide who lack
          opportunities to learn coding.
        </p>
        <div className="max-w-lg mx-auto ">
          <div className="mt-8 relative z-10 max-w-full">
            <Link href="#donation">
              <MagicButton
                title="Donate"
                icon={<HandHeart />}
                position="right"
                width="60"
              />
            </Link>
            <ArrowDown />
          </div>
        </div>
      </div>
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className=""
      >
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-20">
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row mb-20 space-x-20">
          {secondRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20">
          {thirdRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export const ProductCard = ({
  product,
  translate,
}: {
  product: {
    title: string;
    thumbnail: string;
  };
  translate: MotionValue<number>;
}) => {
  return (
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={{
        y: -20,
      }}
      key={product.title}
      className="group/product h-96 w-[30rem] relative flex-shrink-0 overflow-hidden"
    >
      <motion.div
        className="absolute inset-0"
        whileHover={{ opacity: 1 }}
        initial={{ opacity: 0.6 }}
        transition={{ duration: 0.3 }}
        style={{ pointerEvents: "none", zIndex: 0 }} // Add pointer-events and zIndex styles
      >
        <Image
          src={product.thumbnail}
          height="500"
          width="500"
          className="object-cover object-left-top h-full w-full rounded-md"
          alt={product.title}
        />
      </motion.div>
      <div className="absolute inset-0 h-full w-full bg-black opacity-0 group-hover:opacity-50 pointer-events-none transition-opacity duration-300"></div>
      <h2 className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 text-white transition-opacity duration-300">
        {product.title}
      </h2>
    </motion.div>
  );
};
