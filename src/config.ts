import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const SOL_PRICE_API =
  "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd";

export const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC ?? "";

export const CREATOR_ADDRESS = process.env.NEXT_PUBLIC_CREATOR_ADDRESS ?? "";

export const BEETWALLT = process.env.NEXT_PUBLIC_BEET_ADDRESS ?? "";
export const BEETCOIN_ADDRESS = "4v5nbBSUyLQdHV3yFg4W1fMGPbbsbZDG54urSyCsbEtY";

// export const STAKING_COST_BEET = 2_000_000_000;
export const STAKING_COST_BEET = LAMPORTS_PER_SOL * 2;
// export const STAKING_COST_SOL = 2_000_000;
export const STAKING_COST_SOL = LAMPORTS_PER_SOL * 0.02;
