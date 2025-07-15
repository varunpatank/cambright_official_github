"use client";
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch"; // Assuming the Switch component is located here
import { BadgeCheck, Download, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconPdf } from "@tabler/icons-react";
import Link from "next/link";

// Glossary component
const Glossary = () => {
  return (
    <div className="max-w-3xl mx-auto md:p-8 rounded-lg mt-8">
      {/* <h2 className="text-3xl font-semibold mb-4">Glossary</h2> */}
      <dl className="space-y-4">
        <div id="glossary-morgue">
          <dt className="font-bold">Morgue</dt>
          <dd>A place where dead bodies are kept, typically in a hospital.</dd>
        </div>
        <div id="glossary-unctuous">
          <dt className="font-bold">Unctuous</dt>
          <dd>Excessively or ingratiatingly flattering; oily.</dd>
        </div>
        <div id="glossary-deportment">
          <dt className="font-bold">Deportment</dt>
          <dd>A person&apos;s behavior or manners.</dd>
        </div>
        <div id="glossary-bulging">
          <dt className="font-bold">Bulging</dt>
          <dd>
            Swelling outward, often used to describe something that&apos;s
            overstuffed or protruding.
          </dd>
        </div>
        <div id="glossary-impetuous">
          <dt className="font-bold">Impetuous</dt>
          <dd>
            Acting or done quickly and without thought or care; impulsive.
          </dd>
        </div>
        <div id="glossary-aloof">
          <dt className="font-bold">Aloof</dt>
          <dd>Not friendly or forthcoming; distant.</dd>
        </div>
        <div id="glossary-scrutinizing">
          <dt className="font-bold">Scrutinizing</dt>
          <dd>Examining or inspecting something very carefully.</dd>
        </div>
        <div id="glossary-excruciatingly">
          <dt className="font-bold">Excruciatingly</dt>
          <dd>
            In a way that causes intense pain or suffering, either physically or
            mentally.
          </dd>
        </div>
      </dl>
    </div>
  );
};

