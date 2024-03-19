export type Nft = {
  mint: string;
  updateAuthority: string;
  image: string;
  description: string;
  attributes: {
    hashpower: number;
    electricityConsumption: number;
  };
  data: {
    creators: any[];
    name: string;
    symbol: string;
    uri: string;
    sellerFeeBasisPoints: number;
  };
  primarySaleHappened: boolean;
  isMutable: boolean;
  editionNonce: number;
  masterEdition?: string | undefined;
  staked: boolean;
  stakedAt: number;
  owner: string;
  status: string;
  edition?: string | undefined;
};

export type PoolStatus = {
  nftAddress: string;
  isPooled: boolean;
  status?: string;
  timestamp?: string;
};
