"use client";
import Header from "@/components/Header";
import NftCard from "@/components/NftCard";
import { Background } from "@/components/Widgets";
import useNfts from "@/hooks/useNfts";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const { publicKey, connected } = useWallet();
  const { nfts, loading } = useNfts(publicKey, connected);

  return (
    <main className="relative min-h-screen backdrop-blur-lg">
      <div className="max-w-[1200px] mx-auto">
        <Header />
        <section className="relative z-30">
          <h1 className="text-4xl text-white text-center font-bold">
            Stake your NFTs
          </h1>
          {!(connected && publicKey) ? (
            <div className="flex items-center justify-center">
              <div className="text-white text-center px-20 py-6 mt-20 text-md bg-slate-500/40 mx-auto rounded-lg">
                Note: Please connect your wallet
              </div>
            </div>
          ) : (
            <>
              {loading ? (
                <div className="grid grid-cols-4 gap-4 mt-20">
                  {Array.from({ length: 4 }).map((_, key) => (
                    <div
                      className="animate-pulse bg-slate-600 aspect-square rounded-md"
                      key={key}
                    />
                  ))}
                </div>
              ) : (
                <>
                  {nfts.length !== 0 ? (
                    <div className="grid grid-cols-4 gap-4 mt-20">
                      {nfts.map((nft, index) => (
                        <NftCard {...nft} key={`${index}-${nft.mint}`} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-white text-center px-20 py-6 mt-20 text-2xl bg-purple-700/20 rounded-lg">
                      You don&#39;t have any{" "}
                      <span className="font-bold">beetMiners</span> <br />
                      <div className="text-lg mt-3 flex items-center gap-2 justify-center">
                        Buy beetMiner on
                        <div className="flex items-center gap-1">
                          <Link href="https://magiceden.io/marketplace/beetminer">
                            <Image
                              src="/icons/magiceden.svg"
                              width={24}
                              height={24}
                              alt=""
                            />
                          </Link>
                          <Link href="https://www.tensor.trade/trade/beetminer">
                            <Image
                              src="/icons/tensor.svg"
                              width={24}
                              height={24}
                              alt=""
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </section>
      </div>
      <Background />
    </main>
  );
}
