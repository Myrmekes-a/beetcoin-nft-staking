"use client";

import Image from "next/image";
import { FC, useState } from "react";
import { Nft } from "@/utils/type";
import { Spinner } from "./SvgIcons";

const NftCard: FC<Nft> = ({ staked, mint, image, data, attributes }) => {
  const { name } = data;
  const [loading, setLoading] = useState(false);

  const handleStake = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const handleUnstake = async () => {};

  return (
    <div className="aspect-square relative overflow-hidden border border-gray-700 group">
      <Image src={image} objectFit="cover" unoptimized fill alt="" />
      {staked && (
        <div
          className="absolute right-2 top-2 z-10 p-2 bg-black/70 rounded-lg"
          title="Staked"
        >
          <Image src="/icons/locked.svg" width={24} height={24} alt="" />
        </div>
      )}
      <div className="absolute w-full p-2 left-0 bottom-0 bg-black/70">
        <div className="text-white text-md font-bold">{name}</div>
        <div className="text-white text-sm mt-1">
          Hash Power: <span className="font-bold">{attributes.hashpower}</span>
        </div>
        <div className="text-white text-sm">
          Electricity Consumption:{" "}
          <span className="font-bold">{attributes.electricityConsumption}</span>
        </div>
      </div>
      {/* Control Box */}
      {!loading && (
        <div className="absolute left-0 top-0 bg-white/10 w-full h-full z-20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 duration-200">
          {!staked ? (
            <button
              className="uppercase border-2 font-bold bg-pink-800/60 border-white text-white py-1 px-8 hover:bg-pink-800 duration-200"
              onClick={handleStake}
            >
              Stake
            </button>
          ) : (
            <button
              className="uppercase border-2 font-bold bg-gray-800/60 border-white text-white py-1 px-8 hover:bg-gray-800 duration-200"
              onClick={handleUnstake}
            >
              Unstake
            </button>
          )}
        </div>
      )}

      {loading && (
        <div className="absolute left-0 top-0 bg-white/10 w-full h-full z-20 backdrop-blur-sm flex items-center justify-center opacity-100 duration-200">
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default NftCard;
