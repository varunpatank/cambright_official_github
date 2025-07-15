"use client";
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { BadgeCheck, ChevronLeft, Download, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Glossary Component with important terms
const Glossary = () => {
  return (
    <div className="max-w-3xl mx-auto md:p-8 rounded-lg mt-8">
      <dl className="space-y-4">
        <div id="glossary-electron">
          <dt className="font-bold text-teal-500">Electron</dt>
          <dd>
            An elementary particle with a negative charge that orbits the
            nucleus of an atom.
          </dd>
        </div>
        <div id="glossary-quantum-number">
          <dt className="font-bold text-teal-500">Quantum Number</dt>
          <dd>
            Numbers used to describe the energy levels, sublevels, and orbitals
            of an electron.
          </dd>
        </div>
        <div id="glossary-orbital">
          <dt className="font-bold text-teal-500">Orbital</dt>
          <dd>
            A region in an atom where there is a high probability of finding an
            electron.
          </dd>
        </div>
        <div id="glossary-ground-state">
          <dt className="font-bold text-teal-500">Ground State</dt>
          <dd>
            The most stable arrangement of electrons in an atom, where they
            occupy the lowest available energy levels.
          </dd>
        </div>
        <div id="glossary-excited-state">
          <dt className="font-bold text-teal-500">Excited State</dt>
          <dd>
            A higher energy state of an electron when it has absorbed energy and
            moved to a higher orbit.
          </dd>
        </div>
        <div id="glossary-electron-configuration">
          <dt className="font-bold text-teal-500">Electron Configuration</dt>
          <dd>
            The arrangement of electrons in the atomic orbitals of an atom.
          </dd>
        </div>
      </dl>
    </div>
  );
};

const ElectronOrbitalsPage = () => {
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

        {/* Banner Image Section */}
        <div
          className={`relative w-full h-64 bg-cover bg-center rounded-lg ${
            isDarkMode ? "bg-n-6" : "bg-gray-300"
          }`}
        >
          <div className="absolute inset-0 bg-black rounded-md opacity-30"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl font-semibold text-white z-10 text-center justify-center">
              Electrons, Energy Levels, and Atomic Orbitals
            </h1>
          </div>
          {/* Placeholder Image */}
          <img
            src="xyz-banner.jpg" // Replace this with actual image URL or path
            alt="Electrons Banner"
            className="w-full h-full object-cover opacity-60 rounded-lg"
          />
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto md:p-8 rounded-lg mt-8 space-y-8">
          <div className="bg-n-7 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-teal-500 mb-4">
              Summary
            </h2>
            <img
              src="xyz-summary.jpg" // Replace with actual image URL or path
              alt="Electron orbitals"
              className="w-full rounded-lg mb-6"
            />
            <p className="text-lg leading-relaxed mb-4">
              Electrons are arranged in{" "}
              <span className="font-bold text-teal-500">shells</span> and{" "}
              <span className="font-bold text-teal-500">sub-shells</span>, which
              hold <span className="font-bold text-teal-500">orbitals</span>{" "}
              where electrons reside.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              The energy of these shells increases with distance from the
              nucleus. The{" "}
              <span className="font-bold text-teal-500">
                principal quantum number
              </span>{" "}
              (n) denotes the energy of each shell.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Electrons occupy the lowest energy level first and fill other
              levels in order. This configuration is called the{" "}
              <span className="font-bold text-teal-500">ground state</span>, the
              most stable electron configuration.
            </p>
          </div>

          <div className="bg-n-7 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-teal-500 mb-4">
              Quantum Numbers and Sub-shells
            </h2>
            <img
              src="xyz-quantum-numbers.jpg" // Replace with actual image URL or path
              alt="Quantum numbers"
              className="w-full rounded-lg mb-6"
            />
            <p className="text-lg leading-relaxed mb-4">
              The energy of a sub-shell depends on the{" "}
              <span className="font-bold text-teal-500">
                azimuthal quantum number
              </span>{" "}
              (l), which also indicates the shape of the orbital.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              The order of energy for sub-shells is:
              <br />
              <span className="font-bold text-yellow-500">
                1s &lt; 2s &lt; 2p &lt; 3s &lt; 3p &lt; 4s &lt; 3d &lt; 4p &lt;
                5s &lt; 4d &lt; 5p
              </span>
            </p>
          </div>

          <div className="bg-n-7 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-teal-500 mb-4">
              Orbitals and Electron Configuration
            </h2>
            <img
              src="xyz-orbitals.jpg" // Replace with actual image URL or path
              alt="Orbitals"
              className="w-full rounded-lg mb-6"
            />
            <p className="text-lg leading-relaxed mb-4">
              <span className="font-bold text-teal-500">Orbitals</span> are
              regions where electrons are most likely to be found. These
              orbitals are defined by quantum numbers.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Orbitals can hold a maximum of two electrons, which must spin in
              opposite directions. Electrons fill the lowest energy orbitals
              first. The{" "}
              <span className="font-bold text-teal-500">
                electron configuration
              </span>{" "}
              describes the arrangement of electrons in orbitals.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              For example, the electron configuration of magnesium (Mg) is:
              <br />
              <span className="font-bold text-yellow-500">1s² 2s² 2p⁶ 3s²</span>
            </p>
          </div>

          <div className="bg-n-7 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-teal-500 mb-4">
              Electron Configuration of Ions
            </h2>
            <img
              src="xyz-ions.jpg" // Replace with actual image URL or path
              alt="Electron Configuration of Ions"
              className="w-full rounded-lg mb-6"
            />
            <p className="text-lg leading-relaxed mb-4">
              The electron configuration of an ion is similar to that of the
              atom, except that you add or remove electrons from the outermost
              shell.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              For example:
              <br />
              Na:{" "}
              <span className="font-bold text-yellow-500">1s² 2s² 2p⁶ 3s¹</span>
              <br />
              Na⁺:{" "}
              <span className="font-bold text-yellow-500">1s² 2s² 2p⁶</span>
            </p>
          </div>

          {/* Glossary Link at the Bottom */}
          <Glossary />
          <div className="justify-start w-full items-start mt-4 ">
            <Link href={"/nts/alchemistry/t1/isotopes"} className="mr-4">
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

export default ElectronOrbitalsPage;
