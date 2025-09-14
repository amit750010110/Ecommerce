import React, { createContext, useContext, useState, useEffect } from "react";
import { useNotification } from "./NotificationContext";

const ComparisonContext = createContext();

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
};

export const ComparisonProvider = ({ children }) => {
  const [comparisonItems, setComparisonItems] = useState([]);
  const { addNotification } = useNotification();
  const MAX_COMPARISON_ITEMS = 4;

  // Load comparison from localStorage on mount
  useEffect(() => {
    const savedComparison = localStorage.getItem("comparison");
    if (savedComparison) {
      try {
        setComparisonItems(JSON.parse(savedComparison));
      } catch (error) {
        console.error("Error parsing comparison from localStorage:", error);
        localStorage.removeItem("comparison");
      }
    }
  }, []);

  // Save comparison to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("comparison", JSON.stringify(comparisonItems));
  }, [comparisonItems]);

  const addToComparison = (product) => {
    setComparisonItems((prev) => {
      const isAlreadyInComparison = prev.some((item) => item.id === product.id);
      if (isAlreadyInComparison) {
        addNotification(`${product.name} is already in comparison`, "info");
        return prev;
      }

      if (prev.length >= MAX_COMPARISON_ITEMS) {
        addNotification(
          `You can only compare up to ${MAX_COMPARISON_ITEMS} products`,
          "warning"
        );
        return prev;
      }

      addNotification(`${product.name} added to comparison!`, "success");
      return [...prev, product];
    });
  };

  const removeFromComparison = (productId) => {
    setComparisonItems((prev) => {
      const product = prev.find((item) => item.id === productId);
      if (product) {
        addNotification(`${product.name} removed from comparison`, "info");
      }
      return prev.filter((item) => item.id !== productId);
    });
  };

  const isInComparison = (productId) => {
    return comparisonItems.some((item) => item.id === productId);
  };

  const clearComparison = () => {
    setComparisonItems([]);
    addNotification("Comparison cleared", "info");
  };

  const toggleComparison = (product) => {
    if (isInComparison(product.id)) {
      removeFromComparison(product.id);
    } else {
      addToComparison(product);
    }
  };

  const getComparisonCount = () => {
    return comparisonItems.length;
  };

  const canAddToComparison = () => {
    return comparisonItems.length < MAX_COMPARISON_ITEMS;
  };

  const value = {
    comparisonItems,
    addToComparison,
    removeFromComparison,
    isInComparison,
    clearComparison,
    toggleComparison,
    getComparisonCount,
    canAddToComparison,
    maxItems: MAX_COMPARISON_ITEMS,
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};
