// v0.0.01 salah

import Image from "next/image";
import { FaLocationArrow } from "react-icons/fa6";

import { socialMedia } from "@/data";
import MagicButton from "./MagicButton";
import { PointerIcon } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
interface FooterProps {
  signed?: boolean | false;
}
const Footer = ({ signed }: FooterProps) => {
  return (
    <footer className="w-full pt-20 pb-10" id="contact">
      {/* background grid */}
      <div className="w-full absolute left-0 -bottom-72 min-h-96">
        <Image
          src="/footer-grid.svg"
          alt="grid"
          fill
          className="opacity-50 object-cover"
          sizes="100vw"
        />
      </div>

      <div className="flex flex-col items-center">
        <h1 className="heading lg:max-w-[45vw]">
          Ready to <span className="text-purple-300">ACE</span> those exams?
        </h1>
        <p className="text-white-200 md:mt-10 my-5 text-center">
          Why not start now? everything is free!
        </p>

        <a href={`${signed ? "/dashboard" : "/sign-up"}`}>
          <MagicButton
            title="Launch"
            icon={<PointerIcon />}
            position="right"
            width="60"
          />
        </a>
      </div>
      <div className="flex mt-16 md:flex-row flex-col justify-between items-center">
        <p className="md:text-base text-sm md:font-normal font-light">
          Copyright © 2024 Cambright
        </p>

        <div className="flex items-center md:gap-3 gap-6">
          {socialMedia.map((info) => (
            <Link
              key={info.id}
              href={info.id}
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="w-10 h-10 cursor-pointer flex justify-center items-center backdrop-filter backdrop-blur-lg saturate-180 bg-opacity-75 bg-black-200 rounded-lg border border-black-300">
                <Image
                  src={info.img}
                  alt="icons"
                  width={20}
                  height={20}
                  className={`${
                    info.img === "/youtube.svg" &&
                    "filter saturate-50 -hue-rotate-60 grayscale-[90%] "
                  }`}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
