import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const LearnPage = async () => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/dashboard");
  }
  return (
    <div className="flex flex-row-reverse px-6 gap-[46px]">
      <h1>hi</h1>
    </div>
  );
};

export default LearnPage;
