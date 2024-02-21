import Image from "next/image";

export const Background = () => {
  return (
    <>
      <div className="bg-[#000] w-full h-full absolute left-0 top-0" />
      <Image
        src={"/images/bg.jpg"}
        className="object-cover opacity-10 relative z-10 pointer-events-none"
        unoptimized
        fill
        alt=""
      />
    </>
  );
};
