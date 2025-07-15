import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const initialProfile = async () => {
  const user = await currentUser();

  if (!user) {
    return auth().redirectToSignIn();
  }

  let profile = await db.profile.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!profile) {
    profile = await db.profile.create({
      data: {
        userId: user.id,
        name: `${user.username || user.firstName || "anonymous"}`,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0]?.emailAddress || "",
      },
    });
  }

  return profile;
};
