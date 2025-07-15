import { v4 as uuidv4 } from "uuid";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }

    if (!params.roomId) {
      return new NextResponse("Bad Request: Missing roomId", { status: 400 });
    }

    // Find the room and check if the user is a member of the room
    const room = await db.room.findUnique({
      where: { id: params.roomId },
      include: { members: true }, // Include members to check user membership
    });

    if (!room) {
      return new NextResponse("Room not found", { status: 404 });
    }

    // Check if the profile is a member of the room
    const isMember = room.members.some(
      (member) => member.profileId === profile.id
    );
    if (!isMember) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }

    // Update the room with a new invite code
    const updatedRoom = await db.room.update({
      where: { id: params.roomId },
      data: {
        inviteCode: uuidv4(),
      },
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error("ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
