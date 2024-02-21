import Image from "next/image";
import { FC } from "react";
import { Nft } from "@/utils/type";

const NftCard: FC<Nft> = ({ mint, image, data, attributes }) => {
  const { name } = data;
  return (
    <div className="aspect-square relative overflow-hidden border border-gray-700">
      <Image src={image} objectFit="cover" fill alt="" />
      <div className="absolute w-full p-2 left-0 bottom-0 bg-black/60">
        <div className="text-white text-md font-bold">{name}</div>
        <div className="text-white text-sm mt-1">
          Hash Power: <span className="font-bold">{attributes.hashpower}</span>
        </div>
        <div className="text-white text-sm">
          Electricity Consumption:{" "}
          <span className="font-bold">{attributes.electricityConsumption}</span>
        </div>
      </div>
    </div>
  );
};

export default NftCard;
