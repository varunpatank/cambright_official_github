import { createClerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function GET(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await clerk.users.getUser(params.userId);
    return NextResponse.json({
      imageUrl: user.imageUrl,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
    });
  } catch {
    return NextResponse.json({ imageUrl: null }, { status: 200 });
  }
}
