import { Connection } from "@solana/web3.js";
import { SOLANA_RPC } from "@/config";

export const solConnection = new Connection(SOLANA_RPC);
