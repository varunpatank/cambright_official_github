import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
export async function DELETE(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    if (!profile) {
      return new NextResponse("UNAUTHORIZED", { status: 401 });
    }
    if (!roomId) {
      return new NextResponse("UNAUTHORIZED", { status: 400 });
    }
    if (!params.chatId) {
      return new NextResponse("UNAUTHORIZED", { status: 400 });
    }
    const room = await db.room.update({
      where: {
        id: roomId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        chats: {
          delete: {
            id: params.chatId,
            name: {
              not: "general",
            },
          },
        },
      },
    });
    return NextResponse.json(room);
  } catch {
    return new NextResponse("ERROR", { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const profile = await currentProfile();
    const { name, type } = await req.json();
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    if (!profile) {
      return new NextResponse("UNAUTHORIZED", { status: 401 });
    }
    if (!roomId) {
      return new NextResponse("UNAUTHORIZED", { status: 400 });
    }
    if (!params.chatId) {
      return new NextResponse("UNAUTHORIZED", { status: 400 });
    }
    const room = await db.room.update({
      where: {
        id: roomId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        chats: {
          update: {
            where: {
              id: params.chatId,
              NOT: {
                name: "general",
              },
            },
            data: {
              name,
              type,
            },
          },
        },
      },
    });
    return NextResponse.json(room);
  } catch {
    return new NextResponse("ERROR", { status: 500 });
  }
}
