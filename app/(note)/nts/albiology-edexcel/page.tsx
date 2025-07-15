"use client";
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { BadgeCheck, ChevronRight, Download, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Glossary Component
const Glossary = () => {
  return (
    <div className="max-w-3xl mx-auto md:p-8 rounded-lg mt-8">
      <dl className="space-y-4">
        <div id="glossary-atom">
          <dt className="font-bold">Atom</dt>
          <dd>
            A basic unit of matter, consisting of protons, neutrons, and
            electrons.
          </dd>
        </div>
        <div id="glossary-proton">
          <dt className="font-bold">Proton</dt>
          <dd>
            A positively charged subatomic particle found in the nucleus of an
            atom.
          </dd>
        </div>
        <div id="glossary-neutron">
          <dt className="font-bold">Neutron</dt>
          <dd>
            A neutral subatomic particle found in the nucleus of an atom, with
            no charge.
          </dd>
        </div>
        <div id="glossary-electron">
          <dt className="font-bold">Electron</dt>
          <dd>
            A negatively charged subatomic particle that orbits the nucleus of
            an atom.
          </dd>
        </div>
        <div id="glossary-atomic-number">
          <dt className="font-bold">Atomic Number</dt>
          <dd>
            The number of protons in the nucleus of an atom, denoted as Z.
          </dd>
        </div>
        <div id="glossary-mass-number">
          <dt className="font-bold">Mass Number</dt>
          <dd>
            The total number of protons and neutrons in an atom&apos;s nucleus,
            denoted as A.
          </dd>
        </div>
        <div id="glossary-nucleon">
          <dt className="font-bold">Nucleon</dt>
          <dd>
            A collective term for protons and neutrons in an atom&apos;s
            nucleus.
          </dd>
        </div>
        <div id="glossary-relative-charge">
          <dt className="font-bold">Relative Charge</dt>
          <dd>
            The charge of a subatomic particle relative to the charge of an
            electron.
          </dd>
        </div>
      </dl>
    </div>
  );
};

const ALevelChemistryTopic1Part1 = () => {
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
          className={`relative w-full h-80 bg-cover bg-center rounded-lg ${
            isDarkMode ? "bg-n-6" : "bg-gray-300"
          }`}
        >
          {/* Overlay to darken the image */}
          <div className="absolute inset-0 bg-black rounded-md opacity-30"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-5xl font-semibold text-white z-10 text-center justify-center">
              A-Level Chemistry: <br />
              Particles in the Atom
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto md:p-8 rounded-lg mt-8">
          <h2 className="text-2xl font-semibold mb-4">Summary</h2>
          <p className="text-lg leading-relaxed mb-6">
            Atoms have a small dense nucleus consisting of protons and neutrons,
            with electrons in the empty space around the nucleus.
          </p>
          <p className="text-lg leading-relaxed mb-6">
            Protons and neutrons have a relative mass of 1, and electrons have a
            relative mass of 1/1837 (or negligible).
          </p>
          <p className="text-lg leading-relaxed mb-6">
            Protons have a positive relative charge of +1, electrons have a
            charge of -1, and neutrons have 0 (no charge).
          </p>

          <h2 className="text-2xl font-semibold mb-4">Key Concepts</h2>
          <p className="text-lg leading-relaxed mb-6">
            - Atomic (proton) number (Z) is the number of protons in the atom.
          </p>
          <p className="text-lg leading-relaxed mb-6">
            - Mass (nucleon) number (A) is the number of nucleons (protons +
            neutrons) in the atom.
          </p>
          <p className="text-lg leading-relaxed mb-6">
            - Number of neutrons = Mass number - Proton number.
          </p>
          <p className="text-lg leading-relaxed mb-6">
            - Atomic radii increase down a group because the number of shells
            increases.
          </p>
          <p className="text-lg leading-relaxed mb-6">
            - Atomic radii decrease across a period because the positive nuclear
            charge increases.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Degree of Deflection</h2>
          <p className="text-lg leading-relaxed mb-6">
            The greater the mass of the particle, the smaller the deflection.
          </p>

          <table className="table-auto w-full mb-8">
            <thead>
              <tr>
                <th className="border px-4 py-2">Particle</th>
                <th className="border px-4 py-2">Relative Charge</th>
                <th className="border px-4 py-2">Relative Mass</th>
                <th className="border px-4 py-2">Charge</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-4 py-2">Neutron</td>
                <td className="border px-4 py-2">0</td>
                <td className="border px-4 py-2">1</td>
                <td className="border px-4 py-2">0</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Proton</td>
                <td className="border px-4 py-2">+1</td>
                <td className="border px-4 py-2">1</td>
                <td className="border px-4 py-2">+1.602 × 10⁻¹⁹ C</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Electron</td>
                <td className="border px-4 py-2">-1</td>
                <td className="border px-4 py-2">1/1837</td>
                <td className="border px-4 py-2">-1.602 × 10⁻¹⁹ C</td>
              </tr>
            </tbody>
          </table>

          <p className="text-lg leading-relaxed mb-6">
            The relative mass of a proton is 1, and for an electron it is
            1/1837, which is negligible in comparison to the proton mass.
          </p>

          <p className="text-lg leading-relaxed mb-6">
            The deflection of particles in electric and magnetic fields depends
            on their mass and charge.
          </p>

          <Glossary />
          <div className="justify-start w-full items-start mt-4 ">
            <Link href={"/nts/alchemistry/t1/isotopes"}>
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
      </div>
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

export default ALevelChemistryTopic1Part1;