const EFLPage = () => {
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
              <span className="uppercase first-letter:text-5xl first-letter:font-extrabold">
                T
              </span>
              he Lost Boy
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto md:p-8 rounded-lg mt-8">
          <p className="text-lg leading-relaxed mb-6">
            <span className="italic">&ldquo;Where is he?&quot;&quot;</span>
          </p>

          <p className="text-lg leading-relaxed mb-6">
            The clinical white walls of the hallway looked like a{" "}
            <a
              href="#glossary-morgue"
              className="text-gray-400 hover:text-gray-500 transition-all  "
            >
              morgue
            </a>{" "}
            as she spoke. Her mother&apos;s desperate, panicked glances towards
            the end of the hallway were becoming increasingly frequent.
          </p>

          <p className="text-lg leading-relaxed mb-6">
            The manager&apos;s voice, stern though with a hint of the{" "}
            <a
              href="#glossary-unctuous"
              className="text-gray-400 hover:text-gray-500 transition-all  "
            >
              unctuous
            </a>{" "}
            deportment of one working in customer service, echoed through the
            empty hallway.
          </p>

          <p className="text-lg leading-relaxed mb-6">
            &quot;It&apos;s unreasonable to expect a child under 16 to be
            responsible for her sibling in such a crowded area. Next time,
            please don&apos;t leave the child&apos;s care to someone so
            young.&quot;`,`&ldquo;
          </p>

          <p className="text-lg leading-relaxed mb-6">
            Daria hoped there would be a next time.
          </p>

          <p className="text-lg leading-relaxed mb-6">
            Fair, with a rather{" "}
            <a
              href="#glossary-bulging"
              className="text-gray-400 hover:text-gray-500 transition-all  "
            >
              bulging
            </a>{" "}
            waist, a formal black suit, and a pair of loafers so polished Daria
            could see her face in them, he was the epitome of an experienced,
            aging manager. Her expression, blurry on his shoes, revealed only a
            hint of the sudden flare of indignation muddled with the constant
            guilt of what had happened.
          </p>

          <p className="text-lg leading-relaxed mb-6">
            An hour ago, or was it longer now? She and her brother had been
            playfully chasing each other around the gigantic store, a huge
            venture that spanned multiple floors.
          </p>

          <p className="text-lg leading-relaxed mb-6">
            They had escaped the store&apos;s bright, welcoming light and large
            expanses teeming with families and customers who gazed at the
            children&apos;s flashing streaks, as they rushed past, with obvious
            distaste. It was no surprise that they had gravitated to a darker,
            isolated alcove. Precariously tall racks, whose shelves were
            overflowing with stock, towered over them, their countless rows
            forming an enormous labyrinth—now the sibling&apos;s{" "}
            <a
              href="#glossary-impetuous"
              className="text-gray-400 hover:text-gray-500 transition-all  "
            >
              impetuous
            </a>{" "}
            playground.
          </p>

          <p className="text-lg leading-relaxed mb-6">
            That was where she had lost him.
          </p>

          <p className="text-lg leading-relaxed mb-6">
            &quot;Where was he?&ldquo; After what had seemed like an endless
            trudge through a haphazard arrangement of racks cloaked by the
            stifling gloom, his dark eyes stung. The bright glow hit his gaze,
            already dry from his sobbing. Through the speaker, he could now hear
            a booming announcement whose efforts were dissipated by the constant
            din of the crowd.
          </p>

          <p className="text-lg leading-relaxed mb-6">
            &quot;If you see an unaccompanied, 7-year-old boy, wearing a black
            sweater and beige pants with light-brown skin, please report him to
            the nearest employee or customer service desk.&ldquo;
          </p>

          <p className="text-lg leading-relaxed mb-6">
            His tears ran streaming again. There were people. He could see them!
            He had been so worried that he would never get out. Thank you, thank
            you, thank you. He dared a single glance back. Rows of racks. All he
            had needed to do was walk straight towards the light and he would
            have been out. What... no, forget it. Where was Mom? Where was
            Daria? Please, please... There— a help desk, an old man with a suit,
            and employees fastidiously{" "}
            <a
              href="#glossary-scrutinizing"
              className="text-gray-400 hover:text-gray-500 transition-all  "
            >
              scrutinizing
            </a>{" "}
            the crowd. Thank God. They had a phone. He knew Mom&apos;s number.
          </p>

          <p className="text-lg leading-relaxed mb-6">He started running.</p>

          <p className="text-lg leading-relaxed mb-6">
            Daria waited, after being told to leave the searching to the
            experienced staff, in the large seating area with soft, luxurious
            chairs and piles of popular magazines for waiting customers to pass
            the time. Passing time was the last thing she wanted. In those
            excruciatingly{" "}
            <a
              href="#glossary-excruciatingly"
              className="text-gray-400 hover:text-gray-500 transition-all  "
            >
              excruciatingly
            </a>{" "}
            long moments, her desperation and imagination ran wild.
          </p>

          {/* Glossary Link at the Bottom */}
          <Glossary />
        </div>
      </div>
      <footer className="bg-gray-800 text-gray-400 text-center py-3 text-md flex justify-between items-center px-4 rounded-md">
        <Link href={`/profiles/itrolode`} className="flex items-center z-10">
          <button className="flex items-center text-slate-400 hover:text-slate-500 transition rounded-full px-2 py-1">
            <span className="text-sm font-medium mr-2">Notes by:</span>
            <img
              className="rounded-full w-5 h-5 object-cover mr-1"
              src={"/user2.png"}
              alt={"Note Owner"}
            />
            <span className="text-xs font-medium">{"Kaelyn/Itrolode"}</span>
            <BadgeCheck className="w-4 h-4 ml-1" />
          </button>
        </Link>
      </footer>{" "}
    </div>
  );
};

export default EFLPage;
