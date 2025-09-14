import React from "react";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline, GlobalStyles } from "@mui/material";
import theme from "./theme";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { CartProvider } from "./contexts/CartContext";
import { CatalogProvider } from "./contexts/CatalogContext";
import { OrderProvider } from "./contexts/OrderContext";
import { UserProvider } from "./contexts/UserContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { ComparisonProvider } from "./contexts/ComparisonContext";
import AppRoutes from "./routes";

// Global styles for better UX
const globalStyles = (
  <GlobalStyles
    styles={{
      "*": {
        boxSizing: "border-box",
      },
      html: {
        scrollBehavior: "smooth",
      },
      body: {
        margin: 0,
        padding: 0,
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      },
      "#root": {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      },
      // Custom scrollbar styles
      "*::-webkit-scrollbar": {
        width: "8px",
        height: "8px",
      },
      "*::-webkit-scrollbar-track": {
        backgroundColor: "#f1f5f9",
        borderRadius: "4px",
      },
      "*::-webkit-scrollbar-thumb": {
        backgroundColor: "#cbd5e1",
        borderRadius: "4px",
        "&:hover": {
          backgroundColor: "#94a3b8",
        },
      },
      // Loading animation keyframes
      "@keyframes pulse": {
        "0%": {
          opacity: 1,
        },
        "50%": {
          opacity: 0.5,
        },
        "100%": {
          opacity: 1,
        },
      },
      // Smooth transitions for all interactive elements
      "button, a, input, textarea, select": {
        transition: "all 0.2s ease-in-out",
      },
    }}
  />
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      <NotificationProvider>
        <AuthProvider>
          <UserProvider>
            <CatalogProvider>
              <CartProvider>
                <WishlistProvider>
                  <ComparisonProvider>
                    <OrderProvider>
                      <Router>
                        <div className="App">
                          <AppRoutes />
                        </div>
                      </Router>
                    </OrderProvider>
                  </ComparisonProvider>
                </WishlistProvider>
              </CartProvider>
            </CatalogProvider>
          </UserProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
