import Image from "next/image";

export const LogoR = () => {
  return (
    <>
      <Image
        className="hidden sm:block"
        height={200}
        width={200}
        alt="logo"
        src="/logo.png"
      />
      <Image
        className="block sm:hidden"
        height={200}
        width={200}
        alt="logo"
        src="/logor.png"
      />
    </>
  );
};
