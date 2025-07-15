// v0.0.01 salah

"use client";
import { Button } from "@/components/ui/button";
import { StarsBackground } from "@/components/ui/shooting-stars";
import { useMultistepForm } from "@/hooks/use-multistep-form";
import { cn } from "@/lib/utils";
import UserForm from "@/components/userForm";
import TutorsubjectForm from "@/components/TutorsubjectForm";
import AppForm from "@/components/appForm";
import { FormEvent, useState } from "react";
import EmailForm from "@/components/emailForm";
import DownloadBtn from "@/components/passKeyForm";
import Link from "next/link";
import emailjs from "@emailjs/browser";
import { useUser } from "@clerk/nextjs";

type FormData = {
  first_name: string;
  last_name: string;
  age: number | null;
  email: string;
  contact_method: string;
  subject: string;
  board: string;
  app_message: string;
  usern: string;
};

const INITIAL_DATA: FormData = {
  first_name: "",
  last_name: "",
  age: null,
  email: "",
  contact_method: "",
  subject: "",
  board: "IGCSE",
  usern: "",
  app_message: "",
};

const TutorPage = () => {
  const [data, setData] = useState<FormData>(INITIAL_DATA);
  const [isTutorsubjectFormValid, setIsTutorsubjectFormValid] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false); // State to track submission

  const onChange = (name: string, value: string | number | null) => {
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const { steps, currentStepIndex, isFstep, back, next, isLstep } =
    useMultistepForm([
      <UserForm key="userForm" {...data} onChange={onChange} />,
      <EmailForm key="emailForm" {...data} onChange={onChange} />,
      <TutorsubjectForm
        key="tutorsubjectForm"
        onValid={setIsTutorsubjectFormValid}
        {...data}
        onChange={onChange}
      />,
      <AppForm key="appForm" {...data} onChange={onChange} />,
    ]);
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (currentStepIndex === 2 && !isTutorsubjectFormValid) {
      return; // Prevent form submission if TutorsubjectForm is not valid
    }

    if (isLstep) {
      setIsSubmitted(true); // Set submission state when last step is reached

      // Define email data
      const templateParams = {
        first_name: data.first_name,
        last_name: data.last_name,
        age: data.age,
        email: data.email,
        usern: data.usern || "no_username:(",
        contact_method: data.contact_method,
        subject: data.subject,
        board: data.board,
        app_message: data.app_message,
      };
      emailjs
        .send(
          "service_o015xqb", // Replace with your service ID
          "template_0o9o97o", // Replace with your template ID
          templateParams,
          "D77m6aMZqEW-ya7EL" // Replace with your user ID
        )
        .then(
          (response) => {
            console.log("Success:", response);
          },
          (error) => {
            console.error("Error:", error);
          }
        );

      return; // Do not proceed to next step if on last step
    }

    next(); // Move to the next step
  }
  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-black">
      <div className="max-w-md w-full rounded-md md:rounded-2xl p-4 md:p-8 shadow-input bg-gray-900">
        {isSubmitted ? (
          <>
            <DownloadBtn />
            <div className="text-center space-y-4 mt-4 items-center justify-center">
              <Link href={"/dashboard"}>
                <Button variant={"success"}>Done</Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            {currentStepIndex === 0 && (
              <div className="mb-4">
                <a
                  href="/dashboard"
                  className="text-muted-foreground hover:opacity-50 text-sm font-light"
                >
                  &larr; go home
                </a>
              </div>
            )}

            {isFstep && (
              <>
                <h2 className="font-bold text-xl text-neutral-200 text-center">
                  Tutor Application
                </h2>
                <p className=" text-sm max-w-sm mt-2 text-neutral-300 text-center mb-2">
                  Volunteer as a tutor to gain experience and get a certificate
                  with volunteering hours!
                </p>
              </>
            )}

            <div className="relative flex items-center justify-between mb-8">
              <div className="absolute inset-x-0 top-1/2 flex items-center justify-between w-full z-0">
                <div className="w-full border-t border-purple-400" />
              </div>
              <StepCircle
                isActive={currentStepIndex === 0}
                isCompleted={currentStepIndex > 0}
                stepNumber={1}
              />
              <StepCircle
                isActive={currentStepIndex === 1}
                isCompleted={currentStepIndex > 1}
                stepNumber={2}
              />
              <StepCircle
                isActive={currentStepIndex === 2}
                isCompleted={currentStepIndex > 2}
                stepNumber={3}
              />
              <StepCircle
                isActive={currentStepIndex === 3}
                isCompleted={currentStepIndex > 3}
                stepNumber={4}
              />
            </div>

            <form className="space-y-6" onSubmit={onSubmit}>
              {steps[currentStepIndex]}
              <div className="flex w-full space-x-2">
                {!isFstep && (
                  <Button
                    onClick={back}
                    className="flex-1 bg-gradient-to-br relative group/btn text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                    type="button"
                    variant={"secondary"}
                  >
                    Back
                  </Button>
                )}
                {isLstep ? (
                  <Button
                    className="flex-1 bg-gradient-to-br relative group/btn text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_#ffffff40_inset]"
                    variant={"tert"}
                    type="submit"
                  >
                    Submit
                  </Button>
                ) : (
                  <Button
                    className="flex-1 bg-gradient-to-br relative group/btn text-white rounded-md h-10 font-medium  shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_#ffffff40_inset]"
                    variant={"tert"}
                    type="submit"
                  >
                    Next &rarr;
                  </Button>
                )}
              </div>
            </form>
          </>
        )}

        <StarsBackground className="z-0" />
      </div>
    </div>
  );
};

const StepCircle = ({
  isActive,
  isCompleted,
  stepNumber,
}: {
  isActive: boolean;
  isCompleted: boolean;
  stepNumber: number;
}) => {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center w-10 h-10 rounded-full border-2 bg-gray-900 text-white z-10",
        {
          "border-purple-500 bg-purple-500": isCompleted,
          "border-gray-700": !isActive && !isCompleted,
          "border-purple-500": isActive,
        }
      )}
    >
      {isCompleted ? (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <span
          className={cn("text-lg font-semibold", {
            "text-purple-500": isActive,
          })}
        >
          {stepNumber}
        </span>
      )}
    </div>
  );
};

export default TutorPage;
