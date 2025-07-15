// v0.0.01 salah

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "./ui/MovingBorders";
import Link from "next/link";

const MeetTheTeam = () => {
  const route = useRouter();

  const handleClick = () => {
    route.push("/");
  };

  return (
    <Button
      duration={Math.floor(Math.random() * 10000) + 10000}
      borderRadius="1.75rem"
      style={{
        background: "rgb(4,7,29)",
        backgroundColor:
          "linear-gradient(90deg, rgba(4,7,29,1) 0%, rgba(12,14,35,1) 100%)",
        borderRadius: `calc(1.75rem * 0.96)`,
      }}
      className="flex-1 text-white border-slate-800 hover:border-4 transition-all"
      onClick={handleClick} // Attach the click handler
    >
      <div className="flex lg:flex-row flex-col lg:items-center p-3 py-6 md:p-5 lg:p-10 gap-2">
        <Image
          src={"/teamicon.png"}
          alt={"meet the team"}
          width={60}
          height={60}
          className="w-15 h-15"
        />
        <Link href={"/about"}>
          <h2 className="text-3xl text-gradient-second bold">Meet the Team</h2>
        </Link>
      </div>
    </Button>
  );
};

export default MeetTheTeam;
