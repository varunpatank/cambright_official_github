import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear all follow relationships
  const deletedFollows = await prisma.follow.deleteMany();

  console.log(`Cleared ${deletedFollows.count} follow relationships.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
