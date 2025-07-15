// v.0.0.01 salah

import { isTutor } from "@/lib/tutor";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const TutorLayout = ({ children }: { children: React.ReactNode }) => {
  const { userId } = auth();
  if (!isTutor(userId)) {
    return redirect("/dashboard");
  }
  return <>{children} </>;
};

export default TutorLayout;
