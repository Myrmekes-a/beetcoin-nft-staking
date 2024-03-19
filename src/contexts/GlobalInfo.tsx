"use client";

import { usePoolGlobalStatus } from "@/hooks/usePoolGlobalStatus";
import { FC } from "react";

const GlobalInfo: FC = () => {
  const { isLoading, detail, status } = usePoolGlobalStatus();

  return (
    <div className="rounded-2xl bg-white/10 p-5 lg:p-10 text-white relative z-20 flex items-around justify-between info-box">
      {isLoading ? (
        Array.from({ length: 4 }).map((_, key) => (
          <div
            key={key}
            className="animate-pulse bg-white flex flex-col items-center justify-center"
          >
            <div className="rounded-md loading-pice1" />
            <div className="rounded-md mt-2 loading-pice" />
          </div>
        ))
      ) : (
        <>
          <div className="text-center capitalize">
            <h5 className="text-md">pooled miners</h5>
            <p className="text-2xl font-bold">{detail.PooledMiners}</p>
          </div>
          <div className="text-center capitalize">
            <h5 className="text-md">effective hash rate</h5>
            <p className="text-2xl font-bold">{detail.EffectiveHashrate}</p>
          </div>
          <div className="text-center capitalize">
            <h5 className="text-md">mined blocks</h5>
            <p className="text-2xl font-bold">{detail.MinedBlocks}</p>
          </div>
          <div className="text-center capitalize">
            <h5 className="text-md">mined rewards</h5>
            <p className="text-2xl font-bold">{detail.MinedRewards}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default GlobalInfo;
