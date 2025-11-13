import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  createdAt: string;
}

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem("adminToken");
        const storedUser = localStorage.getItem("adminUser");

        console.log("[Auth] Initializing from localStorage", {
          hasToken: !!storedToken,
          hasUser: !!storedUser,
          tokenLength: storedToken?.length || 0,
        });

        if (storedToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log("[Auth] Successfully parsed user:", parsedUser);
            setToken(storedToken);
            setUser(parsedUser);
          } catch (parseError) {
            console.error("[Auth] Failed to parse stored user:", parseError);
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");
          }
        } else {
          console.log("[Auth] No stored credentials found in localStorage");
        }
      } catch (error) {
        console.error("[Auth] Error initializing auth:", error);
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
      } finally {
        // Mark loading as complete after attempting to restore
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (newToken: string, newUser: AdminUser) => {
    console.log("[Auth] Logging in user:", newUser.email);
    setToken(newToken);
    setUser(newUser);
    try {
      localStorage.setItem("adminToken", newToken);
      localStorage.setItem("adminUser", JSON.stringify(newUser));
      console.log("[Auth] Credentials saved to localStorage");
    } catch (error) {
      console.error("[Auth] Failed to save credentials to localStorage:", error);
    }
  };

  const logout = () => {
    console.log("[Auth] Logging out");
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      console.log("[Auth] Credentials removed from localStorage");
    } catch (error) {
      console.error("[Auth] Failed to remove credentials from localStorage:", error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
