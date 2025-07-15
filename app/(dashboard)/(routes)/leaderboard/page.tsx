"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import LoadingOverlay from "@/components/LoadingOverlay";
import { defaultIds } from "../users";
import {
  CheckCircle,
  CrownIcon,
  FlagIcon,
  HeartIcon,
  ShieldCheck,
  ShieldIcon,
  VerifiedIcon,
} from "lucide-react";
import { StarsBackground } from "@/components/ui/shooting-stars";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LeaderboardUser {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  email: string;
  followers: number;
  following: number;
  biog: string;
  XP: number;
}
export const dynamic = "force-dynamic";
// export const maxDuration = 300;

const LeaderBoardPage = () => {
  const { user, isLoaded } = useUser(); // Logged-in user

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [followingState, setFollowingState] = useState<Map<string, boolean>>(
    new Map()
  );
  const [loading, setLoading] = useState<boolean>(true); // Loading state

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true); // Start loading indicator
      const response = await fetch("/api/leaderboard");
      if (response.ok) {
        const data: LeaderboardUser[] = await response.json();
        setLeaderboard(data);
      } else {
        console.error("Failed to fetch leaderboard data");
      }
      setLoading(false); // Set loading to false after fetching
    };

    fetchLeaderboard();
  }, []); // Empty dependency array ensures it runs on mount

  // Function to handle XP increment
  const handleXPIncrement = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch("/api/update-xp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setLeaderboard((prevLeaderboard) =>
          prevLeaderboard.map((leaderboardUser) =>
            leaderboardUser.userId === updatedUser.userId
              ? { ...leaderboardUser, XP: updatedUser.XP }
              : leaderboardUser
          )
        );
      } else {
        console.error("Failed to increment XP");
      }
    } catch (error) {
      console.error("Error incrementing XP:", error);
    }
  };

  const handleFollowToggle = async (
    followedUserId: string,
    isFollowing: boolean
  ) => {
    const action = isFollowing ? "unfollow" : "follow";

    const response = await fetch("/api/follow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        followedUserId,
        action,
      }),
    });

    if (response.ok) {
      console.log(
        `${
          action.charAt(0).toUpperCase() + action.slice(1)
        } action was successful`
      );

      // Optimistically update the leaderboard state
      setLeaderboard((prevLeaderboard) =>
        prevLeaderboard.map((leaderboardUser) =>
          leaderboardUser.userId === followedUserId
            ? {
                ...leaderboardUser,
                followers: leaderboardUser.followers + (isFollowing ? -1 : 1),
              }
            : leaderboardUser
        )
      );

      // Toggle the following state
      setFollowingState((prevState) => {
        const updatedState = new Map(prevState);
        updatedState.set(followedUserId, !isFollowing);
        return updatedState;
      });
    } else {
      console.error("Failed to follow/unfollow user");
    }
  };

  if (!isLoaded) {
    return <LoadingOverlay />;
  }
  const tutorIds =
    process.env.NEXT_PUBLIC_TUTOR_IDS?.split(",") || defaultIds.tutorIds;
  const verifiedIds =
    process.env.NEXT_PUBLIC_VERIFIED_IDS?.split(",") || defaultIds.verifiedIds;
  const teamIds =
    process.env.NEXT_PUBLIC_TEAM_IDS?.split(",") || defaultIds.teamIds;
  const boardIds =
    process.env.NEXT_PUBLIC_BOARD_IDS?.split(",") || defaultIds.boardIds;

  return (
    <TooltipProvider delayDuration={100}>
      <div className="max-w-4xl mx-auto p-6">
        <StarsBackground />
        <h1 className="text-4xl sm:text-5xl md:text-5xl text-white font-extrabold text-center text-gradient bg-clip-text text-transparent mb-12 sm:mb-16 relative">
          Leaderboard.
          <p className="text-lg text-gray-500">Why not beat the toppers?</p>
        </h1>
        {/* Loading state */}
        {loading ? (
          <div className="text-center text-xl">Loading...</div>
        ) : (
          <div className="space-y-6">
            {/* Bar Graph with User Avatars */}
            <div className="flex justify-center items-end space-x-8 mb-12">
              {leaderboard.slice(0, 3).map((leaderboardUser, index) => (
                <div
                  key={leaderboardUser.userId}
                  className="relative flex flex-col items-center space-y-4"
                >
                  {/* Crown for #1 */}
                  {index === 0 && (
                    <div
                      className="absolute top-[-30px] left-1/2 transform -translate-x-1/2"
                      style={{
                        zIndex: 10,
                      }}
                    >
                      <CrownIcon className="w-6 h-6 text-yellow-500" />
                    </div>
                  )}

                  {/* User image */}
                  <div className="relative text-center">
                    <div className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 rounded-full bg-gray-200 overflow-hidden hover:ring-2 transition-all hover:ring-purple-400">
                      <Image
                        src={leaderboardUser.imageUrl || "/default-avatar.png"}
                        alt={leaderboardUser.name}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <span className="mt-2 text-[0.9rem] font-semibold text-white text-center">
                      <Link href={`/profiles/${leaderboardUser.name}`}>
                        {leaderboardUser.name}
                      </Link>
                      {tutorIds.includes(leaderboardUser.userId) &&
                        !teamIds.includes(leaderboardUser.userId) &&
                        !boardIds.includes(leaderboardUser.userId) && (
                          <Tooltip>
                            <TooltipTrigger>
                              <HeartIcon className="w-4 h-4 ml-1 text-purple-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">Volunteer</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      {teamIds.includes(leaderboardUser.userId) && (
                        <Tooltip>
                          <TooltipTrigger>
                            <ShieldCheck className="w-4 h-4 ml-1  text-green-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">Founder</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {boardIds.includes(leaderboardUser.userId) &&
                        !teamIds.includes(leaderboardUser.userId) && (
                          <Tooltip>
                            <TooltipTrigger>
                              <ShieldIcon className="w-4 h-4 ml-1 text-green-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">Board</p>
                            </TooltipContent>
                          </Tooltip>
                        )}{" "}
                      {verifiedIds.includes(leaderboardUser.userId) &&
                        !teamIds.includes(leaderboardUser.userId) &&
                        !boardIds.includes(leaderboardUser.userId) &&
                        !tutorIds.includes(leaderboardUser.userId) && (
                          <Tooltip>
                            <TooltipTrigger>
                              <VerifiedIcon className="w-4 h-4 ml-1 text-purple-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">Verified</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                    </span>
                  </div>

                  {/* Static Rectangular Bars */}
                  <div className="w-16 sm:w-24 md:w-32">
                    {index === 1 && (
                      <div
                        className="bg-purple-600 rounded-md w-full"
                        style={{ height: "4rem" }} // First bar height
                      ></div>
                    )}
                    {index === 0 && (
                      <div
                        className="bg-purple-600 rounded-md w-full"
                        style={{ height: "5rem" }} // Second bar height
                      ></div>
                    )}
                    {index === 2 && (
                      <div
                        className="bg-purple-600 rounded-md w-full"
                        style={{ height: "3rem" }} // Third bar height
                      ></div>
                    )}
                  </div>

                  {/* XP under the bar */}
                  <span className="text-sm text-white">
                    {leaderboardUser.XP} XP
                  </span>
                </div>
              ))}
            </div>

            {/* List of remaining leaderboard users */}
            <div className="space-y-4">
              {leaderboard.slice(3).map((leaderboardUser, index) => (
                <div
                  key={leaderboardUser.userId}
                  className="flex items-center p-4 rounded-lg bg-n-8 hover:scale-105 transition duration-300"
                >
                  <span className="mr-4 text-2xl font-semibold text-purple-500">
                    #{index + 4} {/* Add rank number */}
                  </span>
                  <div className="flex items-center space-x-4">
                    <Image
                      src={leaderboardUser.imageUrl || "/default-avatar.png"}
                      alt={leaderboardUser.name}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                    <div className="flex flex-col ">
                      {" "}
                      <div className="flex ">
                        <Link href={`/profiles/${leaderboardUser.name}`}>
                          <span className="text-lg font-semibold">
                            {leaderboardUser.name}
                          </span>
                        </Link>{" "}
                        {tutorIds.includes(leaderboardUser.userId) &&
                          !teamIds.includes(leaderboardUser.userId) &&
                          !boardIds.includes(leaderboardUser.userId) && (
                            <Tooltip>
                              <TooltipTrigger>
                                <HeartIcon className="w-4 h-4 ml-1 text-purple-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">Volunteer</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        {teamIds.includes(leaderboardUser.userId) && (
                          <Tooltip>
                            <TooltipTrigger>
                              <ShieldCheck className="w-4 h-4 ml-1 text-green-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">Founder</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {boardIds.includes(leaderboardUser.userId) &&
                          !teamIds.includes(leaderboardUser.userId) && (
                            <Tooltip>
                              <TooltipTrigger>
                                <ShieldIcon className="w-4 h-4 ml-1 text-green-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">Board</p>
                              </TooltipContent>
                            </Tooltip>
                          )}{" "}
                        {verifiedIds.includes(leaderboardUser.userId) &&
                          !teamIds.includes(leaderboardUser.userId) && (
                            <Tooltip>
                              <TooltipTrigger>
                                <VerifiedIcon className="w-4 h-4 ml-1 text-purple-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">Verified</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                      </div>
                      <span className="text-sm text-gray-400">
                        {leaderboardUser.XP} XP
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}{" "}
        {/* XP Increment Button */}
        <div className="text-center mb-8">
          <Button
            onClick={handleXPIncrement}
            className="px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-lg"
          >
            Add 5 XP
          </Button>
          <p className="mt-2 text-sm text-muted-foreground">
            Until we add the quiz platform, <br /> XP system is not yet complete
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default LeaderBoardPage;
