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
    <footer className="w-full py-8 border-t border-white/[0.06]" id="contact">
      <div className="flex md:flex-row flex-col justify-between items-center px-6 gap-4">
        <p className="text-sm text-gray-500">
          Copyright © 2024 CamBright
        </p>

        <div className="flex items-center gap-3">
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
