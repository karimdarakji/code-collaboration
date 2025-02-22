"use client";

import { FC, PropsWithChildren, createContext, useContext } from "react";
import { useGetUser } from "../api/users";
import { usePathname } from "next/navigation";

interface AuthContextValues {
  user: UserProfile;
}

const AuthContext = createContext<AuthContextValues | null>(null);

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const pathname = usePathname();
  const { data: user, isLoading, isError } = useGetUser();

  if (isLoading) {
    return null;
  }

  if (isError && pathname !== "/") {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user: user! }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValues {
  return useContext(AuthContext)!;
}
