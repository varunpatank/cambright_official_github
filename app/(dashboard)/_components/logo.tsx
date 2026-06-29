// v.0.0.01 salah

import Image from "next/image";
export const Logo = () => {
  return (
    <Image
      height={70}
      width={270}
      alt="CamBright"
      src="/logo.png"
      className="object-contain"
      priority
      quality={100}
    />
  );
};
