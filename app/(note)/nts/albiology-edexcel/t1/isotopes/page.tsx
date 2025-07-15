"use client";
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Glossary Component
const Glossary = () => {
  return (
    <div className="max-w-3xl mx-auto md:p-8 rounded-lg mt-8">
      <dl className="space-y-4">
        <div id="glossary-isotope">
          <dt className="font-bold">Isotope</dt>
          <dd>
            Atoms of the same element that have the same number of protons but
            different numbers of neutrons.
          </dd>
        </div>
        <div id="glossary-carbon">
          <dt className="font-bold">Carbon</dt>
          <dd>
            A chemical element with the symbol C and atomic number 6, commonly
            found in nature in the form of various isotopes.
          </dd>
        </div>
        <div id="glossary-uranium">
          <dt className="font-bold">Uranium</dt>
          <dd>
            A radioactive element with the symbol U, used as fuel in nuclear
            reactors.
          </dd>
        </div>
        <div id="glossary-carbon-14">
          <dt className="font-bold">Carbon-14</dt>
          <dd>
            A radioactive isotope of carbon used in dating ancient organic
            materials.
          </dd>
        </div>
        <div id="glossary-carbon-12">
          <dt className="font-bold">Carbon-12</dt>
          <dd>
            The most stable isotope of carbon, making up about 99% of all carbon
            on Earth.
          </dd>
        </div>
        <div id="glossary-uranium-235">
          <dt className="font-bold">Uranium-235</dt>
          <dd>
            The isotope of uranium that is used as fuel in nuclear reactors and
            is capable of sustaining a chain reaction.
          </dd>
        </div>
        <div id="glossary-uranium-236">
          <dt className="font-bold">Uranium-236</dt>
          <dd>
            An isotope of uranium that is not fissile and cannot be used as
            fuel.
          </dd>
        </div>
      </dl>
    </div>
  );
};

const IsotopesPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Toggle function to switch between dark and light modes
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div>
      <div
        className={`min-h-screen p-8 ${
          isDarkMode ? "bg-n-7 text-white" : "bg-gray-100 text-gray-900"
        } transition-colors rounded-md ease-in-out duration-300`}
      >
        <div className="flex flex-row-reverse justify-between min-w-full">
          <div className="flex justify-end mt-4 mb-6 mr-4">
            <Sun />
            <Switch
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
              className="mr-3 ml-3"
            />
            <Moon />
          </div>
          <div className="flex justify-start mb-6 mr-4">
            <Button
              className={`${
                isDarkMode
                  ? "bg-n-6 hover:bg-n-6/20"
                  : "bg-gray-500 hover:bg-gray-800"
              }`}
            >
              <Download />
            </Button>
          </div>
        </div>

        {/* Banner Image Section (Smaller Box) */}
        <div
          className={`relative w-full h-64 bg-cover bg-center rounded-lg ${
            isDarkMode ? "bg-n-6" : "bg-gray-300"
          }`}
        >
          {/* Overlay to darken the image */}
          <div className="absolute inset-0 bg-black rounded-md opacity-30"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl font-semibold text-white z-10 text-center justify-center">
              Isotopes
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto md:p-8 rounded-lg mt-8">
          <h2 className="text-2xl font-semibold mb-4">Summary</h2>
          <p className="text-lg leading-relaxed mb-6">
            Isotopes are atoms of the same element that have the same number of
            protons but different numbers of neutrons. They have the same atomic
            number but different mass numbers.
          </p>
          <p className="text-lg leading-relaxed mb-6">
            Carbon has three isotopes: Carbon-12, Carbon-13, and Carbon-14.
            Carbon-12 is the most common isotope, while Carbon-14 is
            radioactive.
          </p>
          <h2 className="text-2xl font-semibold mb-4">
            Chemical and Physical Properties
          </h2>
          <p className="text-lg leading-relaxed mb-6">
            <strong>Chemical properties:</strong> Isotopes of the same element
            have identical chemical properties because they have the same number
            of outer shell electrons.
          </p>
          <p className="text-lg leading-relaxed mb-6">
            <strong>Physical properties:</strong> Isotopes have slightly
            different physical properties due to differences in mass and
            density. These include slight variations in boiling point, melting
            point, and rate of diffusion.
          </p>
          <h2 className="text-2xl font-semibold mb-4">Uses of Isotopes</h2>
          <p className="text-lg leading-relaxed mb-6">
            Isotopes have many important uses in different fields:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>
              <strong>Uranium:</strong> Uranium is used as fuel in the atomic
              energy industry. It has two isotopes, Uranium-235 and Uranium-236.
              Only Uranium-235 is used as fuel.
            </li>
            <li>
              <strong>Carbon-14:</strong> Carbon-14 is used in radiocarbon
              dating to determine the age of remains of living things.
            </li>
          </ul>
          <h2 className="text-2xl font-semibold mb-4">Glossary of Terms</h2>
          <p className="text-lg leading-relaxed mb-6">
            Below are some key terms related to isotopes:
          </p>
          {/* Glossary Link at the Bottom */}
          <Glossary />{" "}
          <div className="justify-start w-full items-start mt-4 ">
            <Link href={"/nts/alchemistry"} className="mr-4">
              <Button
                className={` ${
                  isDarkMode
                    ? "bg-n-6 hover:bg-n-6/20 text-white"
                    : "bg-gray-500 hover:bg-gray-800  text-white"
                }`}
              >
                <ChevronLeft />
              </Button>
            </Link>{" "}
            <Link href={"/nts/alchemistry/t1/energy"}>
              <Button
                className={` ${
                  isDarkMode
                    ? "bg-n-6 hover:bg-n-6/20 text-white"
                    : "bg-gray-500 hover:bg-gray-800  text-white"
                }`}
              >
                <ChevronRight />
              </Button>
            </Link>
          </div>
        </div>
      </div>{" "}
      <footer className="bg-gray-800 text-gray-400 text-center py-3 text-md flex justify-between items-center px-4 rounded-md">
        <Link href={`/profiles/khant_78`} className="flex items-center z-10">
          <button className="flex items-center text-slate-400 hover:text-slate-500 transition rounded-full px-2 py-1">
            <span className="text-sm font-medium mr-2">Notes by:</span>
            <img
              className="rounded-full w-5 h-5 object-cover mr-1"
              src={"/khant.png"}
              alt={"Note Owner"}
            />
            <span className="text-xs font-medium">{"Khant"}</span>
            <BadgeCheck className="w-4 h-4 ml-1" />
          </button>
        </Link>
      </footer>
    </div>
  );
};

export default IsotopesPage;
