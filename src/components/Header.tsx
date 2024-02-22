import { FC } from "react";
import ConnectButton from "@/components/ConnectButton";
import Image from "next/image";

const Header: FC = () => {
  return (
    <header className="py-4 lg:py-7 relative z-50">
      <div className="flex items-center justify-between">
        <div className="relative text-2xl text-white font-bold flex items-center gap-2">
          <Image width={48} height={48} src="/icons/logo.webp" alt="Logo" />
          <span className="hidden md:block">BeetCoin</span>
        </div>
        <div className="flex items-center gap-2">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
