import {
  useMutation,
  UseMutationOptions,
  useQuery,
} from "@tanstack/react-query";
import api from "./axiosInstance";
import { InvitationStatus } from "@/contants";

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

export const useUpdateInvitationStatus = (
  options?: Omit<
    UseMutationOptions<
      Session,
      Error,
      { sessionId: string; token: string; status: InvitationStatus }
    >,
    "mutationFn" | "onSuccess"
  > & {
    onSuccess?: (
      data: Session,
      variables: { sessionId: string; token: string; status: InvitationStatus },
      context?: unknown
    ) => void;
  }
) => {
  const { onSuccess: customOnSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: ({
      sessionId,
      token,
      status,
    }: {
      sessionId: string;
      token: string;
      status: InvitationStatus;
    }): Promise<Session> =>
      api("POST", `sessions/${sessionId}/invite/${token}/status`, { status }),
    onSuccess: (data, variables, context) => {
      if (customOnSuccess) {
        customOnSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
};

export const useGetSessionByInvitationToken = (token: string) => {
  return useQuery({
    queryKey: ["session", "invitation", token],
    queryFn: (): Promise<Session> => api("GET", `sessions/invitation/${token}`),
    enabled: !!token,
  });
};
