import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import api from "./axiosInstance";

export const useGetSessions = () => {
  return useQuery<Session[]>({
    queryKey: ["sessions"],
    queryFn: () => api("GET", "sessions"),
  });
};

export const useCreateSession = (
  options?: Omit<
    UseMutationOptions<Session, Error, Partial<Session>>,
    "mutationFn" | "onSuccess"
  > & {
    onSuccess?: (
      data: Session,
      variables: Partial<Session>,
      context?: unknown
    ) => void;
  }
) => {
  const queryClient = useQueryClient();
  const { onSuccess: customOnSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: (newSession: Partial<Session>): Promise<Session> =>
      api("POST", "sessions", newSession),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      if (customOnSuccess) {
        customOnSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};

export const useDeleteSession = (
  options?: Omit<
    UseMutationOptions<Session, Error, string>,
    "mutationFn" | "onSuccess"
  > & {
    onSuccess?: (data: Session, variables: string, context?: unknown) => void;
  }
) => {
  const queryClient = useQueryClient();
  const { onSuccess: customOnSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: (id: string): Promise<Session> =>
      api("DELETE", `sessions/${id}`),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      if (customOnSuccess) {
        customOnSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};
