import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import api from "./axiosInstance";

export const useCreateSessionInvitation = (
  options?: Omit<
    UseMutationOptions<Session, Error, { email: string; sessionId: string }>,
    "mutationFn" | "onSuccess"
  > & {
    onSuccess?: (
      data: Session,
      variables: Partial<Invitation>,
      context?: unknown
    ) => void;
  }
) => {
  const { onSuccess: customOnSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: (body: {
      email: string;
      sessionId: string;
    }): Promise<Session> =>
      api("POST", `sessions/${body.sessionId}/invite`, { email: body.email }),
    onSuccess: (data, variables, context) => {
      if (customOnSuccess) {
        customOnSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};

export const useDeleteSessionInvitation = (
  options?: Omit<
    UseMutationOptions<Session, Error, { id: string; email: string }>,
    "mutationFn" | "onSuccess"
  > & {
    onSuccess?: (
      data: Session,
      variables: { id: string; email: string },
      context?: unknown
    ) => void;
  }
) => {
  const { onSuccess: customOnSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: ({
      id,
      email,
    }: {
      id: string;
      email: string;
    }): Promise<Session> => api("DELETE", `sessions/${id}/invite/${email}`),
    onSuccess: (data, variables, context) => {
      if (customOnSuccess) {
        customOnSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};
