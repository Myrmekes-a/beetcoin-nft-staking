import { Connection, ParsedAccountData, PublicKey } from "@solana/web3.js";
import { BEETWALLT, SOLANA_RPC } from "@/config";
import { getAssociatedTokenAddress } from "@solana/spl-token";

export const solConnection = new Connection(SOLANA_RPC);

export const getDelegateStatus = async (mint: string, signer: PublicKey) => {
  try {
    const tokenAccount = await getAssociatedTokenAddress(
      new PublicKey(mint),
      signer
    );
    const tokenAccountData = await solConnection.getParsedAccountInfo(
      tokenAccount
    );

    const parsedInfo = tokenAccountData.value?.data as ParsedAccountData;
    const delegateAddress = parsedInfo.parsed?.info.delegate;
    const delegateAmount = parsedInfo.parsed?.info.delegatedAmount;

    if (delegateAddress === BEETWALLT && delegateAmount !== 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error fetching delegate status:", error);
    return false; // Return false in case of any error
  }
};
