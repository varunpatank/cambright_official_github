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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import FollowButton from "../profiles/[name]/_components/FollowButton";
import GiveXpButton from "../profiles/[name]/_components/givexp";

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

function ProfileModal({
  profile,
  currentUserId,
  currentUserXp,
  tutorIds,
  teamIds,
  boardIds,
  verifiedIds,
  onClose,
  onFollowChange,
  onXpGiven,
}: {
  profile: LeaderboardUser;
  currentUserId?: string;
  currentUserXp: number;
  tutorIds: string[];
  teamIds: string[];
  boardIds: string[];
  verifiedIds: string[];
  onClose: () => void;
  onFollowChange: (targetUserId: string, isFollowing: boolean) => void;
  onXpGiven: (targetUserId: string, currentUserXP: number, targetUserXP: number) => void;
}) {
  const isSelf = profile.userId === currentUserId;
  const isFounder = teamIds.includes(profile.userId);
  const isBoard = !isFounder && boardIds.includes(profile.userId);
  const isTutor = !isFounder && !isBoard && tutorIds.includes(profile.userId);
  const isVerified = !isFounder && !isBoard && !isTutor && verifiedIds.includes(profile.userId);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-n-7 border border-white/10 rounded-2xl p-8 max-w-md w-full relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all text-lg"
        >
          ✕
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4 ring-2 ring-purple-500/60">
            <Image
              src={profile.imageUrl || "/default-avatar.png"}
              alt={profile.name}
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          </div>
          <h3 className="text-xl font-bold text-white">{profile.name}</h3>
          <p className="text-sm text-purple-400 font-medium mt-0.5">{profile.XP} XP</p>

          {(isFounder || isBoard || isTutor || isVerified) && (
            <div className="flex flex-wrap gap-1.5 justify-center mt-3">
              {isFounder && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">Founder</span>}
              {isBoard && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">Board</span>}
              {isTutor && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">Volunteer</span>}
              {isVerified && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">Verified</span>}
            </div>
          )}

          <div className="flex items-center gap-4 mt-4 text-xs text-white/50">
            <span><strong className="text-white/80">{profile.followers}</strong> Followers</span>
            <span><strong className="text-white/80">{profile.following}</strong> Following</span>
          </div>

          {!isSelf && currentUserId && (
            <div className="flex gap-3 mt-5">
              <FollowButton
                userId={profile.userId}
                currentUserId={currentUserId}
                onFollowChange={(isFollowing) => onFollowChange(profile.userId, isFollowing)}
              />
              <GiveXpButton
                userIdx={profile.userId}
                userXXP={currentUserXp}
                onSuccess={(r) => onXpGiven(profile.userId, r.currentUserXP, r.targetUserXP)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const LeaderBoardPage = () => {
  const { user, isLoaded } = useUser(); // Logged-in user

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [leaderboardStats, setLeaderboardStats] = useState<{
    total: number;
    clerkUserCount: number | string;
    databaseUserCount: number;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [rankDelta, setRankDelta] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<LeaderboardUser | null>(null);
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

  // Update follower/XP counts immediately from the action's response rather
  // than waiting for the next 5s poll — patch both the underlying list (so
  // ranks/totals stay correct) and the currently-open modal snapshot (since
  // it's a separate object reference and won't pick up the list change).
  const handleFollowChange = (targetUserId: string, isFollowing: boolean) => {
    const delta = isFollowing ? 1 : -1;
    setLeaderboard((prev) =>
      prev.map((u) => (u.userId === targetUserId ? { ...u, followers: u.followers + delta } : u))
    );
    setSelectedProfile((prev) =>
      prev && prev.userId === targetUserId ? { ...prev, followers: prev.followers + delta } : prev
    );
  };

  const handleXpGiven = (targetUserId: string, currentUserXP: number, targetUserXP: number) => {
    setLeaderboard((prev) =>
      prev.map((u) => {
        if (u.userId === targetUserId) return { ...u, XP: targetUserXP };
        if (u.userId === user?.id) return { ...u, XP: currentUserXP };
        return u;
      })
    );
    setSelectedProfile((prev) => (prev && prev.userId === targetUserId ? { ...prev, XP: targetUserXP } : prev));
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
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="h-10 w-10 rounded-full border-2 border-white/15 border-t-purple-400 animate-spin" />
            <p className="text-lg font-bold text-white">Loading leaderboard…</p>
            <p className="text-sm text-white/40">This can sometimes take up to 30 seconds — hang tight!</p>
          </div>
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
                      <button onClick={() => setSelectedProfile(leaderboardUser)} className="hover:underline">
                        {leaderboardUser.name}
                      </button>
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
                    <button
                      onClick={() => setSelectedProfile(leaderboardUser)}
                      className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 rounded-full bg-gray-200 overflow-hidden hover:ring-2 transition-all hover:ring-purple-400 ring-2 ring-white/10"
                    >
                      <Image
                        src={leaderboardUser.imageUrl || "/default-avatar.png"}
                        alt={leaderboardUser.name}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </button>
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
                    <button onClick={() => setSelectedProfile(leaderboardUser)} className="shrink-0 rounded-full hover:ring-2 hover:ring-purple-400 transition-all">
                      <Image
                        src={leaderboardUser.imageUrl || "/default-avatar.png"}
                        alt={leaderboardUser.name}
                        width={50}
                        height={50}
                        className="rounded-full"
                      />
                    </button>
                    <div className="flex flex-col ">
                      {" "}
                      <div className="flex ">
                        {leaderboardUser.id.startsWith('new-') ? (
                          <span className="text-lg font-semibold">{leaderboardUser.name}</span>
                        ) : (
                          <button onClick={() => setSelectedProfile(leaderboardUser)} className="hover:underline">
                            <span className="text-lg font-semibold">
                              {leaderboardUser.name}
                            </span>
                          </button>
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
      {selectedProfile && (
        <ProfileModal
          profile={selectedProfile}
          currentUserId={user?.id}
          currentUserXp={currentUserEntry?.XP ?? 0}
          tutorIds={tutorIds}
          teamIds={teamIds}
          boardIds={boardIds}
          verifiedIds={verifiedIds}
          onClose={() => setSelectedProfile(null)}
          onFollowChange={handleFollowChange}
          onXpGiven={handleXpGiven}
        />
      )}
    </TooltipProvider>
  );
};

export default LeaderBoardPage;
