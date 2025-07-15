"use client";
import { BackgroundLines } from "@/components/ui/background-lines";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Image from "next/image"; // For handling images
import {
  FaCrown,
  FaLinkedinIn,
  FaGithub,
  FaQuestionCircle,
} from "react-icons/fa"; // LinkedIn and GitHub Icons
import {
  FaArrowRight,
  FaDiscord,
  FaInstagram,
  FaSpinner,
} from "react-icons/fa6";

import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import emailjs from "@emailjs/browser";
import animationData from "@/data/confetti.json";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { TimelineStory } from "../../_components/our-story";
import { auth, EmailAddress, getAuth, User } from "@clerk/nextjs/server";
import MagicButton from "@/components/MagicButton";
import { IoCheckmark, IoCopyOutline } from "react-icons/io5";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { getUserFirstName } from "@/lib/clerkername";
import { redirect } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import LoadingOverlay from "@/components/LoadingOverlay";
import Link from "next/link";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import Footerer from "@/components/Footerer";
import { saveAs } from "file-saver";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import Player from "@/components/Player";
import { FileDown, Loader2 } from "lucide-react";

type FormData = {
  email: string;
  app_message: string;
};

const placeholders = [
  "Write your question here..",
  "Write your ideas here..",
  "Write your feedback here..",
];
// export const maxDuration = 300;

