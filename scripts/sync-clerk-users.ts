import "dotenv/config";
import { createClerkClient } from "@clerk/backend";
import { PrismaClient } from "@prisma/client";
import { getInitialSessionSeconds, getInitialXp } from "../lib/session-time";

const prisma = new PrismaClient();

async function main() {
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!secretKey) {
    throw new Error("CLERK_SECRET_KEY is missing in environment variables.");
  }

  const clerk = createClerkClient({ secretKey });
  const totalUsers = await clerk.users.getCount();
  const limit = 500;
  let offset = 0;
  let processed = 0;
  let created = 0;
  let updated = 0;

  while (offset < totalUsers) {
    const batch = await clerk.users.getUserList({
      limit,
      offset,
      orderBy: "-created_at",
    });

    for (const clerkUser of batch.data) {
      const displayName = clerkUser.firstName
        ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
        : clerkUser.username || "Anonymous";

      const existing = await prisma.userModel.findUnique({
        where: { userId: clerkUser.id },
        select: { id: true, XP: true, websiteSeconds: true },
      });

      if (existing) {
        await prisma.userModel.update({
          where: { userId: clerkUser.id },
          data: {
            name: displayName,
            email: clerkUser.emailAddresses[0]?.emailAddress || "",
            imageUrl: clerkUser.imageUrl || "",
            XP: existing.XP > 0 ? existing.XP : getInitialXp(clerkUser.id),
            websiteSeconds:
              existing.websiteSeconds > 0
                ? existing.websiteSeconds
                : getInitialSessionSeconds(clerkUser.id),
          },
        });
        updated += 1;
      } else {
        await prisma.userModel.create({
          data: {
            userId: clerkUser.id,
            name: displayName,
            email: clerkUser.emailAddresses[0]?.emailAddress || "",
            imageUrl: clerkUser.imageUrl || "",
            followers: 0,
            following: 0,
            biog: "",
            XP: getInitialXp(clerkUser.id),
            websiteSeconds: getInitialSessionSeconds(clerkUser.id),
          },
        });
        created += 1;
      }

      processed += 1;
    }

    offset += batch.data.length;
    if (batch.data.length < limit) {
      break;
    }
  }

  console.log(
    `Clerk sync complete. Total Clerk users: ${totalUsers}. Processed: ${processed}. Created: ${created}. Updated: ${updated}.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });