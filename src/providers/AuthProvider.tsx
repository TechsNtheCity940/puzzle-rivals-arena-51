import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CURRENT_USER } from "@/lib/seed-data";
import { apiRequest, getStoredAuthToken, setStoredAuthToken } from "@/lib/api-client";
import type { UserProfile } from "@/lib/types";

interface AuthContextValue {
  isReady: boolean;
  token: string | null;
  user: UserProfile | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function createGuestSession() {
  return apiRequest<{ token: string; user: UserProfile }>("/api/auth/guest", {
    method: "POST",
    body: JSON.stringify({ username: CURRENT_USER.username }),
  });
}

async function fetchCurrentUser(token: string) {
  return apiRequest<{ user: UserProfile }>("/api/auth/me", {
    method: "GET",
    token,
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const storedToken = getStoredAuthToken();
        if (storedToken) {
          try {
            const me = await fetchCurrentUser(storedToken);
            if (!mounted) return;
            setToken(storedToken);
            setUser(me.user);
            setIsReady(true);
            return;
          } catch {
            setStoredAuthToken(null);
          }
        }

        const session = await createGuestSession();
        if (!mounted) return;
        setStoredAuthToken(session.token);
        setToken(session.token);
        setUser(session.user);
      } finally {
        if (mounted) {
          setIsReady(true);
        }
      }
    }

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  async function refreshUser() {
    const currentToken = token ?? getStoredAuthToken();
    if (!currentToken) return;

    const me = await fetchCurrentUser(currentToken);
    setUser(me.user);
  }

  const value = useMemo(
    () => ({
      isReady,
      token,
      user,
      refreshUser,
    }),
    [isReady, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}
