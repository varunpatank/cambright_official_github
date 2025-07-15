import { auth } from "@clerk/nextjs/server";
import { GroupControl } from "./_components/GroupControl";
import { startCase } from "lodash";
// export async function generateMetadata() {
//   const { orgSlug } = auth();
//   return { title: startCase(orgSlug || "group") };
// }
const GroupIdLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <GroupControl /> {children}
    </>
  );
};
export default GroupIdLayout;
