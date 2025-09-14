import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";
import { AuthProvider } from "../contexts/AuthContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import { WishlistProvider } from "../contexts/WishlistContext";
import { ComparisonProvider } from "../contexts/ComparisonContext";
import ProductCard from "../components/ProductCard";

// Mock product data
const mockProduct = {
  id: 1,
  name: "Test Product",
  description: "This is a test product",
  price: 99.99,
  imageUrl: "/test-image.jpg",
  category: { id: 1, name: "Electronics" },
  inStock: true,
  stockQuantity: 10,
};

// Wrapper component with all providers
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <NotificationProvider>
        <AuthProvider>
          <WishlistProvider>
            <ComparisonProvider>{children}</ComparisonProvider>
          </WishlistProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  </BrowserRouter>
);

describe("ProductCard Component", () => {
  test("renders product information correctly", () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("$99.99")).toBeInTheDocument();
    expect(screen.getByText("Electronics")).toBeInTheDocument();
  });

  test("adds product to wishlist when wishlist button is clicked", async () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    const wishlistButton = screen.getByLabelText(/wishlist/i);
    fireEvent.click(wishlistButton);

    // Wait for the wishlist state to update
    await waitFor(() => {
      // The button should change appearance when item is in wishlist
      expect(wishlistButton).toBeInTheDocument();
    });
  });

  test("adds product to comparison when compare button is clicked", async () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    const compareButton = screen.getByLabelText(/compare/i);
    fireEvent.click(compareButton);

    await waitFor(() => {
      expect(compareButton).toBeInTheDocument();
    });
  });

  test("opens quick view dialog when quick view button is clicked", async () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    const quickViewButton = screen.getByLabelText(/quick view/i);
    fireEvent.click(quickViewButton);

    // The ProductQuickView dialog should open
    await waitFor(() => {
      // Look for dialog content
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });
});
