import { v4 as uuidv4 } from "uuid";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
export async function DELETE(
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
    const room = await db.room.delete({
      where: { id: params.roomId, profileId: profile.id },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error("ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

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
    const { name, imageUrl } = await req.json();
    // Update the room with a new invite code
    const room = await db.room.update({
      where: { id: params.roomId, profileId: profile.id },
      data: {
        name,
        imageUrl,
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error("ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
