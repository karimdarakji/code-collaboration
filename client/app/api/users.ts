import { useQuery } from "@tanstack/react-query";
import api from "./axiosInstance";

export const useGetUser = () => {
  return useQuery<UserProfile>({
    queryKey: ["user"],
    queryFn: () => api("GET", "auth/profile"),
  });
};
