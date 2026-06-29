import Image from "next/image";

export const LogoR = () => {
  return (
    <Image
      height={52}
      width={220}
      alt="CamBright"
      src="/logo-clean.png"
      className="object-contain"
    />
  );
};
