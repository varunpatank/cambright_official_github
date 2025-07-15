import Image from "next/image";
import React from "react";
import { Timeline } from "@/components/ui/timeline";

export function TimelineStory() {
  const data = [
    {
      title: "Our Story",
      content: (
        <div>
          <p className=" text-white text-xs md:text-sm font-normal mb-8">
            We&apos;ve been working on Cambright for nearly a year, channeling
            our passion and commitment to create a platform that empowers IGCSE
            students globally. Starting with a small team of dedicated
            volunteers and advisors, we&apos;ve built Cambright to bridge
            educational gaps and provide crucial support to those in need.
          </p>
        </div>
      ),
    },
    {
      title: "The Beginning",
      content: (
        <div>
          <p className=" text-neutral-200 text-xs md:text-sm font-normal mb-8">
            From the onset, our vision was clear: to make high-quality
            educational resources accessible to over 1 million IGCSE students
            worldwide.
          </p>
          <p className=" text-neutral-200 text-xs md:text-sm font-normal mb-8">
            We recognized the challenges faced by students in diverse
            environments, especially those in war-torn areas, and we committed
            to not only educating but also aiding these communities.{" "}
          </p>{" "}
        </div>
      ),
    },
    {
      title: "Our Goal",
      content: (
        <div>
          <p className=" text-neutral-200 text-xs md:text-sm font-normal mb-8">
            Our mission extends beyond just academic support; we aim to enact
            real change. With every resource, mock exam, and note we provide, we
            are also raising funds to assist people affected by conflicts. Our
            goals are ambitious but clear: educate, support, and uplift.
          </p>{" "}
        </div>
      ),
    },
    {
      title: "Future Checklist",
      content: (
        <div>
          <p className=" text-neutral-200 text-xs md:text-sm font-normal mb-4">
            To continue our mission, we are excited to announce upcoming
            features that will further enrich our learners&apos; experiences:
          </p>
          <div className="mb-8">
            <div className="flex gap-2 items-center font-bold text-neutral-300 text-xs md:text-sm">
              ✅ Full Written Mock Exam Generator (We got MCQ! still Written
              exams..)
            </div>
            <div className="flex gap-2 items-center  text-neutral-300 text-xs md:text-sm font-bold">
              ✅ Question Searcher
            </div>
            <div className="flex gap-2 items-center  text-neutral-300 text-xs md:text-sm font-bold">
              ✅ Comprehensive Noters for all IGCSE Classes{" "}
            </div>
          </div>
        </div>
      ),
    },
  ];
  return (
    <div className="w-full">
      <Timeline data={data} />
    </div>
  );
}
