"use client";
import { BackgroundLines } from "@/components/ui/background-lines";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import Footerer from "@/components/Footerer";

const InProgressPage = () => {
  return (
    <div className="bg-gradient-to-br from-n-8 to-n-7 text-white min-h-screen flex flex-col">
      <BackgroundLines>
        <div className="relative z-20 px-6 py-10 md:px-12 md:py-20 lg:px-16 lg:py-32 lg:pt-20 md:pt-12 pt-8 flex-grow">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-wide leading-tight mb-5">
              Pages in Progress!
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-light mb-12 opacity-90">
              Some exciting new features are coming soon! Here&apos;s a sneak
              peek of the pages we are working on:
            </p>

            {/* Predictor Link */}
            <div className="mb-16">
              <Link href="/quizzer">
                <div className="relative cursor-pointer hover:ring-4 transition-all hover:ring-purple-400 rounded-xl">
                  <Image
                    src="/quizzer.png" // Replace with actual image path
                    alt="Quizzer"
                    width={900}
                    height={500}
                    className="object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-40 text-white text-xl font-semibold p-4 rounded-lg">
                    <h2>Quizzer</h2>
                  </div>
                </div>
              </Link>

              <p className="mt-4 text-lg sm:text-xl text-gray-400">
                The{" "}
                <Link
                  href="/quizzer"
                  className="text-purple-400 transition-all hover:text-purple-600"
                >
                  Quizzer
                </Link>{" "}
                will be an interactive platform for practicing various quizzes,
                & generating interactive quizzes from purely past paper
                questions. This can be helpful to both students and teachers!
                The frontend is done, but we&apos;re still perfecting the user
                experience. It will be available soon!
              </p>
            </div>

            {/* Quizzer Link */}
            <div className="mb-16">
              <Link href="/predictor">
                <div className="relative cursor-pointer hover:ring-4 transition-all hover:ring-purple-400">
                  <Image
                    src="/predictor.png" // Replace with actual image path
                    alt="Predictor"
                    width={900}
                    height={500}
                    className="object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 flex justify-center items-center bg-black  bg-opacity-40 text-white text-xl font-semibold p-4 rounded-lg">
                    <h2>Predictor</h2>
                  </div>
                </div>
              </Link>
              <p className="mt-4 text-lg sm:text-xl text-gray-400">
                <Link
                  href="/predictor"
                  className="text-purple-400 transition-all hover:text-purple-600"
                >
                  Predictor
                </Link>{" "}
                helps students and teachers estimate grades by using past grade
                boundaries and calculations. It can predict future grade
                boundaries or apply current ones to mock exams, showing how a
                student&apos;s marks would translate into a final grade.
                It&apos;s a useful tool for both practicing students and
                educators looking to apply grade boundaries correctly.
              </p>{" "}
            </div>

            {/* Developer&apos;s Note */}
            <div className="mt-12 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
              <p className="mb-4">A quick note from the developer:</p>
              <p>
                Both of these pages are designed, but still a work in progress.
                I&apos;ve completed the frontend, but there&apos;s more to do
                behind the scenes to make everything functional. Rest assured,
                these features will be available soon! Thank you for your
                patience.
              </p>
            </div>

            {/* Contact and Join Buttons */}
            <div className="flex justify-center flex-wrap gap-4 py-6 pt-0 mb-20 mt-6">
              <Link
                href="/help#sendmsg"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Button className="px-6 py-3 rounded-full text-lg font-semibold shadow-lg hover:from-purple-400 hover:to-indigo-400 transition duration-300 ease-in-out transform hover:scale-105">
                  Contact us
                </Button>
              </Link>
              <Link
                href="/help#sendmsg"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Button className="border-2 border-white text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-white hover:text-indigo-700 transition duration-300 ease-in-out transform hover:scale-105">
                  Join our team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </BackgroundLines>
      <Footerer />
    </div>
  );
};

export default InProgressPage;
