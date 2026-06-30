import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { getInitialSessionSeconds, getInitialXp, getXpFromSessionSeconds } from '@/lib/session-time';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const clampSeconds = (value: unknown) => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }
  return Math.min(Math.floor(parsed), 3600);
};

async function ensureUser(userId: string) {
  const existingUser = await db.userModel.findUnique({
    where: { userId },
  });

  if (existingUser) {
    return existingUser;
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return null;
  }

  const displayName = clerkUser.firstName
    ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim()
    : clerkUser.username || 'Anonymous';
  const initialSessionSeconds = getInitialSessionSeconds(clerkUser.id);

  return db.userModel.create({
    data: {
      userId: clerkUser.id,
      name: displayName,
      imageUrl: clerkUser.imageUrl || '',
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      followers: 0,
      following: 0,
      biog: '',
      websiteSeconds: initialSessionSeconds,
      XP: getInitialXp(clerkUser.id),
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await ensureUser(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const seconds = clampSeconds(body?.seconds);
    if (!seconds) {
      return NextResponse.json({ ok: true, ignored: true, ensured: true }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });
    }

    const xpIncrement = getXpFromSessionSeconds(seconds);

    const updatedUser = await db.userModel.update({
      where: { userId },
      data: {
        websiteSeconds: {
          increment: seconds,
        },
        XP: {
          increment: xpIncrement,
        },
      },
      select: {
        userId: true,
        XP: true,
        websiteSeconds: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      ...updatedUser,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Error updating session time:', error);
    return NextResponse.json({ error: 'Failed to update session time' }, { status: 500 });
  }
}
