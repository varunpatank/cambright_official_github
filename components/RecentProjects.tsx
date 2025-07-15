// v0.0.01 salah

"use client";

import Image from "next/image";
import { MousePointerClick } from "lucide-react";
import { projects } from "@/data";
import { PinContainer } from "./ui/Pin";

const RecentProjects = () => {
  return (
    <div className="py-20">
      <h1 className="heading">
        A small selection of{" "}
        <span className="text-purple-200">featured courses</span>
      </h1>
      <div className="flex flex-wrap items-center justify-center p-4 gap-16 mt-10">
        {projects.map((item) => (
          <div
            className="lg:min-h-[32.5rem] h-[25rem] flex items-center justify-center sm:w-96 w-[80vw]"
            key={item.id}
          >
            <PinContainer title="Enroll" href="/sign-up">
              <div className="relative flex items-center justify-center sm:w-96 w-[80vw] overflow-hidden h-[20vh] lg:h-[30vh] mb-10">
                <div
                  className="relative w-full h-full overflow-hidden lg:rounded-3xl"
                  style={{ backgroundColor: "#13162D" }}
                >
                  <Image
                    src="/bg.png"
                    alt="bgimg"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 80vw, 384px"
                  />
                </div>
                <Image
                  src={item.img}
                  alt="cover"
                  fill
                  className="z-10 absolute bottom-0 object-cover"
                  sizes="(max-width: 768px) 80vw, 384px"
                />
              </div>

              <h1 className="font-bold lg:text-2xl md:text-xl text-base line-clamp-1">
                {item.title}
              </h1>

              <p
                className="lg:text-xl lg:font-normal font-light text-sm line-clamp-2"
                style={{
                  color: "#BEC1DD",
                  margin: "1vh 0",
                }}
              >
                {item.des}
              </p>

              <div className="flex items-center justify-between mt-7 mb-3">
                <div className="flex items-center">
                  {item.iconLists.map((icon, index) => (
                    <div
                      key={index}
                      className="border border-white/[.2] rounded-full bg-black lg:w-14 lg:h-14 w-12 h-12 flex justify-center items-center"
                      style={{
                        transform: `translateX(-${5 * index + 2}px)`,
                      }}
                    >
                      <Image src={icon} alt={`icon${index}`} width={40} height={40} className="p-2" />
                    </div>
                  ))}
                </div>
                <a href="/sign-up">
                  <div className="flex justify-center items-center">
                    <p className="flex lg:text-xl md:text-xs text-sm text-purple">
                      Enroll for Free
                    </p>
                    <MousePointerClick className="ms-3" color="#CBACF9" />
                  </div>
                </a>
              </div>
            </PinContainer>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentProjects;
