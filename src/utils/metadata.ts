import { getParsedNftAccountsByOwner } from "@nfteyez/sol-rayz";

import { PublicKey } from "@solana/web3.js";
import { solConnection } from "./util";
import { BEETCOIN_ADDRESS, BEETWALLT, SOLANA_RPC } from "@/config";

export type Item = {
  name: string;
  image: string;
  mint: string;
  rollCount?: number;
  curHp?: number;
  consumption?: string;
};

export const getWalletNfts = async (
  wallet: string,
  cb: (res: Item[]) => void
) => {
  const unstakedNftList = await getMetadataDetail(wallet); // Make sure this function is properly defined or imported
  if (!unstakedNftList.length) {
    cb([]);
    return;
  }

  const promises: Promise<Item | undefined>[] = unstakedNftList.map(
    async (item) => {
      if (
        item.data.creators &&
        item.data.creators[0]?.address === BEETWALLT &&
        item.data.creators[0]?.verified
      ) {
        try {
          const minerMetadata = await getMinerMetadata(item.mint);
          if (minerMetadata) {
            // Assuming getContractNftData is another utility function you have for fetching roll counts
            return {
              name: minerMetadata.name,
              image: minerMetadata.imageUri, // You might need to adjust this depending on how you want to use the URI
              mint: item.mint,
              curHp: parseInt(minerMetadata.curHp),
              consumption: parseFloat(minerMetadata.consumption).toFixed(4),
            };
          }
        } catch (e) {
          console.error("Error while fetching metadata for", item.mint, e);
        }
      }
      return undefined;
    }
  );

  const nfts = (await Promise.all(promises)).filter(
    (nft) => nft !== undefined
  ) as Item[];
  cb(nfts);
};

const getMetadataDetail = async (address: string) => {
  const nftsList = await getParsedNftAccountsByOwner({
    publicAddress: address,
    connection: solConnection,
  });
  return nftsList;
};

export const getTokenBalance = async (
  walletAddress: string
): Promise<number> => {
  const tokenAccount = await solConnection.getTokenAccountsByOwner(
    new PublicKey(walletAddress),
    { mint: new PublicKey(BEETCOIN_ADDRESS) }
  );
  let totalBalance = 0;
  for (const account of tokenAccount.value) {
    const balance = await solConnection.getTokenAccountBalance(account.pubkey);
    totalBalance += parseInt(balance.value.amount);
  }
  return totalBalance;
};

export const getMinerMetadata = async (mint: string) => {
  interface MinerMetadata {
    data?: {
      name: string;
      symbol: string;
      uri: string;
    };
  }

  const response = await fetch(SOLANA_RPC, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "my-id",
      method: "getAsset", // Ensure this method is supported by your API
      params: {
        id: mint, // Ensure these parameters match what your API expects
      },
    }),
  });

  const { result } = await response.json();
  if (!result) {
    console.log("No result found");
    return null;
  }

  const metadataUri = result.content.json_uri;
  const metadataResponse = await fetch(metadataUri);
  const metadataJson = await metadataResponse.json();

  const hashpower = metadataJson.attributes.find(
    (attr: any) => attr.trait_type === "Hashpower"
  );
  const electricityComsumption = metadataJson.attributes.find(
    (attr: any) => attr.trait_type === "Electricity Consumption"
  );
  console.log(
    "Hashpower:",
    hashpower,
    "Electricity Consumption:",
    electricityComsumption
  );

  return {
    name: metadataJson.name,
    curHp: hashpower.value,
    consumption: electricityComsumption.value,
    uri: metadataUri,
    imageUri: metadataJson.image,
  };
};
