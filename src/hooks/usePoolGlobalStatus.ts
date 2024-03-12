import { BASE_URL } from "@/config";
import axios from "axios";
import { useQuery } from "react-query";

export function usePoolGlobalStatus() {
  const res = useQuery("poolGlobalStatus", async () => {
    const response = await axios.post(`${BASE_URL}/poolGlobalStatus`);
    return response.data;
  });
  return {
    isLoading: res.isLoading,
    detail: {
      EffectiveHashrate: res.data?.EffectiveHashrate,
      MinedBlocks: res.data?.MinedBlocks,
      MinedRewards: res.data?.MinedRewards,
      PooledMiners: res.data?.PooledMiners,
    },
    status: res.status,
  };
}
