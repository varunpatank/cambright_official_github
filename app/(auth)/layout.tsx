// v.0.0.01 salah

import { BackgroundBeams } from "@/components/ui/background-beams";
import { Boxes } from "@/components/ui/background-boxes";
import { BackgroundLines } from "@/components/ui/background-lines";
import { StarsBackground } from "@/components/ui/shooting-stars";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full flex items-center justify-center">
      <StarsBackground />
      {children}
    </div>
  );
};
export default AuthLayout;
