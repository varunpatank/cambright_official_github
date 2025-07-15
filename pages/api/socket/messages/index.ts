import { CurrentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const profile = await CurrentProfilePages(req);
    const { content, fileUrl } = req.body;
    const { roomId, chatId } = req.query;

    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!roomId) {
      return res.status(400).json({ error: "Room ID Missing" });
    }

    if (!chatId) {
      return res.status(400).json({ error: "chat ID Missing" });
    }

    if (!content) {
      return res.status(400).json({ error: "Content Missing" });
    }

    const room = await db.room.findFirst({
      where: {
        id: roomId as string,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!room) {
      return res.status(404).json({ message: "room Not Found" });
    }

    const chat = await db.chat.findFirst({
      where: {
        id: chatId as string,
        roomId: roomId as string,
      },
    });

    if (!chat) {
      return res.status(404).json({ message: "chat Not Found" });
    }

    const member = room.members.find(
      (member) => member.profileId === profile.id
    );

    if (!member) {
      return res.status(404).json({ message: "Member Not Found" });
    }

    const message = await db.message.create({
      data: {
        content,
        fileUrl,
        chatId: chatId as string,
        memberId: member.id,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    const chatKey = `chat:${chatId}:messages`;

    res?.socket?.server?.io?.emit(chatKey, message);

    return res.status(200).json(message);
  } catch (error) {
    console.log("[MESSAGES_POST]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
}
