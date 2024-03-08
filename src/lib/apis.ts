import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const poolMiner = async (
  nftAddress: string,
  ownerAddress: string,
  signature: string
) => {
  try {
    const response = await axios.post(`${baseURL}/poolMiner`, {
      nftAddress,
      ownerAddress,
      signature,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const withdrawMinerFromPool = async (
  nftAddress: string,
  ownerAddress: string,
  signature: string
) => {
  try {
    const response = await axios.post(`${baseURL}/withdrawMinerFromPool`, {
      nftAddress,
      ownerAddress,
      signature,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const minerPoolStatus = async (nftAddress: string) => {
  try {
    const response = await axios.post(`${baseURL}/minerPoolStatus`, {
      nftAddress,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
