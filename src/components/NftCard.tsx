"use client";

import Image from "next/image";
import { Dispatch, FC, SetStateAction, useMemo, useState } from "react";
import { Nft } from "@/utils/type";
import { Spinner } from "./SvgIcon";
import { useWallet } from "@solana/wallet-adapter-react";
import moment from "moment";
import { stake, unstake } from "@/utils/staking";
import { FROZEN_RANGE } from "@/config";
import { CheckMark, ExpandIcon } from "./SvgIcon";
import { useModal } from "@/contexts/ModalProvider";
import DetailModal from "./DetailModal";

interface CardProps {
  refetch: () => void;
  nft: Nft;
  selected: Nft[];
  select: () => void;
}

const NftCard: FC<CardProps> = ({ refetch, nft, selected, select }) => {
  const { staked, mint, image, stakedAt, data, attributes, status } = nft;

  const { openModal } = useModal();

  const isSelected = selected.findIndex((s) => s.mint === mint) !== -1;

  const wallet = useWallet();
  const { name } = data;
  const [loading, setLoading] = useState(false);
  const [processText, setProcessText] = useState("");

  const handleStake = async () => {
    await stake({
      wallet,
      mints: [mint],
      setLoading,
      setProcessText,
      refetch,
    });
  };

  const handleUnstake = async () => {
    await unstake({
      wallet,
      mints: [mint],
      setLoading,
      setProcessText,
      refetch,
    });
  };

  const onDetail = () => {
    openModal(<DetailModal nft={nft} refetch={refetch} />);
  };

  return (
    <div className="relative overflow-hidden border border-gray-700 group cursor-pointer">
      <div className="aspect-square relative" onClick={select}>
        <Image src={image} objectFit="cover" unoptimized fill alt="" />
        <div className="absolute w-full p-2 left-0 bottom-0 bg-black/70">
          <div className="text-white text-md font-bold">{name}</div>
          <div className="text-white text-sm mt-1">
            Hash Power:{" "}
            <span className="font-bold">{attributes.hashpower}</span>
          </div>
          <div className="text-white text-sm">
            Electricity Consumption:{" "}
            <span className="font-bold">
              {attributes.electricityConsumption}
            </span>
          </div>
        </div>
      </div>
      {staked && (
        <div className="absolute right-2 top-2 z-10 p-2 bg-black/70 rounded-lg w-[calc(100%-16px)]">
          <div className="flex items-center justify-between w-full">
            <div className="text-white text-sm pl-1">
              Lock <i>{moment(stakedAt + FROZEN_RANGE).fromNow()}</i>
            </div>
            <Image src="/icons/locked.svg" width={24} height={24} alt="" />
          </div>
        </div>
      )}
      {/* Control Box */}
      <div className="relative bg-white/10 z-30 backdrop-blur-sm flex items-center justify-between p-3">
        {!staked ? (
          <button
            className="uppercase border-2 font-bold bg-pink-800/60 border-white text-white py-1 px-8 hover:bg-pink-800 duration-200 disabled:opacity-30 disabled:cursor-no-drop w-[calc(100%-30px)]"
            onClick={handleStake}
            disabled={loading || selected.length !== 0}
          >
            Stake
          </button>
        ) : (
          <button
            className="uppercase border-2 font-bold bg-gray-800/60 border-white text-white py-1 px-8 hover:bg-gray-800 duration-200 disabled:opacity-30 disabled:cursor-no-drop w-[calc(100%-30px)]"
            onClick={handleUnstake}
            disabled={loading || selected.length !== 0 || status !== "frozen"}
          >
            {status !== "frozen" ? "Unfreezing..." : "Unstake"}
          </button>
        )}
        <button onClick={onDetail} title="NFT Detail">
          <ExpandIcon />
        </button>
      </div>
      {loading && (
        <div className="absolute left-0 top-0 bg-white/10 w-full h-full z-20 backdrop-blur-sm flex flex-col items-center justify-center opacity-100 duration-200">
          <Spinner />
          {processText !== "" && (
            <p className="text-white text-center">{processText}</p>
          )}
        </div>
      )}
      {isSelected && (
        <div
          className="absolute left-0 top-0 w-full h-full border border-pink-600 z-40 bg-pink-600/10"
          onClick={select}
        >
          <div className="absolute left-2 top-2">
            <CheckMark />
          </div>
        </div>
      )}
    </div>
  );
};

export default NftCard;
