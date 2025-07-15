import { v4 as uuidv4 } from "uuid";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { name, type } = await req.json();
    const { searchParams } = new URL(req.url);

    // Ensure the profile is correctly retrieved
    if (!profile.id) {
      return new NextResponse("Invalid profile", { status: 400 });
    }
    const roomId = searchParams.get("roomId");
    if (!roomId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (name === "general") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const room = await db.room.update({
      where: {
        id: roomId,
        members: {
          some: {
            profileId: profile.id,
            role: { in: [MemberRole.ADMIN, MemberRole.MODERATOR] },
          },
        },
      },
      data: {
        chats: {
          create: {
            profileId: profile.id,
            name,
            type,
          },
        },
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error(error, "POSTING");
    return new NextResponse("Internal error", { status: 500 });
  }
}
