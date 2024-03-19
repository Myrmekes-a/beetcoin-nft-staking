import { useModal } from "@/contexts/ModalProvider";
import { Nft } from "@/utils/type";
import Image from "next/image";
import { FC, useEffect, useState } from "react";
import { CloseIcon } from "./SvgIcon";
import Countdown from "./Countdown";
import { FROZEN_RANGE } from "@/config";
import { stake, unstake } from "@/utils/staking";
import { useWallet } from "@solana/wallet-adapter-react";
import { Spinner } from "./SvgIcon";

interface Detail {
  nft: Nft;
  refetch: () => void;
}

const DetailModal: FC<Detail> = ({ nft, refetch }) => {
  const {
    mint,
    image,
    data,
    description,
    attributes,
    staked,
    stakedAt,
    status,
  } = nft;
  const wallet = useWallet();
  const { closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [processText, setProcessText] = useState("");

  const handleStake = async () => {
    await stake({
      wallet,
      mints: [mint],
      setLoading,
      setProcessText,
      refetch: () => {
        closeModal();
        refetch();
      },
    });
  };

  const handleUnstake = async () => {
    await unstake({
      wallet,
      mints: [mint],
      setLoading,
      setProcessText,
      refetch: () => {
        closeModal();
        refetch();
      },
    });
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [closeModal]);
  return (
    <div className="fixed left-0 top-0 w-screen h-screen z-[999] grid place-content-center backdrop-blur-sm bg-black/30">
      <div
        className="absolute left-0 top-0 w-full h-full"
        onClick={closeModal}
      />
      <div className="w-[720px] min-h-[360px] relative z-20 border border-white/20 p-4 bg-black/80 flex ">
        <button
          className="absolute right-4 top-4 opacity-70 hover:opacity-100"
          onClick={closeModal}
        >
          <CloseIcon />
        </button>
        <div className="w-[280px] h-[280px] relative">
          <Image src={image} objectFit="cover" unoptimized fill alt="" />
          {staked && (
            <div className="absolute right-3 top-3 z-10 bg-black/70 rounded-lg p-2">
              <Image src="/icons/locked.svg" width={24} height={24} alt="" />
            </div>
          )}
        </div>
        <div className="w-[calc(100%-300px)] text-white ml-5 py-3">
          <h2 className="text-xl font-bold">{data.name}</h2>
          <p className="text-sm mt-1 opacity-70">{description}</p>
          <div className="grid grid-cols-2 gap-4 my-4">
            <div className="bg-white/10 py-2 px-3 rounded-lg border border-white/30">
              <p className="text-xs opacity-80">Hashpower</p>
              <p className="font-bold">{attributes.hashpower}</p>
            </div>
            <div className="bg-white/10 py-2 px-3 rounded-lg border border-white/30">
              <p className="text-xs opacity-80">Electricity Consumption</p>
              <p className="font-bold">{attributes.electricityConsumption}</p>
            </div>
          </div>
          {staked && (
            <p className="mb-3">
              Locked in{" "}
              <span className="font-bold italic">
                <Countdown date={new Date().getTime() + FROZEN_RANGE} />
              </span>
            </p>
          )}
          <div className="text-right mt-4">
            {!staked ? (
              <button
                className="uppercase border-2 font-bold bg-pink-800/60 border-white text-white py-2 px-8 hover:bg-pink-800 duration-200 disabled:opacity-60 w-[200px] h-12 disabled:pointer-events-none"
                onClick={handleStake}
                disabled={loading}
              >
                {!loading ? (
                  <>Stake</>
                ) : (
                  <Spinner className="w-7 h-7 text-white animate-spin fill-pink-600 mx-auto" />
                )}
              </button>
            ) : (
              <button
                className="uppercase border-2 font-bold bg-gray-800/60 border-white text-white py-2 px-8 hover:bg-gray-800 duration-200 disabled:opacity-60 w-[200px] h-12 disabled:pointer-events-none"
                onClick={handleUnstake}
                disabled={loading || status !== "frozen"}
              >
                {!loading ? (
                  <>{status !== "frozen" ? "Unfreezing..." : "Unstake"}</>
                ) : (
                  <Spinner className="w-7 h-7 text-white animate-spin fill-pink-600 mx-auto" />
                )}
              </button>
            )}
          </div>
          {loading && (
            <p className="ml-auto text-xs my-3 w-20">{processText}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