const TutorPage = () => {
  const confetti = useConfettiStore();
  const videoUrlX = "/CamBright_-_Using_Tutor_Dashboard_1.mp4";
  const videoUrlY = "/Cambright_-_Sign_Up_As_Tutor_1.mp4";
  const [isReady, setIsReady] = useState(false);
  const { user } = useUser();
  const videoJsOptionsx = {
    techOrder: ["html5"],
    autoplay: false,
    controls: true,
    responsive: true,
    oncanplay: () => setIsReady(true),
    sources: [
      {
        src: videoUrlX || "",
        type: "video/mp4",
      },
    ],
  };
  const videoJsOptionsy = {
    techOrder: ["html5"],
    autoplay: false,
    controls: true,
    responsive: true,
    oncanplay: () => setIsReady(true),
    sources: [
      {
        src: videoUrlY || "",
        type: "video/mp4",
      },
    ],
  };

  const saveFile = (videoUrl: string, title: string) => {
    saveAs(videoUrl || "", `${title} video`);
  };

  // Handle default form data with user's email
  const INITIAL_DATA: FormData = {
    email: user?.emailAddresses[0]?.emailAddress || "anonymous",
    app_message: "",
  };
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);

  // Copy functionality state
  const [copied, setCopied] = useState(false);
  const defaultOptions = {
    loop: copied,
    autoplay: copied,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  // Handle form changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      app_message: value,
    });
  };

  // Handle form submission
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Log form submission to console for debugging
    console.log("Form submitted", formData);

    // Show success toast
    toast.success("We received your message!");

    // Prepare template params with the entered email and message
    const templateParams = {
      email: formData.email,
      app_message: formData.app_message,
    };

    // Send the email via emailjs
    emailjs
      .send(
        "service_guo67je", // Replace with your service ID
        "template_qjw1cd8", // Replace with your template ID
        templateParams, // Use the form data here
        "Ge_7NEoLad4-IYNs0" // Replace with your user ID
      )
      .then(
        (response) => {
          console.log("Success:", response);
        },
        (error) => {
          console.error("Error:", error);
        }
      );
  };

  // Handle the copy email functionality
  const handleCopy = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      const text = "support@cambright.com";
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      confetti.onOpen();
    }
  };

  return (
    <div className="bg-gradient-to-br from-n-8 to-n-7 text-white min-h-screen flex flex-col">
      <BackgroundLines>
        <div className="relative z-20 px-6 py-10 md:px-12 md:py-20 lg:px-16 lg:py-32 lg:pt-20 md:pt-12 pt-8 flex-grow">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-wide leading-tight mb-5">
              Help center.
            </h1>
            <section className="mb-24 text-start">
              <h3 className="text-3xl sm:text-4xl font-semibold mb-8 text-purple-400">
                FAQ
              </h3>
              <p className="text-lg sm:text-xl md:text-2xl font-light mb-12 opacity-90">
                You might find an answer to any question you have here, if not
                you can check our guide or feel free to send us your question
                and we will reply in less than a day!
              </p>
              <div className="flex justify-center flex-wrap gap-10 mb-12">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>What is CamBright?</AccordionTrigger>
                    <AccordionContent>
                      CamBright is a free educational platform that provides
                      comprehensive resources for students studying for IGCSE,
                      A-Levels, and other board exams. Our goal is to make
                      quality education accessible to all, offering study
                      materials, practice papers, tutorials, and more, all
                      completely free of charge.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>
                      {" "}
                      Is CamBright really free?
                    </AccordionTrigger>
                    <AccordionContent>
                      YES, CamBright is entirely free! All the resources,
                      including study guides, past papers, and video tutorials,
                      are available at no cost. We believe that education should
                      be accessible to everyone, regardless of financial
                      background. S
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>
                      {" "}
                      Which subjects are covered on CamBright?
                    </AccordionTrigger>
                    <AccordionContent>
                      CamBright offers resources for a wide range of subjects,
                      primarily focusing on IGCSE and A-Level courses. We cover
                      subjects including Mathematics, Physics, Chemistry,
                      Biology, English, Computer Science, History, and more.
                      We&apos;re continuously working to expand our offerings to
                      include even more subjects.
                    </AccordionContent>
                  </AccordionItem>{" "}
                  <AccordionItem value="item-3">
                    <AccordionTrigger>
                      {" "}
                      Can I contribute to CamBright?
                    </AccordionTrigger>
                    <AccordionContent>
                      Yes! If you have valuable educational content, such as
                      notes, tutorials, or study tips that you think would
                      benefit others, you can contribute to CamBright. Simply
                      contact us through our &ldquo;apply as tutor&rdquo; page
                      to get involved. We welcome all educational contributions!
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </section>

            {/* Full Guide Tab Section */}
            <section className="mb-24 text-start">
              <h3 className="text-3xl sm:text-4xl font-semibold mb-8 text-purple-400">
                Full Guide
              </h3>
              <p className="text-lg sm:text-xl md:text-2xl font-light mb-12 opacity-90">
                Comprehensive guide to using our website
              </p>
              <div className="flex justify-center flex-wrap gap-10 mb-12">
                <Tabs defaultValue="1" className="w-full sm:w-[800px]">
                  {/* Tabs List */}
                  <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <TabsTrigger value="1">MCQ Mock</TabsTrigger>
                    <TabsTrigger value="2">Past Papers</TabsTrigger>
                    <TabsTrigger value="3">Other</TabsTrigger>
                  </TabsList>

                  {/* Tab Content */}
                  <div className="w-full px-4 mt-4 sm:mt-8 md:mt-8 lg:mt-8">
                    <TabsContent value="1">
                      <h1>MCQ Mock Exams</h1>
                      <p className="text-sm sm:text-sm md:text-sm font-light mb-12 opacity-90">
                        <Link href={"mcq-solver"} className="text-purple-400">
                          Here
                        </Link>
                        , you can set a timer if you like, and open the paper
                        from our website if you need to, then select answers you
                        think are right for a set time, and then submit answers
                        and our auto marking system will mark it for you and
                        tell you your level! you can always use the MS linked in
                        our website to re-check
                      </p>
                    </TabsContent>

                    <TabsContent value="2">
                      <h1>Past Papers</h1>
                      <p className="text-sm sm:text-sm md:text-sm font-light mb-12 opacity-90">
                        <Link href={"past-papers"} className="text-purple-400">
                          Here
                        </Link>
                        , you can get access to latest past papers,
                        mark-schemes, and solved past papers with model answers
                      </p>
                    </TabsContent>

                    <TabsContent value="3">
                      <h1>Progress Tracker</h1>
                      <p className="text-sm sm:text-sm md:text-sm font-light mb-12 opacity-90">
                        You can track your progress here
                      </p>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </section>

            {/* Tutors Guide Section */}
            <section className="mb-24 text-start">
              <h3 className="text-3xl sm:text-4xl font-semibold mb-8 text-purple-400">
                Tutors Guide
              </h3>
              <p className="text-lg sm:text-xl md:text-2xl font-light mb-12 opacity-90">
                A guide tailored to tutors, including helpful tips and video
                tutorials.
              </p>
              <div className="flex justify-center flex-wrap gap-10 mb-12">
                <Tabs defaultValue="1" className="w-full sm:w-[800px]">
                  {/* Tabs List */}
                  <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <TabsTrigger value="1">Tutor Dashboard</TabsTrigger>
                    <TabsTrigger value="2">Tutor Signup</TabsTrigger>
                  </TabsList>

                  {/* Tab Content */}
                  <div className="w-full px-4 mt-4 sm:mt-8 md:mt-8 lg:mt-8">
                    <TabsContent value="1">
                      <h1>Tutor Dashboard</h1>
                      <p className="text-sm sm:text-sm md:text-sm font-light mb-12 opacity-90">
                        Please use the videos below!{" "}
                      </p>
                    </TabsContent>

                    <TabsContent value="2">
                      <h1>Tutor Signup</h1>
                      <p className="text-sm sm:text-sm md:text-sm font-light mb-12 opacity-90">
                        Please use the videos below, and apply as a tutor{" "}
                        <Link className="text-purple-400" href={"tutor-apply"}>
                          Here
                        </Link>
                        ! (you will get credit hours for free..)
                      </p>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>

              {/* Collapsible Videos */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="video-1">
                  <AccordionTrigger>Tutor Dashboard Tutorial</AccordionTrigger>
                  <AccordionContent>
                    <div className="relative rounded-lg aspect-video mt-4">
                      <Player {...videoJsOptionsx} onReady={() => videoUrlX} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="video-2">
                  <AccordionTrigger>Tutor Signup Tutorial</AccordionTrigger>
                  <AccordionContent>
                    <div className="relative rounded-lg aspect-video mt-4">
                      <Player {...videoJsOptionsy} onReady={() => videoUrlY} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Contact Form Section */}
            <section className="text-start" id="sendmsg">
              <h3 className="text-3xl sm:text-4xl font-semibold mb-8">
                Send a <span className="text-purple-400">Message</span>
              </h3>
              <p className="text-lg sm:text-xl md:text-2xl font-light mb-12 opacity-90">
                We will respond to your registered email address in less than 1
                day. You can specify another email address in your message.
              </p>
              <div className="flex justify-center flex-wrap gap-10 mb-12">
                <PlaceholdersAndVanishInput
                  placeholders={placeholders}
                  onChange={handleChange}
                  onSubmit={onSubmit}
                />
              </div>
              <div className="min-w-full">
                <div className="mx-auto flex justify-center max-w-md">
                  <div className={copied ? "absolute" : "hidden"}></div>
                  <MagicButton
                    width="60"
                    title={copied ? "Email is Copied!" : "Copy our email"}
                    icon={copied ? <IoCheckmark /> : <IoCopyOutline />}
                    position="left"
                    handleClick={handleCopy}
                    otherClasses="!bg-[#161A31]"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </BackgroundLines>{" "}
      <Footerer />
    </div>
  );
};

export default TutorPage;
