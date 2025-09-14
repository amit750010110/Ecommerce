import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { userService } from "../services/user";
import { useAuth } from "./AuthContext";
import { useNotification } from "./NotificationContext";

// User context
const UserContext = createContext();

// User reducer actions
const USER_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_PROFILE: "SET_PROFILE",
  UPDATE_PROFILE: "UPDATE_PROFILE",
  SET_ERROR: "SET_ERROR",
  SET_ADDRESSES: "SET_ADDRESSES",
  ADD_ADDRESS: "ADD_ADDRESS",
  UPDATE_ADDRESS: "UPDATE_ADDRESS",
  REMOVE_ADDRESS: "REMOVE_ADDRESS",
};

// User reducer
const userReducer = (state, action) => {
  switch (action.type) {
    case USER_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case USER_ACTIONS.SET_PROFILE:
      return {
        ...state,
        profile: action.payload,
        isLoading: false,
        error: null,
      };
    case USER_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.payload,
        },
        isLoading: false,
        error: null,
      };
    case USER_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case USER_ACTIONS.SET_ADDRESSES:
      return {
        ...state,
        addresses: action.payload,
        isLoading: false,
        error: null,
      };
    case USER_ACTIONS.ADD_ADDRESS:
      return {
        ...state,
        addresses: [...state.addresses, action.payload],
      };
    case USER_ACTIONS.UPDATE_ADDRESS:
      return {
        ...state,
        addresses: state.addresses.map((address) =>
          address.id === action.payload.id ? action.payload : address
        ),
      };
    case USER_ACTIONS.REMOVE_ADDRESS:
      return {
        ...state,
        addresses: state.addresses.filter(
          (address) => address.id !== action.payload
        ),
      };
    default:
      return state;
  }
};

// Initial user state
const initialState = {
  profile: null,
  addresses: [],
  isLoading: false,
  error: null,
};

// User provider component
export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotification();

  // useEffect: user authentication change pe profile fetch karta hai
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User is authenticated, fetching profile");
      fetchProfile();
    } else {
      console.log("User is not authenticated, resetting state");
      // Reset state when user logs out
      dispatch({ type: USER_ACTIONS.SET_PROFILE, payload: null });
      dispatch({ type: USER_ACTIONS.SET_ADDRESSES, payload: [] });
    }
  }, [isAuthenticated]);

  // useCallback: fetchProfile function ko memoize karta hai
  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) {
      console.log("Not authenticated, skipping profile fetch");
      return;
    }

    dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
    console.log("Fetching user profile...");

    try {
      const response = await userService.getProfile();
      console.log("Profile data received:", response.data);

      if (response.data) {
        dispatch({ type: USER_ACTIONS.SET_PROFILE, payload: response.data });
      } else {
        console.error("Received empty profile data");
        dispatch({
          type: USER_ACTIONS.SET_ERROR,
          payload: "No profile data received from server",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      dispatch({ type: USER_ACTIONS.SET_ERROR, payload: error.message });
      addNotification("Failed to load profile", "error");
    }
  }, [isAuthenticated, addNotification]);

  // useCallback: updateProfile function ko memoize karta hai
  const updateProfile = useCallback(
    async (profileData) => {
      dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });

      try {
        const response = await userService.updateProfile(profileData);
        dispatch({ type: USER_ACTIONS.UPDATE_PROFILE, payload: response.data });

        addNotification("Profile updated successfully", "success");
        return response.data;
      } catch (error) {
        dispatch({ type: USER_ACTIONS.SET_ERROR, payload: error.message });
        addNotification("Failed to update profile", "error");
        throw error;
      }
    },
    [addNotification]
  );

  // useMemo: derived values ko calculate karta hai
  const fullName = useMemo(() => {
    if (!state.profile) return "";
    return `${state.profile.firstName} ${state.profile.lastName}`;
  }, [state.profile]);

  const isAdmin = useMemo(() => {
    return state.profile?.roles?.includes("ADMIN") || false;
  }, [state.profile]);

  // Context value
  const contextValue = useMemo(
    () => ({
      ...state,
      fullName,
      isAdmin,
      fetchProfile,
      updateProfile,
    }),
    [state, fullName, isAdmin, fetchProfile, updateProfile]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

// Custom hook to use user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
