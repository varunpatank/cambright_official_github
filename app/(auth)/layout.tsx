// v.0.0.01 salah

import { BackgroundBeams } from "@/components/ui/background-beams";
import { Boxes } from "@/components/ui/background-boxes";
import { BackgroundLines } from "@/components/ui/background-lines";
import { StarsBackground } from "@/components/ui/shooting-stars";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    // `m-auto` on the inner wrapper (rather than `items-center` on the scroll
    // container) is what keeps this scrollable on short screens: auto margins
    // centre the card when there's room, but collapse to the top when the
    // content is taller than the viewport — so the visitor button up top stays
    // reachable instead of being clipped above an un-scrollable centre.
    <div className="min-h-screen overflow-y-auto flex flex-col px-4 py-10">
      <StarsBackground />
      <div className="m-auto w-full flex justify-center">
        {children}
      </div>
    </div>
  );
};
export default AuthLayout;
