"use client";

import bs58 from "bs58";
import Image from "next/image";
import { FC, useState } from "react";
import { Nft } from "@/utils/type";
import { Spinner } from "./SvgIcons";
import { toast } from "react-toastify";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  BEETCOIN_ADDRESS,
  BEETWALLT,
  SOLANA_RPC,
  STAKING_COST_BEET,
  STAKING_COST_SOL,
} from "@/config";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  WrappedInstruction,
  publicKey,
  transactionBuilder,
} from "@metaplex-foundation/umi";
import {
  TokenStandard,
  delegateStandardV1,
  mplTokenMetadata,
  revokeStandardV1,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  setComputeUnitLimit,
  setComputeUnitPrice,
} from "@metaplex-foundation/mpl-toolbox";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createTransferCheckedWithFeeInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getDelegateStatus } from "@/utils/util";
import useNfts from "@/hooks/useNfts";
import { poolMiner, withdrawMinerFromPool } from "@/lib/apis";
import moment from "moment";

const FROZEN_RANGE = 24 * 60 * 60 * 1000;

interface CardProps {
  refetch: () => void;
  nft: Nft;
}

const NftCard: FC<CardProps> = ({ refetch, nft }) => {
  const { staked, mint, image, stakedAt, data, attributes } = nft;
  
  const wallet = useWallet();
  const { fetchNfts } = useNfts(wallet.publicKey, wallet.connected);
  const { name } = data;
  const [loading, setLoading] = useState(false);
  const [processText, setProcessText] = useState("");

  const handleStake = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      console.error("Wallet not connected");
      return;
    }
    const signer = wallet.publicKey;

    setLoading(true);

    const delegate = async () => {
      setProcessText("Validating...");
      const delegated = await getDelegateStatus(mint, signer);

      if (delegated) {
        toast.warning("Aleady delegated!");
        setProcessText("");
        setLoading(false);
        return;
      }
      try {
        setProcessText("Delegating...");

        const umi = createUmi(SOLANA_RPC)
          .use(mplTokenMetadata())
          .use(walletAdapterIdentity(wallet));

        if (signer !== null) {
          const nftMint = publicKey(mint);
          const tokenOwner = publicKey(signer);
          const tx = delegateStandardV1(umi, {
            mint: nftMint,
            tokenOwner,
            delegate: publicKey(BEETWALLT),
            tokenStandard: TokenStandard.ProgrammableNonFungible,
          });

          const tokenMintAddress = new PublicKey(BEETCOIN_ADDRESS);
          const destinationAddress = new PublicKey(BEETWALLT);
          const sourceTokenAccountAddress = await getAssociatedTokenAddress(
            tokenMintAddress,
            signer,
            true,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          );

          const destinationTokenAccountAddress =
            await getAssociatedTokenAddress(
              tokenMintAddress,
              destinationAddress,
              true,
              TOKEN_2022_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID
            );

          const basisPoints = 4;
          const feesAmount = (STAKING_COST_BEET * basisPoints) / 10000;
          const feesAmountBigInt = BigInt(feesAmount);
          const bigIntAmount = BigInt(STAKING_COST_BEET);

          const tokenPaymentInstruction =
            createTransferCheckedWithFeeInstruction(
              sourceTokenAccountAddress,
              tokenMintAddress,
              destinationTokenAccountAddress,
              signer,
              bigIntAmount,
              9,
              feesAmountBigInt
            );

          const costIx: WrappedInstruction = {
            instruction: {
              data: tokenPaymentInstruction.data,
              keys: tokenPaymentInstruction.keys.map((key) => {
                return {
                  ...key,
                  pubkey: publicKey(key.pubkey),
                };
              }),
              programId: publicKey(tokenPaymentInstruction.programId),
            },
            signers: [],
            bytesCreatedOnChain: 0,
          };

          const solPaymentInstruction = SystemProgram.transfer({
            fromPubkey: signer,
            toPubkey: destinationAddress,
            lamports: STAKING_COST_SOL,
          });

          const solCostIx: WrappedInstruction = {
            instruction: {
              data: solPaymentInstruction.data,
              keys: solPaymentInstruction.keys.map((key) => {
                return {
                  ...key,
                  pubkey: publicKey(key.pubkey),
                };
              }),
              programId: publicKey(solPaymentInstruction.programId),
            },
            signers: [],
            bytesCreatedOnChain: 0,
          };

          const res = await transactionBuilder()
            .add(setComputeUnitLimit(umi, { units: 1_500_000 }))
            .add(setComputeUnitPrice(umi, { microLamports: 250_000 }))
            .add(tx)
            .add(costIx)
            .add(solCostIx)
            .sendAndConfirm(umi);
          const signature = bs58.encode(res.signature);
          console.log("signature", signature);

          setProcessText("Updating server...");
          const resApi = await poolMiner(
            mint,
            wallet.publicKey?.toBase58() as string,
            signature
          );

          console.log(resApi);

          refetch();
          toast.success(resApi.message);
        }
      } catch (error) {
        if (JSON.stringify(error).indexOf("4001") === -1) {
          toast.error("Something went wrong");
        }
        setLoading(false);
      } finally {
        refetch();
        setLoading(false);
        setProcessText("");
      }
    };

    await delegate();
  };

  const handleUnstake = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      console.error("Wallet not connected");
      return;
    }

    if (stakedAt - new Date().getTime() <= FROZEN_RANGE) {
      toast.error(
        `NFT is frozen in ${moment(stakedAt + FROZEN_RANGE).format(
          "YYYY-MM-DD hh-mm"
        )}`
      );
      return;
    }

    const signer = wallet.publicKey;

    setLoading(true);
    setProcessText("Validating...");
    const delegated = await getDelegateStatus(mint, signer);

    if (!delegated) {
      toast.warning("Can't revoke");
      setProcessText("");
      setLoading(false);
      return;
    }

    setProcessText("Revoking...");
    try {
      const umi = createUmi(SOLANA_RPC)
        .use(mplTokenMetadata())
        .use(walletAdapterIdentity(wallet));

      if (signer !== null) {
        const nftMint = publicKey(mint);
        const tokenOwner = publicKey(signer);

        const res = await revokeStandardV1(umi, {
          mint: nftMint,
          tokenOwner,
          // authority: tokenOwner,
          delegate: publicKey(BEETWALLT),
          tokenStandard: TokenStandard.NonFungible,
        }).sendAndConfirm(umi);

        const signature = bs58.encode(res.signature);
        console.log("signature", signature);

        setProcessText("Updating server...");
        const resApi = await withdrawMinerFromPool(
          mint,
          wallet.publicKey?.toBase58() as string,
          signature
        );

        console.log(resApi);
        toast.success(resApi.message);
        refetch();
        setProcessText("");
        setLoading(false);
      }
    } catch (error) {
      if (JSON.stringify(error).indexOf("4001") === -1) {
        toast.error("Something went wrong");
      }
    } finally {
      refetch();
      setLoading(false);
    }
  };

  return (
    <div className="aspect-square relative overflow-hidden border border-gray-700 group">
      <Image src={image} objectFit="cover" unoptimized fill alt="" />
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
              // onClick={handleUnstake}
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
          {processText !== "" && (
            <p className="text-white absolute left-1/2 -translate-x-1/2 bottom-5 text-center">
              {processText}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default NftCard;
