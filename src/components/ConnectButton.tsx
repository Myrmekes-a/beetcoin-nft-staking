"use client";

import { FC, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { ArrowLine, ExitIcon, WalletIcon } from "./SvgIcon";

const ConnectButton: FC = () => {
  const { setVisible } = useWalletModal();
  const { publicKey, disconnect } = useWallet();

  return (
    <button className="rounded-lg border-[0.75px] border-primary-300 bg-primary-200 shadow-btn-inner text-primary-100 tracking-[0.32px] py-2 px-2 w-[160px] lg:w-[180px] group relative h-11">
      {publicKey ? (
        <>
          <div className="flex items-center justify-center text-[16px] lg:text-md">
            {publicKey.toBase58().slice(0, 4)}....
            {publicKey.toBase58().slice(-4)}
            <div className="rotate-90 w-3 h-3">
              <ArrowLine />
            </div>
          </div>
          <div className="w-[200px] absolute right-0 top-10 hidden group-hover:block">
            <ul className="border-[0.75px] border-[#89C7B5] rounded-lg bg-[#162923] p-2 mt-2">
              <li>
                <div
                  className="flex gap-2 items-center mb-1 text-primary-100 text-md tracking-[-0.32px]"
                  onClick={() => setVisible(true)}
                >
                  <WalletIcon /> Change Wallet
                </div>
              </li>
              <li>
                <div
                  className="flex gap-2 items-center text-primary-100 text-md tracking-[-0.32px]"
                  onClick={disconnect}
                >
                  <ExitIcon /> Disconnect
                </div>
              </li>
            </ul>
          </div>
        </>
      ) : (
        <div
          className="flex items-center justify-center gap-1 text-md"
          onClick={() => setVisible(true)}
        >
          Connect wallet <ArrowLine />
        </div>
      )}
      {/* <div className=""></div> */}
    </button>
  );
};

export default ConnectButton;
