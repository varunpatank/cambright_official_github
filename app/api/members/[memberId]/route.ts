import { v4 as uuidv4 } from "uuid";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
export async function DELETE(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    if (!roomId) {
      return new NextResponse("Bad Request: Missing roomID", { status: 400 });
    }
    if (!params.memberId) {
      return new NextResponse("Bad Request: Missing memberID", {
        status: 400,
      });
    }
    const room = await db.room.update({
      where: { id: roomId, profileId: profile.id },
      data: {
        members: {
          deleteMany: {
            id: params.memberId,
            profileId: {
              not: profile.id,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
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
export async function PATCH(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized!", { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const { role } = await req.json();
    const roomId = searchParams.get("roomId");
    if (!roomId) {
      return new NextResponse("Bad Request: Missing roomID", { status: 400 });
    }
    if (!params.memberId) {
      return new NextResponse("Bad Request: Missing memberID", {
        status: 400,
      });
    }
    const room = await db.room.update({
      where: { id: roomId, profileId: profile.id },
      data: {
        members: {
          update: {
            where: {
              id: params.memberId,
              profileId: {
                not: profile.id,
              },
            },
            data: {
              role,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
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
