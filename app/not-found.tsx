// v0.0.01 salah

import React from "react";
import notfound from "../public/404g.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid h-screen place-content-center px-4">
      <div className="text-center">
        <Image src={notfound} alt="404 Not Found" />
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-4xl">
          Uh-oh! Lost?
        </h1>

        <a
          className="group relative inline-flex items-center overflow-hidden rounded bg-purple-600 px-8 py-3 text-white focus:outline-none focus:ring active:bg-indigo-500 m-5"
          href="/"
        >
          <span className="absolute -end-full transition-all group-hover:end-4">
            <svg
              className="size-5 rtl:rotate-180"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </span>

          <span className="text-sm font-medium transition-all group-hover:me-4">
            {" "}
            Go Home{" "}
          </span>
        </a>
      </div>
    </div>
  );
}
