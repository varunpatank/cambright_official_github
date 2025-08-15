// v.0.0.01 salah
// NOTE: Modified to allow all authenticated users access to tutor features

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const TutorLayout = ({ children }: { children: React.ReactNode }) => {
  const { userId } = auth();
  
  // Only require authentication, not tutor status
  if (!userId) {
    return redirect("/sign-in");
  }
  
  return <>{children} </>;
};

export default TutorLayout;
