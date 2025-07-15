// import { MobileHeader } from "@/components/Mobile-header";
// import { Sidebar } from "@/components/sidebar";

import Navbar from "../(dashboard)/_components/navbar";
import Sidebar from "../(dashboard)/_components/sidebar";
import { SidebarLearn } from "./_components/sidebar";

type Props = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: Props) => {
  return (
    <>
      <div className="h-full">
        {/* Navbar */}
        <div className="h-[80px] md:pl-56 fixed inset-y-0 w-full z-50">
          <Navbar />
        </div>

        <SidebarLearn className="hidden lg:flex" />

        {/* Main content */}
        <main className="md:pl-56 h-full pt-[80px] flex items-center justify-center">{children}</main>
        {/* <MobileHeader /> */}
      </div>
    </>
  );
};

export default MainLayout;
