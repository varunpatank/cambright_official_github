import { v4 as uuidv4 } from "uuid";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { name, imageUrl } = await req.json();

    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Ensure the profile is correctly retrieved
    if (!profile.id) {
      return new NextResponse("Invalid profile", { status: 400 });
    }

    // Create the room with the correct admin role for the current profile
    const room = await db.room.create({
      data: {
        profileId: profile.id,
        name,
        imageUrl,
        inviteCode: uuidv4(),
        chats: {
          create: [{ name: "general", profileId: profile.id }],
        },
        members: {
          create: [{ profileId: profile.id, role: MemberRole.ADMIN }],
        },
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error(error, "POSTING");
    return new NextResponse("Internal error", { status: 500 });
  }
}
