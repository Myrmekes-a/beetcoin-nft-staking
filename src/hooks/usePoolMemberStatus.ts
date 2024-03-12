import { BASE_URL } from "@/config";
import axios from "axios";
import { useQuery } from "react-query";

export function usePoolMemberStatus(ownerAddress: string) {
  const res = useQuery("poolMemberStatus", async () => {
    const response = await axios.post(`${BASE_URL}/poolMemberStatus`, {
      ownerAddress,
    });
    return response.data;
  });
  return {
    isLoading: res.isLoading,
    detail: {
      Address: res.data?.Address,
      AssignedReward: res.data?.AssignedReward,
      ClaimedReward: res.data?.ClaimedReward,
      LastClaimTimestamp: res.data?.LastClaimTimestamp,
    },
    status: res.status,
  };
}
