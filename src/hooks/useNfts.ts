/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { Nft } from "@/utils/type";
import { getParsedNftAccountsByOwner } from "@nfteyez/sol-rayz";
import { CREATOR_ADDRESS, SOLANA_RPC } from "@/config";
import { solConnection } from "@/utils/util";

const useNfts = (address: PublicKey | null, connected?: boolean) => {
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const publicKey = address?.toBase58();

  const fetchNfts = async () => {
    setLoading(true);
    try {
      // Fetch the NFT accounts for the given address
      const nftAccounts = await getParsedNftAccountsByOwner({
        publicAddress: publicKey ?? "",
        connection: solConnection,
      });

      // If there are no NFT accounts, return an empty array
      if (!nftAccounts || nftAccounts.length === 0) {
        setLoading(false);
        return;
      }

      // Prepare an array to hold the full NFT data
      let fullData: Nft[] = [];

      // Fetch metadata for each NFT concurrently
      await Promise.all(
        nftAccounts.map(async (account) => {
          // Check if the NFT is verified and the creator address matches the specified address
          const creatorMatch = account.data.creators.find(
            (creator) =>
              creator.verified === 1 && creator.address === CREATOR_ADDRESS
          );

          // If the creator match is not found, skip this NFT
          if (!creatorMatch) {
            return;
          }

          // Fetch metadata from the URI
          const metadataRes = await fetch(account.data.uri);
          if (!metadataRes.ok) {
            throw new Error("Failed to fetch metadata from uri");
          }

          // Parse the metadata JSON
          const metadata = await metadataRes.json();

          // Construct the NFT object
          const nft: Nft = {
            mint: account.mint,
            image: metadata.image,
            attributes: {
              hashpower: metadata.attributes.find(
                (attr: any) => attr?.trait_type === "Hashpower"
              )?.value,
              electricityConsumption: metadata.attributes.find(
                (attr: any) => attr?.trait_type === "Electricity Consumption"
              )?.value,
            },
            description: metadata.description,
            updateAuthority: account.updateAuthority,
            data: account.data,
            primarySaleHappened: account.primarySaleHappened,
            isMutable: account.isMutable,
            editionNonce: account.editionNonce,
            masterEdition: account.masterEdition,
            edition: account.edition,
            staked: false,
            stakedAt: new Date().getTime(),
            owner: publicKey ?? "",
          };

          // Add the NFT to the full data array
          fullData.push(nft);
        })
      );

      setNfts(fullData);
      setLoading(false);
      return fullData;
    } catch (error: any) {
      // Log any errors that occur during the process
      console.log(error);
      setLoading(false);
      setError(error);
      return;
    }
  };
  useEffect(() => {
    if (publicKey && connected) {
      fetchNfts();
    } else {
      setNfts([]);
      setLoading(false);
    }
  }, [address, connected, publicKey]);

  return { nfts, error, loading, fetchNfts };
};

export default useNfts;
