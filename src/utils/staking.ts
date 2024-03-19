import { WalletContextState } from "@solana/wallet-adapter-react";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import bs58 from "bs58";
import {
  BEETCOIN_ADDRESS,
  BEETWALLT,
  SOLANA_RPC,
  STAKING_COST_BEET,
  STAKING_COST_SOL,
  UNSTAKING_COST_SOL,
} from "@/config";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  WrappedInstruction,
  publicKey,
  transactionBuilder,
} from "@metaplex-foundation/umi";
import {
  TokenStandard,
  delegateStandardV1,
  mplTokenMetadata,
  revokeStandardV1,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  setComputeUnitLimit,
  setComputeUnitPrice,
} from "@metaplex-foundation/mpl-toolbox";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createTransferCheckedWithFeeInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { poolMiner, withdrawMinerFromPool } from "@/lib/apis";

interface StakeProps {
  wallet: WalletContextState;
  mints: string[];
  setLoading: Dispatch<SetStateAction<boolean>>;
  setProcessText: Dispatch<SetStateAction<string>>;
  refetch: () => void;
}

export const stake = async ({
  wallet,
  setLoading,
  mints,
  refetch,
  setProcessText,
}: StakeProps) => {
  if (!wallet.connected || !wallet.publicKey) {
    console.error("Wallet not connected");
    return;
  }
  const signer = wallet.publicKey;

  setLoading(true);

  try {
    setProcessText("Delegating...");
    const umi = createUmi(SOLANA_RPC)
      .use(mplTokenMetadata())
      .use(walletAdapterIdentity(wallet));

    if (signer !== null) {
      let multiStakeTx = transactionBuilder();
      for (let mint of mints) {
        const nftMint = publicKey(mint);
        const tokenOwner = publicKey(signer);
        const res = delegateStandardV1(umi, {
          mint: nftMint,
          tokenOwner,
          delegate: publicKey(BEETWALLT),
          tokenStandard: TokenStandard.ProgrammableNonFungible,
        });
        multiStakeTx = multiStakeTx.add(res);
      }
      const tokenMintAddress = new PublicKey(BEETCOIN_ADDRESS);
      const destinationAddress = new PublicKey(BEETWALLT);
      const sourceTokenAccountAddress = await getAssociatedTokenAddress(
        tokenMintAddress,
        signer,
        true,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const destinationTokenAccountAddress = await getAssociatedTokenAddress(
        tokenMintAddress,
        destinationAddress,
        true,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const basisPoints = 4;
      const feesAmount =
        (STAKING_COST_BEET * mints.length * basisPoints) / 10000;
      const feesAmountBigInt = BigInt(feesAmount);
      const bigIntAmount = BigInt(STAKING_COST_BEET * mints.length);

      const tokenPaymentInstruction = createTransferCheckedWithFeeInstruction(
        sourceTokenAccountAddress,
        tokenMintAddress,
        destinationTokenAccountAddress,
        signer,
        bigIntAmount,
        9,
        feesAmountBigInt
      );

      const costIx: WrappedInstruction = {
        instruction: {
          data: tokenPaymentInstruction.data,
          keys: tokenPaymentInstruction.keys.map((key) => {
            return {
              ...key,
              pubkey: publicKey(key.pubkey),
            };
          }),
          programId: publicKey(tokenPaymentInstruction.programId),
        },
        signers: [],
        bytesCreatedOnChain: 0,
      };

      const solPaymentInstruction = SystemProgram.transfer({
        fromPubkey: signer,
        toPubkey: destinationAddress,
        lamports: STAKING_COST_SOL * mints.length,
      });

      const solCostIx: WrappedInstruction = {
        instruction: {
          data: solPaymentInstruction.data,
          keys: solPaymentInstruction.keys.map((key) => {
            return {
              ...key,
              pubkey: publicKey(key.pubkey),
            };
          }),
          programId: publicKey(solPaymentInstruction.programId),
        },
        signers: [],
        bytesCreatedOnChain: 0,
      };

      const sigRes = await multiStakeTx
        .add(setComputeUnitLimit(umi, { units: 1_500_000 }))
        .add(setComputeUnitPrice(umi, { microLamports: 250_000 }))
        .add(costIx)
        .add(solCostIx)
        .sendAndConfirm(umi);

      const signature = bs58.encode(sigRes.signature);
      console.log("stake signature", signature);

      setProcessText("Updating server...");

      const resApi = await poolMiner(
        mints,
        wallet.publicKey?.toBase58() as string,
        signature
      );

      console.log(resApi);
      setProcessText("");
      toast.success("Miner pooled successfully");
      refetch();
      setLoading(false);
    }
  } catch (error) {
    if (JSON.stringify(error).indexOf("4001") === -1) {
      toast.error("Something went wrong");
    }
    setLoading(false);
  } finally {
    setLoading(false);
    setProcessText("");
  }
};

interface UnStakeProps {
  wallet: WalletContextState;
  mints: string[];
  setLoading: Dispatch<SetStateAction<boolean>>;
  setProcessText: Dispatch<SetStateAction<string>>;
  refetch: () => void;
}

export const unstake = async ({
  wallet,
  setLoading,
  mints,
  refetch,
  setProcessText,
}: UnStakeProps) => {
  const signer = wallet.publicKey;
  setLoading(true);
  try {
    const umi = createUmi(SOLANA_RPC)
      .use(mplTokenMetadata())
      .use(walletAdapterIdentity(wallet));

    setProcessText("Unfreezing...");
    const tokenMintAddress = new PublicKey(BEETCOIN_ADDRESS);
    const destinationAddress = new PublicKey(BEETWALLT);
    const transferTx = transactionBuilder();
    if (signer) {
      const sourceTokenAccountAddress = await getAssociatedTokenAddress(
        tokenMintAddress,
        signer,
        true,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const destinationTokenAccountAddress = await getAssociatedTokenAddress(
        tokenMintAddress,
        destinationAddress,
        true,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const basisPoints = 4;
      const feesAmount =
        (STAKING_COST_BEET * mints.length * basisPoints) / 10000;
      const feesAmountBigInt = BigInt(feesAmount);
      const bigIntAmount = BigInt(STAKING_COST_BEET * mints.length);

      const tokenPaymentInstruction = createTransferCheckedWithFeeInstruction(
        sourceTokenAccountAddress,
        tokenMintAddress,
        destinationTokenAccountAddress,
        signer,
        bigIntAmount,
        9,
        feesAmountBigInt
      );

      const costIx: WrappedInstruction = {
        instruction: {
          data: tokenPaymentInstruction.data,
          keys: tokenPaymentInstruction.keys.map((key) => {
            return {
              ...key,
              pubkey: publicKey(key.pubkey),
            };
          }),
          programId: publicKey(tokenPaymentInstruction.programId),
        },
        signers: [],
        bytesCreatedOnChain: 0,
      };

      const solPaymentInstruction = SystemProgram.transfer({
        fromPubkey: signer,
        toPubkey: destinationAddress,
        lamports: UNSTAKING_COST_SOL * mints.length,
      });

      const solCostIx: WrappedInstruction = {
        instruction: {
          data: solPaymentInstruction.data,
          keys: solPaymentInstruction.keys.map((key) => {
            return {
              ...key,
              pubkey: publicKey(key.pubkey),
            };
          }),
          programId: publicKey(solPaymentInstruction.programId),
        },
        signers: [],
        bytesCreatedOnChain: 0,
      };
      const sigRes = await transferTx
        .add(setComputeUnitLimit(umi, { units: 1_500_000 }))
        .add(setComputeUnitPrice(umi, { microLamports: 250_000 }))
        .add(costIx)
        .add(solCostIx)
        .sendAndConfirm(umi);
      const signature = bs58.encode(sigRes.signature);
      console.log("stake signature", signature);

      const resApi = await withdrawMinerFromPool(
        mints,
        wallet.publicKey?.toBase58() as string,
        signature
      );
      console.log(resApi);
    }

    // setProcessText("Revoking...");
    // setProcessText("Updating server...");

    refetch();
    setLoading(false);
    toast.success("Successfully");
    // if (signer !== null) {
    //   let multiUnStakeTx = transactionBuilder();
    //   // const multiUnStakeTx = new TransactionBuilder();
    //   for (let mint of mints) {
    //     const nftMint = publicKey(mint);
    //     const tokenOwner = publicKey(signer);

    //     const res = revokeStandardV1(umi, {
    //       mint: nftMint,
    //       tokenOwner,
    //       delegate: publicKey(BEETWALLT),
    //       tokenStandard: TokenStandard.NonFungible,
    //     });

    //     multiUnStakeTx = multiUnStakeTx.add(res);
    //   }

    //   const sigRes = await multiUnStakeTx.sendAndConfirm(umi);

    //   const signature = bs58.encode(sigRes.signature);
    //   console.log("unstake signature", signature);

    //   setProcessText("");

    //   refetch();
    //   setLoading(false);
    //   toast.success("Successfully");
    // }
  } catch (error) {
    console.log(error);
    if (JSON.stringify(error).indexOf("4001") === -1) {
      toast.error("Something went wrong");
    }
  } finally {
    setLoading(false);
  }
};
