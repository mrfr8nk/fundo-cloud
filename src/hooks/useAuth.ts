import { useEffect, useState, useCallback } from "react";
import { api, token } from "@/lib/api";

export type Role = "admin" | "user";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  displayName?: string;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token.get()) { setLoading(false); return; }
    api.get("/auth/me")
      .then((u) => setUser(u))
      .catch(() => { token.clear(); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const signOut = useCallback(() => {
    token.clear();
    setUser(null);
  }, []);

  return {
    user,
    isAdmin: user?.role === "admin",
    loading,
    signOut,
  };
}
