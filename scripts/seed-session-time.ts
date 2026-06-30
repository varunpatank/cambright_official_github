import { PrismaClient } from "@prisma/client";
import { getInitialSessionSeconds, getInitialXp } from "../lib/session-time";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.userModel.findMany({
    select: {
      id: true,
      userId: true,
      XP: true,
      websiteSeconds: true,
    },
  });

  let updated = 0;

  for (const user of users) {
    if (user.XP > 5 || user.websiteSeconds > 0) {
      continue;
    }

    const initialSessionSeconds = getInitialSessionSeconds(user.userId);
    const initialXp = getInitialXp(user.userId);

    await prisma.userModel.update({
      where: { id: user.id },
      data: {
        websiteSeconds: initialSessionSeconds,
        XP: initialXp,
      },
    });

    updated += 1;
  }

  console.log(`Seeded session time for ${updated} users.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
