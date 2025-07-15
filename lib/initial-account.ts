import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const initialAccount = async () => {
  // Get the current user
  const user = await currentUser();

  // If no user is found, redirect to the sign-in page
  if (!user) {
    return auth().redirectToSignIn();
  }

  // Check if the user already exists in the `UserModel` table
  let account = await db.userModel.findFirst({
    where: {
      userId: user.id, // Look for a user with this `userId`
    },
  });

  // If the user does not exist, create a new account
  if (!account) {
    let name = `${user.username || user.firstName || "anonymous"}`;

    // Check if the name already exists
    const existingUser = await db.userModel.findFirst({
      where: { name },
    });

    // If the name exists, append userId to make the name unique
    if (existingUser) {
      name = `${name}-${user.id}`; // Ensure uniqueness by appending `user.id`
    }

    // Create the new user record
    account = await db.userModel.create({
      data: {
        userId: user.id,
        name: name,
        imageUrl: user.imageUrl || "", // Handle null or undefined imageUrl
        email: user.emailAddresses[0]?.emailAddress || "", // Take the first email address
        biog: "", // You can add default text if needed
        XP: 5, // Default XP for a new user
        tags: {
          create: [
            { name: "Beginner" }, // Default tag for new users
          ],
        },
      },
    });
  } else {
    // If the account already exists, check if the name is different from the current user's name

    if (
      account.name !== user.username &&
      account.name !== user.firstName &&
      account.name !== "anonymous"
    ) {
      // Update the account's name if it differs from the current user's name
      account = await db.userModel.update({
        where: { id: account.id }, // Specify the account by its ID
        data: {
          name: user.username || user.firstName || "anonymous", // Update the name to match the current user's name
        },
      });
    }
    if (account.imageUrl !== user.imageUrl) {
      account = await db.userModel.update({
        where: { id: account.id }, // Specify the account by its ID
        data: {
          imageUrl: user.imageUrl,
        },
      });
    }
  }

  // Return the created or updated account
  return account;
};
