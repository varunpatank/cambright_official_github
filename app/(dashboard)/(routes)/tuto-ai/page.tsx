import { getUserIMGURL } from "@/lib/clerkerimage";
import { useAuth } from "@clerk/nextjs";
import ClientChat from "./ClientChat";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = auth();

  // Fetch user image on the server only
  const userImg = userId ? await getUserIMGURL(userId) : null;

  return <ClientChat userImg={userImg} />;
}
