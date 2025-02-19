import { useQuery } from "@tanstack/react-query"
import api from "./axiosInstance"

export const useGetSessions = () => {
    return useQuery<Session[]>({
        queryKey: ['sessions'],
        queryFn: () => api('GET', 'sessions')
    })
}