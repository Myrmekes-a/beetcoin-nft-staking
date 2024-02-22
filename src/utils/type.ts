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
  edition?: string | undefined;
  staked: boolean;
  stakedAt: number;
  owner: string;
};
