"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import LoadingOverlay from "@/components/LoadingOverlay";
import { defaultIds } from "../users";
import {
  CheckCircle,
  FlagIcon,
  HeartIcon,
  ShieldCheck,
  ShieldIcon,
  VerifiedIcon,
} from "lucide-react";
import { StarsBackground } from "@/components/ui/shooting-stars";
import { StarryBackground } from "@/components/ui/starry-background";
import { Cover } from "@/components/ui/cover";
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
  clerkData?: {
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    profileImageUrl: string;
    lastSignInAt: number | null;
    createdAt: number;
  } | null;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardUser[];
  total: number;
  clerkUserCount: number | string;
  databaseUserCount: number;
  timestamp: string;
  error?: string;
}
export const dynamic = "force-dynamic";
// export const maxDuration = 300;

const LeaderBoardPage = () => {
  const { user, isLoaded } = useUser(); // Logged-in user

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [leaderboardStats, setLeaderboardStats] = useState<{
    total: number;
    clerkUserCount: number | string;
    databaseUserCount: number;
  } | null>(null);
  const [followingState, setFollowingState] = useState<Map<string, boolean>>(
    new Map()
  );
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [rankDelta, setRankDelta] = useState(0);
  const previousRankRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("/api/leaderboard", {
          cache: "no-store",
        });
        if (response.ok) {
          const data: LeaderboardResponse = await response.json();
          setLeaderboard(data.leaderboard);
          setLastUpdated(new Date());
          setLeaderboardStats({
            total: data.total,
            clerkUserCount: data.clerkUserCount,
            databaseUserCount: data.databaseUserCount,
          });
          // Only clear loading once data has actually arrived — an early
          // retry (e.g. a cold-start db connection) shouldn't flash an
          // empty board before the next poll fills it in.
          setLoading(false);
        } else {
          console.error("Failed to fetch leaderboard data");
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchLeaderboard();
    // Faster refresh cadence so rank changes are visible quickly.
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const sortedLeaderboard = useMemo(
    () => [...leaderboard].sort((a, b) => b.XP - a.XP),
    [leaderboard]
  );

  const currentUserRank = useMemo(() => {
    if (!user?.id) return null;
    const rank = sortedLeaderboard.findIndex((u) => u.userId === user.id);
    return rank === -1 ? null : rank + 1;
  }, [sortedLeaderboard, user?.id]);

  const currentUserEntry = useMemo(() => {
    if (!user?.id) return null;
    return sortedLeaderboard.find((u) => u.userId === user.id) ?? null;
  }, [sortedLeaderboard, user?.id]);

  useEffect(() => {
    if (!currentUserRank) return;

    if (previousRankRef.current !== null) {
      setRankDelta(previousRankRef.current - currentUserRank);
    }

    previousRankRef.current = currentUserRank;
  }, [currentUserRank]);

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

  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const activeUsersCount = sortedLeaderboard.filter((u) => {
    const lastSignInAt = u.clerkData?.lastSignInAt;
    return typeof lastSignInAt === "number" && now - lastSignInAt <= 30 * oneDayMs;
  }).length;
  const loginsTodayCount = sortedLeaderboard.filter((u) => {
    const lastSignInAt = u.clerkData?.lastSignInAt;
    return typeof lastSignInAt === "number" && now - lastSignInAt <= oneDayMs;
  }).length;

  return (
    <TooltipProvider delayDuration={100}>
      <div>
        <StarsBackground />
        
        {/* Starry Header */}
        <StarryBackground height="240px" intensity="medium" showMeteors={true} className="mb-8 rounded-none">
          <div className="relative z-10 flex flex-col items-center justify-center h-full pt-8 text-center">
            <Cover className="inline-block px-8 py-6">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 font-sora text-center">
                Leaderboard<span className="text-purple-400">.</span>
              </h1>
              <p className="text-gray-400 text-center">Ranked by XP from total visit time on CamBright — updated in real time</p>
            </Cover>
          </div>
        </StarryBackground>
        
        <div className="max-w-4xl mx-auto px-6 pb-6">
        {/* Leaderboard Stats */}
        {leaderboardStats && (
          <div className="mb-8">
            {currentUserRank && currentUserEntry && (
              <div className="mb-4 rounded-2xl border border-purple-400/30 bg-gradient-to-r from-purple-600/20 via-violet-500/15 to-cyan-500/15 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-purple-200">Your Live Rank</div>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="text-3xl font-bold text-white">#{currentUserRank}</span>
                      <span className="rounded-full border border-white/15 bg-black/30 px-2 py-0.5 text-xs text-white/80">
                        {currentUserEntry.XP} XP
                      </span>
                      {rankDelta !== 0 && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            rankDelta > 0
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                          }`}
                        >
                          {rankDelta > 0 ? `+${rankDelta} rank` : `${rankDelta} rank`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-white/70">
                    Live refresh every 5s
                    {lastUpdated ? ` • Updated ${lastUpdated.toLocaleTimeString()}` : ""}
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-n-7/60 border border-white/10 rounded-2xl p-4">
                <div className="text-2xl font-bold text-cyan-400">{activeUsersCount}</div>
                <div className="text-sm text-gray-400">Active Users</div>
              </div>
              <div className="bg-n-7/60 border border-white/10 rounded-2xl p-4">
                <div className="text-2xl font-bold text-purple-400">{leaderboardStats.total}</div>
                <div className="text-sm text-gray-400">Total Users</div>
              </div>
              <div className="bg-n-7/60 border border-white/10 rounded-2xl p-4">
                <div className="text-2xl font-bold text-amber-400">{loginsTodayCount}</div>
                <div className="text-sm text-gray-400">Logins Today</div>
              </div>
            </div>
          </div>
        )}
        {/* Loading state */}
        {loading ? (
          <div className="text-center text-xl">Loading...</div>
        ) : (
          <div className="space-y-6">
            {/* Bar Graph with User Avatars */}
            <div className="mb-12 mt-4">
              <div className="mx-auto flex max-w-4xl justify-center items-end gap-4 md:gap-8">
              {sortedLeaderboard.slice(0, 3).map((leaderboardUser, index) => (
                <div
                  key={leaderboardUser.userId}
                  className="relative flex w-32 md:w-44 flex-col items-center"
                >
                  <div className="min-h-[44px] mb-1 flex flex-wrap items-center justify-center gap-1 text-[0.9rem] font-semibold text-white text-center leading-tight">
                    {leaderboardUser.id.startsWith('new-') ? (
                      <span>{leaderboardUser.name}</span>
                    ) : (
                      <Link href={`/profiles/${leaderboardUser.name}`}>
                        {leaderboardUser.name}
                      </Link>
                    )}
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
                  </div>

                  {/* User image */}
                  <div className="relative text-center mb-1">
                    <div className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 rounded-full bg-gray-200 overflow-hidden hover:ring-2 transition-all hover:ring-purple-400 ring-2 ring-white/10">
                      <Image
                        src={leaderboardUser.imageUrl || "/default-avatar.png"}
                        alt={leaderboardUser.name}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>

                  {/* Static Rectangular Bars */}
                  <div className="mt-0.5 w-20 sm:w-24 md:w-32 h-24 flex items-end">
                    <div
                      className={`rounded-t-2xl rounded-b-md w-full shadow-lg ${
                        index === 0
                          ? "bg-gradient-to-t from-yellow-700 to-yellow-400 shadow-yellow-900/40"
                          : index === 1
                          ? "bg-gradient-to-t from-slate-600 to-slate-300 shadow-slate-900/40"
                          : "bg-gradient-to-t from-amber-900 to-amber-500 shadow-amber-900/40"
                      }`}
                      style={{ height: index === 0 ? "5rem" : index === 1 ? "4rem" : "3rem" }}
                    />
                  </div>

                  {/* XP under the bar */}
                  <span className="mt-2 text-sm text-white">
                    {leaderboardUser.XP} XP
                  </span>
                </div>
              ))}
              </div>
            </div>

            {/* List of remaining leaderboard users */}
            <div className="space-y-4">
              {sortedLeaderboard.slice(3).map((leaderboardUser, index) => (
                <div
                  key={leaderboardUser.userId}
                  id={leaderboardUser.userId === user?.id ? "my-rank-row" : undefined}
                  className={`flex items-center p-4 rounded-lg transition duration-300 ${
                    leaderboardUser.userId === user?.id
                      ? "bg-purple-500/20 border border-purple-400/40"
                      : "bg-n-8 hover:scale-105"
                  }`}
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
                        {leaderboardUser.id.startsWith('new-') ? (
                          <span className="text-lg font-semibold">{leaderboardUser.name}</span>
                        ) : (
                          <Link href={`/profiles/${leaderboardUser.name}`}>
                            <span className="text-lg font-semibold">
                              {leaderboardUser.name}
                            </span>
                          </Link>
                        )}
                        {leaderboardUser.userId === user?.id && (
                          <span className="ml-2 rounded-full bg-purple-500/25 border border-purple-400/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-purple-200">
                            You
                          </span>
                        )}
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
                        {/* New User Badge for users with 0 XP and Clerk data */}
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
      </div>
      </div>
    </TooltipProvider>
  );
};

export default LeaderBoardPage;
