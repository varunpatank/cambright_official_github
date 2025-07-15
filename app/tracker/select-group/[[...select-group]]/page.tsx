"use client";
import { useEffect } from "react";
import { OrganizationList } from "@clerk/nextjs";
import "./customer.css";
import { CustomOrganizationSwitcher } from "../../_components/CustomOrganizationSwitcher";
import { BackgroundLines } from "@/components/ui/background-lines";
import { BackgroundBeamsWithCollision } from "@/components/background-beams-with-collision";
import { Cover } from "@/components/ui/cover";
export default function CreateOrganizationPage() {
  useEffect(() => {
    const header = document.querySelector(".cl-internal-17wmim4");
    const downheader = document.querySelector(
      ".cl-organizationListCreateOrganizationActionButton"
    );
    if (header) {
      header.textContent = "Choose Study Group";
      header.classList.add("centered-text");
    }
  }, []);

  return (
    <div className="bg-gradient-to-br from-n-8 to-n-7 text-white  flex h-full">
      <BackgroundLines>
        <div className="relative z-20 px-6 py-5 md:px-12 md:py-8 lg:px-16 lg:py-8 lg:pt-15 md:pt-8 pt-5 flex-grow ">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-wide leading-tight mb-5">
              <Cover>Progress</Cover> Tracker.
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-light mb-12 opacity-90">
              Track your progress, create a study group and gather study buddies
              to boost your studying progress and ACE your exams!
            </p>
            <div className="justify-center items-center flex">
              <OrganizationList
                hidePersonal
                afterSelectOrganizationUrl={"/tracker/group/:id"}
                afterCreateOrganizationUrl={"/tracker/group/:id"}
                afterSelectPersonalUrl={"/tracker/group/:id"}
              />
            </div>
          </div>
        </div>
      </BackgroundLines>
    </div>
  );
}
