import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { FaQuestionCircle } from "react-icons/fa";
import {
  FaArrowRight,
  FaDiscord,
  FaGraduationCap,
  FaInstagram,
} from "react-icons/fa6";

const Footerer = () => {
  return (
    <>
      <div className="w-full h-full">
        <svg
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 43.9999C106.667 43.9999 213.333 7.99994 320 7.99994C426.667 7.99994 533.333 43.9999 640 43.9999C746.667 43.9999 853.333 7.99994 960 7.99994C1066.67 7.99994 1173.33 43.9999 1280 43.9999C1386.67 43.9999 1440 19.0266 1440 9.01329V100H0V43.9999Z"
            className="fill-current text-n-7"
          ></path>
        </svg>
      </div>
      <footer className="bg-n-7 border-t-[0] border-gray-900">
        <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8 pt-0 mt-0">
          <div className="md:flex md:justify-between">
            <div className="mb-6 md:mb-0">
              <a href="/" className="flex items-center">
                <img
                  src="/logo.png"
                  className="h-12 me-3 transition-transform duration-300 transform hover:scale-110"
                  alt="Cambright Logo"
                />
              </a>
            </div>
            <div className="grid gap-8 sm:gap-6 mr-8">
              {/* Sitemap Link with Arrow Icon */}
              <div className="group">
                <h2 className="text-sm font-semibold uppercase text-gray-500">
                  <Link
                    href="/sitemap"
                    className="text-gray-500 transition-all duration-300 hover:text-purple-500 flex items-center"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Sitemap
                    <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </Link>
                </h2>
              </div>

              {/* Discord Link with Arrow Icon */}
              <div className="group">
                <h2 className="text-sm font-semibold uppercase text-gray-500">
                  <Link
                    href="https://discord.gg/zj3rXtxE"
                    rel="noopener noreferrer"
                    target="_blank"
                    className="text-gray-500 transition-all duration-300 hover:text-indigo-500 flex items-center"
                  >
                    Discord
                    <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </Link>
                </h2>
              </div>

              {/* Donate Link with Arrow Icon */}
              <div className="group">
                <h2 className="text-sm font-semibold uppercase text-gray-500">
                  <Link
                    href="/donate"
                    rel="noopener noreferrer"
                    target="_blank"
                    className="text-gray-500 transition-all duration-300 hover:text-pink-500 flex items-center"
                  >
                    Donate
                    <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </Link>
                </h2>
              </div>
            </div>
          </div>
          <hr className="my-6 sm:mx-auto border-n-6 lg:my-8" />
          <div className="sm:flex sm:items-center sm:justify-between">
            <span className="text-sm  sm:text-center text-gray-400">
              © 2024{" "}
              <a
                href="/"
                className="hover:underline transition-all duration-300 hover:text-purple-500"
              >
                Cambright |{" "}
              </a>
              All Rights Reserved.
            </span>
            <div className="flex mt-4 sm:justify-center sm:mt-0">
              {/* Help Icon */}
              <a
                href="/help"
                className="text-gray-500 hover:text-yellow-400 transition-all duration-300 transform hover:scale-150 scale-125 hover:rotate-12 ms-5"
              >
                <FaQuestionCircle />
                <span className="sr-only">Help</span>
              </a>
              {/* Discord Icon */}
              <a
                href="https://discord.gg/kun6MJTFra"
                className="text-gray-500 hover:text-indigo-400 transition-all duration-300 transform hover:scale-150 scale-125 hover:rotate-12 ms-5"
              >
                <FaDiscord />
                <span className="sr-only">Discord community</span>
              </a>{" "}
              <a
                href="/tutor-apply"
                className="text-gray-500 hover:text-green-400 transition-all duration-300 transform hover:scale-150 scale-125 hover:rotate-12 ms-5"
              >
                <FaGraduationCap />
                <span className="sr-only">apply as tutor</span>
              </a>
              {/* Instagram Icon */}
              <a
                href="https://www.instagram.com/camb.right/"
                className="text-gray-500 hover:text-pink-400 transition-all duration-300 transform hover:scale-150 scale-125 hover:rotate-12 ms-5"
              >
                <FaInstagram />
                <span className="sr-only">Instagram page</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footerer;
