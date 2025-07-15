// v.0.0.01 salah

import { Logo } from "./logo";
import { SidebarRoutes } from "./sidebar-routes";
import Link from "next/link";

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  return (
    <div className="h-full border-r border-gray-900 flex flex-col overflow-y-auto shadow-custom bg-n-7 no-print">
      <div className="p-6 lg:p-4">
        <Link href="/dashboard">
          <Logo />
        </Link>
      </div>
      <div className="flex flex-col w-full">
        <SidebarRoutes onClose={onClose} />
      </div>
    </div>
  );
};

export default Sidebar;
