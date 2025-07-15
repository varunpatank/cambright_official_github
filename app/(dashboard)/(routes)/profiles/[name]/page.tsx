import { db } from "@/lib/db"; // Ensure you're importing your DB setup
import Image from "next/image";
import { notFound, redirect } from "next/navigation"; // Used to show 404 page if the profile doesn't exist
import { Button } from "@/components/ui/button"; // Assuming Button component exists
import { FaChalkboardTeacher, FaUsers, FaUserTie } from "react-icons/fa"; // Assuming you want icons for tutor, team, and board
import { defaultIds } from "../../users";
import {
  CheckCircle2Icon,
  FlagIcon,
  HeartIcon,
  ShieldCheck,
  ShieldIcon,
  VerifiedIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BackgroundLines } from "@/components/ui/background-lines";
import { BackgroundBeamsWithCollision } from "@/components/background-beams-with-collision";
import { Preview } from "@/components/preview";
import { auth } from "@clerk/nextjs/server";
import GiveXpButton from "./_components/givexp";
import FollowButton from "./_components/FollowButton";

interface UserProfile {
  id: string;
  name: string;
  imageUrl: string;
  email: string;
  biog: string;
  XP: number;
  followersCount: number;
  followingCount: number;
  tags: { name: string }[];
}

const ProfilePage = async ({ params }: { params: { name: string } }) => {
  const { name } = params;
  // Fetch user data based on the `profileId`
  const u = auth();
  const userIId = auth().userId;
  if (!u) {
    return redirect("/dashboard");
  }
  const user = await db.userModel.findFirst({
    where: {
      name: name, // Use the profileId to search the database
    },
    include: {
      tags: true, // Include tags (if necessary)
    },
  });
  const myuser = await db.userModel.findFirst({
    where: {
      userId: userIId as string, // Assert that userIId is a string
    },
  });

  // If no user is found, return a 404 page
  if (!user) {
    return notFound();
  }
  const allUsers = await db.userModel.findMany({
    orderBy: {
      XP: "desc", // Sort by XP in descending order
    },
  });
  const userRank = allUsers.findIndex((u) => u.userId === user.userId) + 1; // Rank starts from 1
  let rankColor = "text-purple-400"; // Default color
  if (userRank <= 3) {
    rankColor = "text-yellow-400"; // Gold for rank <= 3
  } else if (userRank <= 10) {
    rankColor = "text-green-400"; // Green for rank 3-10
  }
  // Fetch the environment variables
  const tutorIds =
    process.env.NEXT_PUBLIC_TUTOR_IDS?.split(",") || defaultIds.tutorIds;
  const verifiedIds =
    process.env.NEXT_PUBLIC_VERIFIED_IDS?.split(",") || defaultIds.verifiedIds;
  const teamIds =
    process.env.NEXT_PUBLIC_TEAM_IDS?.split(",") || defaultIds.teamIds;
  const boardIds =
    process.env.NEXT_PUBLIC_BOARD_IDS?.split(",") || defaultIds.boardIds;

  // Check if the current name matches any of the specific roles
  const isTutor = tutorIds.includes(user.userId);
  const isTeam = teamIds.includes(user.userId);
  const isBoard = boardIds.includes(user.userId);
  const isVerified = verifiedIds.includes(user.userId);

  const bioContent =
    user.biog === "<p></p>" || !user.biog || user.biog === "<h3><br></h3>"
      ? "No bio set"
      : user.biog;

  return (
    <TooltipProvider delayDuration={100}>
      <div className="max-w-4xl mx-auto text-white mt-8">
        <BackgroundBeamsWithCollision>
          <div className="p-6 rounded-lg bg-n-7 space-y-6 mx-2 w-full">
            {/* Profile Card */}
            <div className="flex flex-col items-center space-y-4">
              {/* Profile Image */}
              <div className="relative w-32 h-32 rounded-full overflow-hidden  hover:ring-2 hover:ring-purple-500 transition-all">
                <Image
                  src={user.imageUrl || "/default-avatar.png"}
                  alt={user.name || "User"}
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-xl text-none-300">
                    <span className={rankColor}>#{userRank}</span>
                  </span>{" "}
                  <span className="text-2xl font-semibold">{user.name}</span>
                  {isTutor && !isTeam && !isBoard && (
                    <Tooltip>
                      <TooltipTrigger>
                        <HeartIcon className="w-5 h-5 text-purple-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">Volunteer</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {isVerified && !isTeam && !isBoard && (
                    <Tooltip>
                      <TooltipTrigger>
                        <VerifiedIcon className="w-5 h-5 text-purple-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">Verified</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {isTeam && (
                    <Tooltip>
                      <TooltipTrigger>
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">Founder</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {isBoard && !isTeam && (
                    <Tooltip>
                      <TooltipTrigger>
                        <ShieldIcon className="w-5 h-5 text-green-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">Board</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                {/* <span className="text-sm text-none-400">{user.email}</span> */}
                <div className="mt-2 flex items-center space-x-6">
                  <span className="text-lg font-semibold text-none-300">
                    <strong>{user.XP}</strong>
                    <span className="text-purple-400"> XP</span>
                  </span>{" "}
                </div>
                <div className="mt-2 flex items-center space-x-6">
                  <span className="text-sm text-none-300">
                    <strong>{user.followers}</strong> Followers
                  </span>
                  <span className="text-sm text-none-300">
                    <strong>{user.following}</strong> Following
                  </span>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div>
              <h2 className="text-lg font-semibold text-none-300">Bio</h2>
              {/* <h2 className="text-lg font-semibold text-none-300">Bio</h2> */}
              {/* <div className="flex flex-col items-start w-full space-y-0"> */}
              <Preview value={bioContent} />
              {/* </div> */}
            </div>

            {/* Tags Section */}
            <div>
              <h2 className="text-lg font-semibold text-none-300 wavyhair">
                Tags
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {user.tags
                  .filter((tag) => tag.name !== "Beginner") // Filter out the "Beginner" tag
                  .map((tag, index) => (
                    <div
                      key={index}
                      className=" bg-n-8 px-2  rounded-full flex items-center space-x-2"
                    >
                      <span className="px-3 py-1 text-sm  text-none-100 rounded-full">
                        {tag.name}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {user.userId !== u.userId && (
              <div className="mt-4 flex space-x-4 justify-center">
                {/* Follow Button */}
                <FollowButton
                  userId={user.userId}
                  currentUserId={myuser?.userId || ""}
                />

                {user.userId !== u.userId && (
                  <GiveXpButton
                    userIdx={user.userId}
                    userXXP={myuser?.XP || 0}
                  />
                )}
              </div>
            )}
          </div>
        </BackgroundBeamsWithCollision>
      </div>
    </TooltipProvider>
  );
};

export default ProfilePage;
