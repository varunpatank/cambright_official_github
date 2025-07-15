// v.0.0.01 salah

import NavbarRoutes from "@/components/navbar-routes";
import MobileSidebar from "./mobile-sidebar";

const CommunityNavbar = () => {
  return (
    <div className="p-4 border-b h-full flex items-center border-n-6 bg-n-8 z-20">
      {/* <MobileSidebar /> */}
      <NavbarRoutes />
    </div>
  );
};

export default CommunityNavbar;
