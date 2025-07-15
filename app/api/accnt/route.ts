import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust the path if necessary
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

// Export the GET method
export async function GET(req: Request) {
  try {
    // Get the logged-in user from the request headers (Clerk authentication in this case)
    const { userId } = auth(); // This will give the user ID based on Clerk session

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Fetch account data, including tags
    const account = await db.userModel.findUnique({
      where: { userId },
      include: {
        tags: { select: { name: true } }, // Include the tags
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
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
