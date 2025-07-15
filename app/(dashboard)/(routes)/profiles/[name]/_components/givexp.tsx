"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import toast from "react-hot-toast";

interface GiveXpButtonProps {
  userIdx: string; // Expecting a user ID to be passed as a prop
  userXXP: number; // Expecting a user ID to be passed as a prop
}

const GiveXpButton = ({ userIdx, userXXP }: GiveXpButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [xpAmount, setXpAmount] = useState<number>(2); // Default XP amount
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // State to control drawer visibility

  const handleGiveXP = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/give-xp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userIdx, // The user to whom XP will be given
          xpAmount, // Amount of XP to give
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Failed to give XP");
      } else {
        const data = await response.json();
        toast.success(`Successfully gave ${xpAmount} XP!`);
      }
    } catch (error) {
      toast.error("An error occurred while giving XP.");
    } finally {
      setIsLoading(false);
      setIsDrawerOpen(false); // Close the drawer after submitting
    }
  };

  return (
    <div className="action-buttons">
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="default"
            className="bg-pink-700 hover:bg-pink-900"
            onClick={() => setIsDrawerOpen(true)}
            disabled={isLoading} // Disable button while loading
          >
            {isLoading ? "Giving XP..." : "Give XP"}
          </Button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Thank you!</DrawerTitle>
            <DrawerDescription>
              Input the amount of XP to give to this user.
            </DrawerDescription>
          </DrawerHeader>
          <p className="ml-4">My XP: {userXXP}</p>
          <div className="p-4">
            <input
              type="number"
              value={xpAmount}
              onChange={(e) => setXpAmount(parseInt(e.target.value))}
              min={1}
              className="w-full p-2 rounded-md text-white"
              placeholder="Enter XP amount"
            />
          </div>

          <DrawerFooter>
            <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-pink-700 hover:bg-pink-900"
              onClick={handleGiveXP}
              disabled={
                isLoading ||
                xpAmount > userXXP ||
                xpAmount === 0 ||
                xpAmount.toString() === ""
              }
            >
              Give
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default GiveXpButton;
