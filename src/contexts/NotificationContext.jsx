import { Alarm } from "@mui/icons-material";
import { Alert, Snackbar } from "@mui/material";
import { createContext, useCallback, useContext, useReducer } from "react";

export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

const NotificationContext = createContext();

// Notification reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case "ADD_NOTIFICATION":
      return [...state, { ...action.payload, id: Date.now() }];

    case "REMOVE_NOTIFICATION":
      return state.filter((notification) => notification.id !== action.id);
    case "CLEAR_ALL":
      return [];
    default:
      return state;
  }
};

// Notification provider component

export const NotificationProvider = ({ children }) => {
  const [notification, dispatch] = useReducer(notificationReducer, []);

  // Add a new notification
  const addNotification = useCallback(
    (message, type = NOTIFICATION_TYPES.INFO, autoHideDuration = 6000) => {
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: { message, type, autoHideDuration },
      });
    },
    []
  );

  // Remove a notification
  const removeNotification = useCallback((id) => {
    dispatch({ type: "REMOVE_NOTIFICATION", id });
  }, []);

  const clearAllNotification = useCallback(() => {
    dispatch({ type: "CLEAR_ALL" });
  }, []);

  // Context Value

  const contextValue = {
    notification,
    addNotification,
    removeNotification,
    clearAllNotification,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}

      <Snackbar
        key={notification.id}
        open={true}
        autoHideDuration={notification.autoHideDuration}
        onClose={() => removeNotification(notification.id)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={notification.type}
          onClose={() => removeNotification(notification.id)}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
