import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";

interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  createdAt: string;
}

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  isAuthenticated: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: "INITIALIZE_SUCCESS"; token: string; user: AdminUser }
  | { type: "INITIALIZE_COMPLETE" }
  | { type: "LOGIN"; token: string; user: AdminUser }
  | { type: "LOGOUT" };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "INITIALIZE_SUCCESS":
      console.log("[Auth] Reducer: restoring session for", action.user.email);
      return {
        ...state,
        token: action.token,
        user: action.user,
        isLoading: false,
      };
    case "INITIALIZE_COMPLETE":
      console.log("[Auth] Reducer: initialization complete");
      return {
        ...state,
        isLoading: false,
      };
    case "LOGIN":
      console.log("[Auth] Reducer: user logged in", action.user.email);
      return {
        token: action.token,
        user: action.user,
        isLoading: false,
      };
    case "LOGOUT":
      console.log("[Auth] Reducer: user logged out");
      return {
        token: null,
        user: null,
        isLoading: false,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isLoading: true,
  });

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
            dispatch({
              type: "INITIALIZE_SUCCESS",
              token: storedToken,
              user: parsedUser,
            });
            return;
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
      }

      // If we reach here, initialization is complete but no credentials were restored
      dispatch({ type: "INITIALIZE_COMPLETE" });
    };

    initializeAuth();
  }, []);

  const login = (newToken: string, newUser: AdminUser) => {
    console.log("[Auth] Logging in user:", newUser.email);
    try {
      localStorage.setItem("adminToken", newToken);
      localStorage.setItem("adminUser", JSON.stringify(newUser));
      console.log("[Auth] Credentials saved to localStorage");
      dispatch({ type: "LOGIN", token: newToken, user: newUser });
    } catch (error) {
      console.error("[Auth] Failed to save credentials to localStorage:", error);
    }
  };

  const logout = () => {
    console.log("[Auth] Logging out");
    try {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      console.log("[Auth] Credentials removed from localStorage");
    } catch (error) {
      console.error("[Auth] Failed to remove credentials from localStorage:", error);
    }
    dispatch({ type: "LOGOUT" });
  };

  const value: AuthContextType = {
    ...state,
    isAuthenticated: !!state.token && !!state.user,
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
