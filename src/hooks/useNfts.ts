/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { Nft } from "@/utils/type";
import { getParsedNftAccountsByOwner } from "@nfteyez/sol-rayz";
import { CREATOR_ADDRESS } from "@/config";
import { getDelegateStatus, solConnection } from "@/utils/util";
import { minerPoolStatus } from "@/lib/apis";

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

          let staked = false;
          if (address) {
            staked = await getDelegateStatus(account.mint, address);
          }

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
            stakedAt: 0,
            owner: publicKey ?? "",
          };

          // Add the NFT to the full data array
          fullData.push(nft);
        })
      );

      const stakedData = await minerPoolStatus(
        fullData.map((item) => item.mint)
      );

      const newArray: Nft[] = [];

      for (let nft of fullData) {
        const matched = stakedData.find((item) => item.nftAddress === nft.mint);
        newArray.push({
          ...nft,
          staked: matched?.isPooled || false, // Default to false if isPooled is undefined
          stakedAt: matched?.timestamp
            ? new Date(matched.timestamp).getTime()
            : 0,
        });
      }

      setNfts(
        newArray.sort(
          (a, b) =>
            parseInt(a.data.name.split("#")[1]) -
            parseInt(b.data.name.split("#")[1])
        )
      );
      setLoading(false);
      return newArray;
    } catch (error: any) {
      // Log any errors that occur during the process
      console.log(error);
      setLoading(false);
      setError(error);
      return;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (publicKey && connected) {
        await fetchNfts();
      } else {
        setNfts([]);
        setLoading(false);
      }
    };

    fetchData();
  }, [address, connected, publicKey]);

  return { nfts, error, loading, fetchNfts };
};

export default useNfts;
