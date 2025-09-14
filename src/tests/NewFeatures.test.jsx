import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";
import { NotificationProvider } from "../contexts/NotificationContext";
import { WishlistProvider } from "../contexts/WishlistContext";
import { ComparisonProvider } from "../contexts/ComparisonContext";
import Wishlist from "../pages/Wishlist";
import ProductComparison from "../pages/ProductComparison";

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <NotificationProvider>
        <WishlistProvider>
          <ComparisonProvider>{children}</ComparisonProvider>
        </WishlistProvider>
      </NotificationProvider>
    </ThemeProvider>
  </BrowserRouter>
);

describe("New Features", () => {
  test("renders empty wishlist correctly", () => {
    render(
      <TestWrapper>
        <Wishlist />
      </TestWrapper>
    );

    expect(screen.getByText(/your wishlist is empty/i)).toBeInTheDocument();
    expect(screen.getByText(/start shopping/i)).toBeInTheDocument();
  });

  test("renders empty comparison correctly", () => {
    render(
      <TestWrapper>
        <ProductComparison />
      </TestWrapper>
    );

    expect(screen.getByText(/no products to compare/i)).toBeInTheDocument();
    expect(screen.getByText(/browse products/i)).toBeInTheDocument();
  });
});
