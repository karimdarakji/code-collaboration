'use client';

import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../api/axiosInstance";
import { usePathname, useRouter } from "next/navigation";

interface AuthContextValues {
  user?: UserProfile;
}

const AuthContext = createContext<AuthContextValues | null>(null);

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile>();
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const data = await api<UserProfile>("GET", "auth/profile");
      setUser(data);
      if (pathname === '/') {
        router.replace('/sessions');
      }
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        if (pathname !== '/') {
          router.replace('/');
        }
      }
      setUser(undefined);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
