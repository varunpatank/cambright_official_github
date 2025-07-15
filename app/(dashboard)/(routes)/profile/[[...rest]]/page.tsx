"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { UserProfile, useUser } from "@clerk/nextjs";
import LoadingOverlay from "@/components/LoadingOverlay";
import { defaultIds } from "../../users";
import {
  PencilIcon,
  ShieldCheck,
  CheckCircleIcon,
  FlagIcon,
  EyeIcon,
  PlusCircle,
  Trash2,
  Check,
  XIcon,
  HeartIcon,
  VerifiedIcon,
  ShieldIcon,
} from "lucide-react"; // Pencil, Eye, Plus, and Trash icons
import { StarsBackground } from "@/components/ui/shooting-stars";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // ShadCN Tooltip
import toast from "react-hot-toast";
import { Editor } from "@/components/editor";
import { Preview } from "@/components/preview";
import ReactQuill from "react-quill";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { initialAccount } from "@/lib/initial-account";

interface Account {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  email: string;
  followers: number;
  following: number;
  biog: string;
  XP: number;
  tags: { name: string }[]; // Updated tags array to reflect the Tag model
}

const ProfilePage = () => {
  const { user, isLoaded } = useUser(); // Logged-in user
  const [account, setAccount] = useState<Account | null>(null); // Account state
  const [bio, setBio] = useState<string>("No bio set"); // Biography state
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [editingBio, setEditingBio] = useState<boolean>(false); // Toggle edit mode
  const [roleIcon, setRoleIcon] = useState<React.ReactNode | null>(null); // State for role icon
  const [roleTooltip, setRoleTooltip] = useState<string>(""); // Tooltip for the icon
  const [newTag, setNewTag] = useState<string>(""); // State for new tag input
  const [isAddingTag, setIsAddingTag] = useState<boolean>(false); // Toggle for showing the tag input
  const [userRank, setUserRank] = useState<number | null>(null); // Store rank
  const [rankColor, setRankColor] = useState<string>(""); // Store rank color

  // Fetch user profile data after loading
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch("/api/accnt"); // Fetch data from the /api/accnt route

        if (response.ok) {
          const data: Account = await response.json();
          setAccount(data);
          setBio(data.biog || ""); // Set the bio data
          setFollowers(data.followers);
          setFollowing(data.following);

          // Get userId from environment variables and check against each category
          const tutorIds =
            process.env.NEXT_PUBLIC_TUTOR_IDS?.split(",") ||
            defaultIds.tutorIds;
          const verifiedIds =
            process.env.NEXT_PUBLIC_VERIFIED_IDS?.split(",") ||
            defaultIds.verifiedIds;
          const teamIds =
            process.env.NEXT_PUBLIC_TEAM_IDS?.split(",") || defaultIds.teamIds;
          const boardIds =
            process.env.NEXT_PUBLIC_BOARD_IDS?.split(",") ||
            defaultIds.boardIds;

          if (teamIds.includes(user.id)) {
            setRoleIcon(<ShieldCheck className="w-5 h-5 text-green-500" />);
            setRoleTooltip("Founder");
          } else if (boardIds.includes(user.id)) {
            setRoleIcon(<ShieldIcon className="w-5 h-5 text-green-500" />);
            setRoleTooltip("Board");
          } else if (tutorIds.includes(user.id)) {
            setRoleIcon(<HeartIcon className="w-5 h-5 text-purple-500" />);
            setRoleTooltip("Volunteer");
          } else if (verifiedIds.includes(user.id)) {
            setRoleIcon(<VerifiedIcon className="w-5 h-5 text-purple-500" />);
            setRoleTooltip("Verified");
          }
        } else {
          console.log("Failed to fetch account data");
        }
      } catch (error) {
        console.log("Error fetching account data", error);
      }
    };
    const fetchRank = async () => {
      if (!user?.id) return;

      try {
        // Fetch rank data from rank API
        const response = await fetch("/api/rankget"); // Use the correct endpoint for rank
        if (response.ok) {
          const { userRank, rankColor } = await response.json();
          setUserRank(userRank);
          setRankColor(rankColor); // Set rank color
        } else {
          console.log("Failed to fetch rank data");
        }
      } catch (error) {
        console.log("Error fetching rank data", error);
      }
    };
    fetchRank();
    fetchProfile();
  }, [user]);

  // Handle bio update
  const handleBioUpdate = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch("/api/update-bio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          newBio: bio,
        }),
      });

      if (response.ok) {
        console.log("Bio updated successfully");
        setEditingBio(false); // Exit edit mode
      } else {
        console.error("Failed to update bio");
      }
    } catch (error) {
      console.error("Error updating bio:", error);
    }
  };

  const handleAddTag = async () => {
    if (newTag.trim() === "") return; // Prevent adding empty tags

    // Temporarily update the UI
    const updatedTags = [...account!.tags, { name: newTag }];
    setAccount((prevAccount) =>
      prevAccount ? { ...prevAccount, tags: updatedTags } : prevAccount
    );
    setIsAddingTag(false); // Hide the input after submission

    try {
      // Send the request to the backend
      const response = await fetch("/api/add-tag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id, // Ensure the user is loaded and user?.id is not undefined
          tagName: newTag,
        }),
      });

      if (response.ok) {
        toast.success("Tag added successfully");
        // Optionally, refetch profile or update the tags state from the backend
      } else {
        toast.error("Failed to add tag");
        console.error("Failed to add tag");
      }
    } catch (error) {
      toast.error("Error adding tag");
      console.error("Error adding tag:", error);
    }
  };

  // Handle Delete Tag
  const handleDeleteTag = async (tagName: string) => {
    // Remove the tag from the local account state
    const updatedTags = account!.tags.filter((tag) => tag.name !== tagName);
    setAccount((prevAccount) =>
      prevAccount ? { ...prevAccount, tags: updatedTags } : prevAccount
    );

    try {
      const response = await fetch("/api/delete-tag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          tagName,
        }),
      });

      if (response.ok) {
        toast.success("Tag deleted successfully");

        // Optionally refetch the profile data
        const refetchResponse = await fetch("/api/accnt");
        if (refetchResponse.ok) {
          const updatedAccount = await refetchResponse.json();
          setAccount(updatedAccount); // Update account state with new data from server
        } else {
          console.error("Failed to refetch account data");
          toast.error("Failed to refetch account data");
        }
      } else {
        console.error("Failed to delete tag");
        toast.error("Failed to delete tag");
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast.error("Error deleting tag");
    }
  };

  // Check if bio is empty or contains just <p></p> and show default message
  const bioContent =
    bio === "<p></p>" || !bio || bio === "<h3><br></h3>" ? "No bio set" : bio;

  if (!isLoaded || !account) {
    return <LoadingOverlay />;
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className="max-w-4xl mx-auto text-white">
        <StarsBackground />
        {/* Profile Card */}
        <div className="p-6 rounded-lg bg-n-7 space-y-6 mt-6">
          {/* Profile Image and Info */}
          <div className="flex flex-col items-center space-y-4">
            {/* Profile Image */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all">
              <Image
                src={account?.imageUrl || "/default-avatar.png"}
                alt={account?.name || "User"}
                width={96}
                height={96}
                className="object-cover w-full h-full "
              />
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-2 text-xl">
                <span className={`${rankColor}`}>#{userRank}</span>{" "}
                <span className="text-2xl font-semibold">{account?.name}</span>
                {roleIcon && (
                  <Tooltip>
                    <TooltipTrigger>{roleIcon}</TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">{roleTooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              {/* <span className="text-sm text-none-400">{account?.email}</span> */}
              <div className="mt-2 flex items-center space-x-6">
                <span className="text-sm text-none-300">
                  <strong>{followers}</strong> Followers
                </span>
                <span className="text-sm text-none-300">
                  <strong>{following}</strong> Following
                </span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-none-300 ">
              {" "}
              <strong>{account.XP}</strong>
              <span className="text-purple-400"> XP</span>
            </h2>
          </div>
          {/* Tags Section */}
          <div>
            <h2 className="text-lg font-semibold text-none-300">Tags</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {account.tags
                .filter((tag) => tag.name !== "Beginner") // Filter out the "Beginner" tag
                .map((tag, index) => (
                  <div
                    key={index}
                    className=" bg-n-8 px-2  rounded-full flex items-center space-x-2"
                  >
                    <span className="px-3 py-1 text-sm  text-none-100 rounded-full">
                      {tag.name}
                    </span>
                    <button
                      onClick={() => handleDeleteTag(tag.name)}
                      className="text-gray-500 hover:text-red-700 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              <button
                onClick={() => setIsAddingTag(true)}
                className="text-purple-500/80 hover:text-purple-700/60 transition-all"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Tag Input Field */}
            {isAddingTag && (
              <div className="mt-4 flex items-center space-x-2">
                <input
                  type="text"
                  className="p-2 border rounded-md bg-none-700 text-white"
                  placeholder="Enter a new tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                />
                <button
                  onClick={handleAddTag}
                  className="text-green-500 hover:text-green-700 transition-all"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsAddingTag(false)}
                  className="text-red-500 hover:text-red-700 transition-all"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-none-300 flex items-center">
              {/* Biography title with pencil icon */}
              <span className="mr-2">Bio</span>
              <Tooltip>
                <TooltipTrigger>
                  <PencilIcon
                    className="w-4 h-4 cursor-pointer text-gray-500 hover:text-purple-500 transition-all"
                    onClick={() => setEditingBio(true)} // Enable editing when clicked
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Edit your bio</p>
                </TooltipContent>
              </Tooltip>
            </h2>

            <div className="mt-4">
              {editingBio ? (
                <div className="relative w-full">
                  {/* Use Editor for rich-text input */}
                  <Editor
                    classs="w-full h-auto min-h-[150px] p-2 border rounded-md border-none-500 bg-n-8 text-white resize-none" // Make height flexible and ensure no resizing beyond control
                    value={bio}
                    onChange={(newValue) => setBio(newValue)} // Directly use the new value from the editor
                  />

                  <div className="mt-4 flex space-x-4">
                    <Button
                      onClick={handleBioUpdate}
                      variant={"tert"}
                      size={"sm"}
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => setEditingBio(false)} // Cancel editing
                      className="px-6 py-2 border border-none-500 rounded-md"
                      size={"sm"}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-start w-full space-y-0">
                  {/* Show "No bio set" if the bio is empty */}
                  <Preview value={bioContent} classs="w-full max-w-full mt-0" />
                </div>
              )}
            </div>
          </div>

          {/* Eye Icon Redirect */}
          <div className="mt-4 text-center">
            <button
              onClick={() => window.open(`/profiles/${account.name}`, "_blank")}
              className="text-muted-foreground hover:text-white text-sm flex items-center justify-center space-x-2 transition-all bg-n-8 p-2 px-4 rounded-full"
            >
              <EyeIcon className="w-5 h-5" />
              <span>Preview</span>
            </button>
          </div>
          <div className="flex justify-center flex-wrap gap-10 mb-12">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Settings</AccordionTrigger>
                <AccordionContent>
                  {" "}
                  <UserProfile
                    appearance={{
                      elements: {
                        rootBox: {
                          boxShadow: "none",
                          width: "100%",
                        },
                        card: {
                          border: "1px solid #e5e5e5",
                          boxShadow: "none",
                          width: "100%",
                          maxHeight: "500px", // Set a maximum height for the card
                          overflowY: "auto", // Allow vertical scrolling inside the card if content overflows
                        },
                      },
                    }}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>{" "}
      </div>
    </TooltipProvider>
  );
};

export default ProfilePage;
