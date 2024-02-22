"use client";

import { Nft } from "@/utils/type";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import { Dispatch, FC, SetStateAction } from "react";

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

interface TabsProps {
  nfts: Nft[];
  tab: "staked" | "unstaked" | "all";
  setTab: Dispatch<SetStateAction<"staked" | "unstaked" | "all">>;
}

export const Tabs: FC<TabsProps> = ({ nfts, tab, setTab }) => {
  return (
    <div className="text-white capitalize flex items-center gap-2">
      <button
        className="border py-2 px-2 lg:px-4 rounded-lg text-center capitalize text-xs lg:text-lg"
        title="All NFTs"
        style={{
          color: tab === "all" ? "#fff" : "#ffffff80",
        }}
        onClick={() => setTab("all")}
      >
        all({nfts.length})
      </button>
      <button
        className="border py-2 px-2 lg:px-4 rounded-lg text-center capitalize text-xs lg:text-lg"
        title="Unstaked NFTs"
        style={{
          color: tab === "unstaked" ? "#fff" : "#ffffff80",
        }}
        onClick={() => setTab("unstaked")}
      >
        unstaked ({nfts.filter((nft) => !nft.staked).length})
      </button>
      <button
        className="border py-2 px-2 lg:px-4 rounded-lg text-center capitalize text-xs lg:text-lg"
        title="Staked NFTs"
        style={{
          color: tab === "staked" ? "#fff" : "#ffffff80",
        }}
        onClick={() => setTab("staked")}
      >
        staked ({nfts.filter((nft) => nft.staked).length})
      </button>
    </div>
  );
};
