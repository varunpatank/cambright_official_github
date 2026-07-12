"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface FollowButtonProps {
  userId: string; // The user to follow/unfollow (Clerk userId)
  currentUserId: string; // The current logged-in user's Clerk userId
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  currentUserId,
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentUserId || !userId) return;
    fetch(`/api/follow?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.isFollowing !== undefined) setIsFollowing(data.isFollowing);
      })
      .catch(() => {});
  }, [currentUserId, userId]);

  const handleFollowToggle = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/follow", {
        method: "POST",
        body: JSON.stringify({ targetUserId: userId }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to update follow status");
        return;
      }
      setIsFollowing(data.isFollowing);
    } catch (error) {
      toast.error("Something went wrong — please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="tert"
      className={isFollowing ? "bg-red-500 hover:bg-red-800 transition-all" : ""}
      disabled={isLoading}
      onClick={handleFollowToggle}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
};

export default FollowButton;
