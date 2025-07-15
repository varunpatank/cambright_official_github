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
    const room = await db.room.update({
      where: {
        id: params.roomId,
        profileId: { not: profile.id },
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      data: {
        members: {
          deleteMany: {
            profileId: profile.id,
          },
        },
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error("ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
