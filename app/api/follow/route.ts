import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/follow?userId=<target Clerk userId> — is the current user following them?
export async function GET(request: NextRequest) {
  const { userId: currentClerkId } = auth();
  if (!currentClerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const targetUserId = request.nextUrl.searchParams.get("userId");
  if (!targetUserId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const [me, target] = await Promise.all([
    db.userModel.findUnique({ where: { userId: currentClerkId }, select: { id: true } }),
    db.userModel.findUnique({ where: { userId: targetUserId }, select: { id: true } }),
  ]);
  if (!me || !target) {
    return NextResponse.json({ isFollowing: false });
  }

  const existing = await db.follow.findUnique({
    where: { followerId_followedId: { followerId: me.id, followedId: target.id } },
  });

  return NextResponse.json({ isFollowing: !!existing });
}

// POST /api/follow { targetUserId: <target Clerk userId> } — toggles follow/unfollow
export async function POST(request: NextRequest) {
  const { userId: currentClerkId } = auth();
  if (!currentClerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const targetUserId = body?.targetUserId as string | undefined;
  if (!targetUserId) {
    return NextResponse.json({ error: "Missing targetUserId" }, { status: 400 });
  }
  if (targetUserId === currentClerkId) {
    return NextResponse.json({ error: "You can't follow yourself" }, { status: 400 });
  }

  const [me, target] = await Promise.all([
    db.userModel.findUnique({ where: { userId: currentClerkId }, select: { id: true } }),
    db.userModel.findUnique({ where: { userId: targetUserId }, select: { id: true } }),
  ]);
  if (!me || !target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existing = await db.follow.findUnique({
    where: { followerId_followedId: { followerId: me.id, followedId: target.id } },
  });

  if (existing) {
    await db.$transaction([
      db.follow.delete({ where: { id: existing.id } }),
      db.userModel.update({ where: { id: me.id }, data: { following: { decrement: 1 } } }),
      db.userModel.update({ where: { id: target.id }, data: { followers: { decrement: 1 } } }),
    ]);
    return NextResponse.json({ isFollowing: false });
  }

  await db.$transaction([
    db.follow.create({ data: { followerId: me.id, followedId: target.id } }),
    db.userModel.update({ where: { id: me.id }, data: { following: { increment: 1 } } }),
    db.userModel.update({ where: { id: target.id }, data: { followers: { increment: 1 } } }),
  ]);
  return NextResponse.json({ isFollowing: true });
}
