import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import {
  ACCESS_TOKEN_KEY,
  USER_DATA_KEY,
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION,
} from "../utils/constants";
import { authService } from "../services/auth";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useNotification } from "./NotificationContext";

// -------------------------------------------------------

// Neeche jo imports hain unka role:
// - createContext/useContext: Context banane aur use karne ke liye
// - useReducer: complex auth state ko manage karne ke liye (saare state transitions centralize karne ke liye)
// - useEffect: side-effects (localStorage sync, event listeners)
// - useCallback: functions ko memoize karne ke liye (avoid unnecessary re-creations)
// - authService: backend API wrapper for login/logout/getCurrentUser
// - useLocalStorage: custom hook jo value ko localStorage ke saath sync karta hai
// - useNotification: notification context se messages bhejne ke liye
// step-by-step samajh aa jaye ki kaunsa hook/kya karta hai.
// -------------------------------------------------------

// Auth context
const AuthContext = createContext();

// Auth reducer actions
const AUTH_ACTIONS = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  SET_USER: "SET_USER",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        error: null,
        loginAttempts: 0,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload.error,
        loginAttempts: action.payload.loginAttempts,
        lockoutUntil: action.payload.lockoutUntil,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null,
        loginAttempts: 0,
        lockoutUntil: null,
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Initial auth state
const initialState = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  loginAttempts: 0,
  lockoutUntil: null,
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [storedLoginAttempts, setStoredLoginAttempts] = useLocalStorage(
    "loginAttempts",
    0
  );
  const [storedLockoutUntil, setStoredLockoutUntil] = useLocalStorage(
    "lockoutUntil",
    null
  );
  const { addNotification } = useNotification();

  // Initialize state from localStorage
  useEffect(() => {
    const userData = authService.getCurrentUser();

    console.log(
      "AuthContext initialized with user data:",
      userData,
      "isAuthenticated:",
      !!userData
    );

    dispatch({
      type: AUTH_ACTIONS.SET_USER,
      payload: { user: userData },
    });

    // Set login attempts and lockout from storage
    if (storedLoginAttempts > 0) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: {
          error: "Invalid credentials",
          loginAttempts: storedLoginAttempts,
          lockoutUntil: storedLockoutUntil,
        },
      });
    }
  }, [storedLoginAttempts, storedLockoutUntil]);

  // Listen for auth state changes across tabs
  useEffect(() => {
    const handleAuthStateChange = () => {
      const userData = authService.getCurrentUser();
      console.log("Auth state changed event received, user data:", userData);

      dispatch({
        type: AUTH_ACTIONS.SET_USER,
        payload: { user: userData },
      });
    };

    window.addEventListener("authStateChanged", handleAuthStateChange);
    return () =>
      window.removeEventListener("authStateChanged", handleAuthStateChange);
  }, []);

  // Login function
  const login = useCallback(
    async (credentials) => {
      // Check if account is locked
      const now = Date.now();
      if (state.lockoutUntil && now < state.lockoutUntil) {
        const minutesLeft = Math.ceil((state.lockoutUntil - now) / 60000);
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: {
            error: `Account locked. Try again in ${minutesLeft} minute${
              minutesLeft > 1 ? "s" : ""
            }.`,
            loginAttempts: state.loginAttempts,
            lockoutUntil: state.lockoutUntil,
          },
        });
        return;
      }

      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      try {
        const response = await authService.login(credentials);

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: response.data },
        });

        // Reset login attempts on success
        setStoredLoginAttempts(0);
        setStoredLockoutUntil(null);

        addNotification("Login successful!", "success");
      } catch (error) {
        const newAttempts = state.loginAttempts + 1;
        let lockoutUntil = null;

        // Check if we should lock the account
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          lockoutUntil = now + LOCKOUT_DURATION;
          setStoredLockoutUntil(lockoutUntil);
        }

        setStoredLoginAttempts(newAttempts);

        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: {
            error: error.message,
            loginAttempts: newAttempts,
            lockoutUntil,
          },
        });

        addNotification(error.message || "Login failed", "error");
      }
    },
    [
      state.loginAttempts,
      state.lockoutUntil,
      addNotification,
      setStoredLoginAttempts,
      setStoredLockoutUntil,
    ]
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      setStoredLoginAttempts(0);
      setStoredLockoutUntil(null);
      addNotification("Logged out successfully", "info");

      // Navigate to catalog page after logout
      window.location.href = "/";
    }
  }, [addNotification, setStoredLoginAttempts, setStoredLockoutUntil]);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Check if user has role
  const hasRole = useCallback(
    (role) => {
      return state.user && state.user.roles && state.user.roles.includes(role);
    },
    [state.user]
  );

  // Context value
  const contextValue = {
    ...state,
    login,
    logout,
    clearError,
    hasRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
