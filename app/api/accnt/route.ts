import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust the path if necessary
import { auth, currentUser } from "@clerk/nextjs/server";
import { getInitialSessionSeconds, getInitialXp } from "@/lib/session-time";

export const dynamic = "force-dynamic";

// Export the GET method
export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Try to find existing account
    let account = await db.userModel.findUnique({
      where: { userId },
      include: {
        tags: { select: { name: true } },
      },
    });

    // Auto-create account if it doesn't exist yet (new Clerk user)
    if (!account) {
      const clerkUser = await currentUser();
      if (!clerkUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      let name = clerkUser.username || clerkUser.firstName || "anonymous";

      // Ensure name uniqueness
      const existingUser = await db.userModel.findFirst({ where: { name } });
      if (existingUser) {
        name = `${name}-${clerkUser.id.slice(-6)}`;
      }

      account = await db.userModel.create({
        data: {
          userId: clerkUser.id,
          name,
          imageUrl: clerkUser.imageUrl || "",
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          followers: 0,
          following: 0,
          biog: "",
          XP: getInitialXp(clerkUser.id),
          websiteSeconds: getInitialSessionSeconds(clerkUser.id),
        },
        include: {
          tags: { select: { name: true } },
        },
      });
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error("Error fetching account data:", error);
    return NextResponse.json(
      { error: "Failed to fetch account data" },
      { status: 500 }
    );
  }
}
