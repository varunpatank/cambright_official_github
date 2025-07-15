"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FaUserCheck, FaUserTimes } from "react-icons/fa";

interface FollowButtonProps {
  userId: string; // The user to follow/unfollow
  currentUserId: string; // The current logged-in user ID
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  currentUserId,
}) => {
  const [isFollowing, setIsFollowing] = useState<boolean | false>(false);

  // Check if the user is already following
  const checkIfFollowing = async () => {
    try {
      const response = await fetch(`/api/follow?userId=${userId}`);
      const data = await response.json();
      if (data.isFollowing !== undefined) {
        setIsFollowing(data.isFollowing);
      } else {
        console.error("Error fetching follow status:", data.error);
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  // Toggle Follow/Unfollow action
  const handleFollowToggle = async () => {
    // const action = isFollowing ? "unfollow" : "follow";
    // try {
    //   const response = await fetch("/api/follow", {
    //     method: "POST",
    //     body: JSON.stringify({ action, targetUserId: userId }),
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   });
    //   const data = await response.json();
    //   if (data.success) {
    //     setIsFollowing(!isFollowing); // Toggle the following state
    //   } else {
    //     console.error("Error in follow action:", data.error);
    //   }
    // } catch (error) {
    //   console.error("Error processing follow/unfollow:", error);
    // }
    if (isFollowing) {
      setIsFollowing(false);
    } else {
      setIsFollowing(true);
    }
  };

  // Fetch the follow status when the component is mounted
  // useEffect(() => {
  //   if (currentUserId && userId) {
  //     checkIfFollowing();
  //   }
  // }, [currentUserId, userId]);

  // if (isFollowing === null) return <div>Loading...</div>; // Optionally, show a loading spinner

  return (
    <Button
      variant="tert"
      className={`${
        isFollowing ? "bg-red-500 hover:bg-red-800 transition-all" : ""
      }`}
      disabled={false}
      onClick={handleFollowToggle}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
};

export default FollowButton;
