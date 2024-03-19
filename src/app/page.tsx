/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import Header from "@/components/Header";
import NftCard from "@/components/NftCard";
import { Spinner } from "@/components/SvgIcon";
import { Background, Tabs } from "@/components/Widgets";
import { MAX_SELECTABLE } from "@/config";
import GlobalInfo from "@/contexts/GlobalInfo";
import useNfts from "@/hooks/useNfts";
import { stake, unstake } from "@/utils/staking";
import { Nft } from "@/utils/type";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const wallet = useWallet();
  const { publicKey, connected } = wallet;

  const { nfts, loading, fetchNfts } = useNfts(publicKey);
  const [tab, setTab] = useState<"all" | "staked" | "unstaked">("unstaked");
  const [selected, setSelected] = useState<Nft[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchNfts();
      } catch (error) {
        console.error("Error fetching NFTs:", error);
      }
    };

    fetchData();
  }, [publicKey]);

  const stakedNfts = nfts.filter((nft) => nft.staked);
  const unStakedNfts = nfts.filter((nft) => !nft.staked);

  const handleSelect = (nft: Nft) => {
    let sel = [...selected];
    const index = sel.findIndex((s) => s.mint === nft.mint);
    if (!(nft.staked && nft.status !== "frozen")) {
      if (index !== -1 || sel.length === MAX_SELECTABLE) {
        // If the NFT is already selected, remove it
        sel.splice(index, 1);
      } else {
        // If the NFT is not selected, add it to the selection
        sel.push(nft);
      }
    }
    setSelected(sel);
  };

  useEffect(() => {
    setSelected([]);
  }, [tab]);

  const [processing, setProcessing] = useState(false);
  const [processText, setProcessText] = useState("");

  const handleStake = async () => {
    await stake({
      wallet,
      mints: selected.map((item) => item.mint),
      setLoading: setProcessing,
      setProcessText,
      refetch: async () => await fetchNfts(),
    });
  };

  const handleUnStake = async () => {
    await unstake({
      wallet,
      mints: selected.map((item) => item.mint),
      setLoading: setProcessing,
      setProcessText,
      refetch: async () => await fetchNfts(),
    });
  };

  return (
    <main className="relative min-h-screen backdrop-blur-lg">
      <div className="max-w-[calc(100%-32px)] xl:max-w-[1200px] mx-4 xl:mx-auto pb-20">
        <Header />
        <GlobalInfo />
        <section className="relative z-30 mt-10">
          <h1 className="text-xl xl:text-2xl text-white text-center font-bold">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-20">
                  {Array.from({ length: 5 }).map((_, key) => (
                    <div
                      className="animate-pulse bg-slate-600 aspect-square rounded-md"
                      key={key}
                    />
                  ))}
                </div>
              ) : (
                <>
                  {nfts.length !== 0 ? (
                    <div className="mt-10 relative z-30">
                      <div className="flex items-center justify-between">
                        <Tabs nfts={nfts} tab={tab} setTab={setTab} />
                        {tab === "staked" ? (
                          <div className="text-white">
                            <button
                              className="capitalize py-2 px-4 mr-3 disabled:opacity-30 disabled:cursor-no-drop"
                              disabled={selected.length === 0}
                              onClick={() => setSelected([])}
                            >
                              deselect all
                            </button>
                            <button
                              className="w-[120px] capitalize py-1.5 px-5 border font-bold rounded-lg bg-pink-600 hover:bg-pink-700 duration-200 disabled:opacity-50 disabled:pointer-events-none"
                              disabled={selected.length === 0}
                              onClick={handleUnStake}
                            >
                              unstake
                            </button>
                          </div>
                        ) : (
                          <div className="text-white">
                            {selected.length !== 0 && (
                              <button
                                className="capitalize py-2 px-4 mr-3"
                                onClick={() => setSelected([])}
                              >
                                deselect all
                              </button>
                            )}
                            <button
                              className="w-[120px] capitalize py-1.5 px-5 border font-bold rounded-lg bg-pink-600 hover:bg-pink-700 duration-200 disabled:opacity-50 disabled:pointer-events-none"
                              disabled={selected.length === 0}
                              onClick={handleStake}
                            >
                              stake
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-10">
                        {tab === "staked" &&
                          stakedNfts.map((nft, index) => (
                            <NftCard
                              key={`${index}-${nft.mint}`}
                              nft={nft}
                              refetch={async () => await fetchNfts()}
                              selected={selected}
                              select={() => handleSelect(nft)}
                            />
                          ))}
                        {tab === "unstaked" &&
                          unStakedNfts.map((nft, index) => (
                            <NftCard
                              key={`${index}-${nft.mint}`}
                              nft={nft}
                              refetch={async () => await fetchNfts()}
                              selected={selected}
                              select={() => handleSelect(nft)}
                            />
                          ))}
                      </div>
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
      {processing && (
        <div className="fixed left-0 top-0 z-[1000] w-screen h-screen flex items-center justify-center flex-col bg-black/30 backdrop-blur-md">
          <Spinner className="w-12 h-12 text-white animate-spin fill-pink-600 mx-auto" />
          <p className="text-white text-lg">{processText}</p>
        </div>
      )}
    </main>
  );
}
