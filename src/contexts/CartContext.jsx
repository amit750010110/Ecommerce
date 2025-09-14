import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { useNotification } from "./NotificationContext";
import { useAuth } from "./AuthContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useOptimisticUpdate } from "../hooks/useOptimisticUpdate";
import { cartService } from "../services/cart";

const CartContext = createContext();

// Cart reducer actions

const CART_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_CART: "SET_CART",
  ADD_ITEM: "ADD_ITEM",
  UPDATE_ITEM: "UPDATE_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  CLEAR_CART: "CLEAR_CART",
  SET_ERROR: "SET_ERROR",
  SYNC_CART: "SYNC_CART",
};

// Cart reducer

const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload, // action.payload is just the data carried by the action.
      };

    case CART_ACTIONS.SET_CART:
      return {
        ...state,
        items: action.payload.items || [],
        total: action.payload.totalPrice || 0,
        itemCount: action.payload.totalItems || 0,
        isLoading: false,
        error: null,
      };

    case CART_ACTIONS.ADD_ITEM: {
      console.log("ADD_ITEM action with payload:", action.payload);
      // Check if item already exists in cart - using the productId for comparison
      const existingItemIndex = state.items.findIndex(
        (item) => item.productId === action.payload.productId
      );

      console.log("Existing item index:", existingItemIndex);
      let newItems;

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        console.log("Updating existing item");
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? {
                ...item,
                quantity: item.quantity + action.payload.quantity,
              }
            : item
        );
      } else {
        // Add new item to cart
        console.log("Adding new item");
        newItems = [...state.items, action.payload];
      }

      const newItemCount = newItems.reduce(
        (total, item) => total + item.quantity,
        0
      );
      const newTotal = newItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      console.log("New cart state:", {
        items: newItems,
        itemCount: newItemCount,
        total: newTotal,
      });

      return {
        ...state,
        items: newItems,
        itemCount: newItemCount,
        total: newTotal,
      };
    }

    case CART_ACTIONS.UPDATE_ITEM: {
      const updatedItems = state.items
        .map((item) =>
          item.id === action.payload.itemId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
        .filter((item) => item.quantity > 0); // Remove items with quantity 0

      return {
        ...state,
        items: updatedItems,
        itemCount: updatedItems.reduce(
          (total, item) => total + item.quantity,
          0
        ),
        total: updatedItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
      };
    }
    case CART_ACTIONS.REMOVE_ITEM: {
      const filteredItems = state.items.filter(
        (item) => item.id !== action.payload
      );

      return {
        ...state,
        items: filteredItems,
        itemCount: filteredItems.reduce(
          (total, item) => total + item.quantity,
          0
        ),
        total: filteredItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
      };
    }
    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        itemCount: 0,
        total: 0,
      };
    case CART_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case CART_ACTIONS.SYNC_CART:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

// Initial cart state
const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
  error: null,
};

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [localCart, setLocalCart] = useLocalStorage("cart", initialState);
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotification();

  // useCallback : fetchCart function ko memoize karta hai
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;

    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

    try {
      const response = await cartService.getCart();

      // Transform backend data to match frontend expectations
      const transformedCart = {
        ...response.data,
        items:
          response.data.items?.map((item) => ({
            ...item,
            name: item.productName,
            image: item.productImage,
          })) || [],
      };

      dispatch({ type: CART_ACTIONS.SET_CART, payload: transformedCart });
    } catch (error) {
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      addNotification("Failed to load cart", "error");
    }
  }, [isAuthenticated, addNotification]);

  //useEffect : user authentication change pe cart  sync karta hai
  useEffect(() => {
    console.log("CartContext: Authentication status changed:", isAuthenticated);

    if (isAuthenticated) {
      console.log("CartContext: Fetching cart for authenticated user");
      fetchCart();
    } else {
      // User logged out hai , local cart fetch kro
      console.log("CartContext: Using local cart for unauthenticated user");
      dispatch({ type: CART_ACTIONS.SYNC_CART, payload: localCart });
    }
  }, [isAuthenticated, fetchCart, localCart]);
  // useOptimisticUpdate: addItem function ke liye optimistic update implement karta hai
  const optimisticAddItem = useOptimisticUpdate(
    // Update function - immediately UI update karta hai
    (product, quantity) => {
      console.log("Optimistic update with product:", product);

      // Ensure we have a valid product object with required fields
      if (!product || !product.id) {
        console.error("Invalid product object:", product);
        addNotification("Error adding item - invalid product", "error");
        return;
      }

      // Create a consistent item object for the cart
      const cartItem = {
        id: `item_${Date.now()}`, // Create a unique cart item ID
        productId: product.id,
        name: product.name || "Unknown Product", // Frontend expects 'name'
        image: product.images?.[0]?.url || product.imageUrl, // Frontend expects 'image'
        price: product.price || 0,
        quantity: parseInt(quantity, 10) || 1,
      };

      console.log("Dispatching ADD_ITEM with cart item:", cartItem);

      dispatch({
        type: CART_ACTIONS.ADD_ITEM,
        payload: cartItem,
      });
    },
    // Rollback function - agar API call fail hoti hai to previous state restore karta hai
    () => {
      return { ...state }; // Current state ko save karta hai
    }
  );

  // useCallback: addItem function ko memoize karta hai
  const addItem = useCallback(
    async (product, quantity = 1) => {
      try {
        console.log("Adding to cart:", product, "quantity:", quantity);

        // Validate product object
        if (!product || !product.id) {
          console.error("Invalid product object:", product);
          addNotification("Invalid product data", "error");
          return;
        }

        // Ensure quantity is a valid number
        const parsedQuantity = parseInt(quantity, 10) || 1;

        // Optimistic update - UI immediately update ho jata hai
        await optimisticAddItem(product, parsedQuantity);

        if (isAuthenticated) {
          try {
            // Server ko update bhejo background mein
            const response = await cartService.addItem(
              product.id,
              parsedQuantity
            );
            console.log("Server response after adding item:", response);

            // Transform and update with server response if available
            if (response && response.items) {
              const transformedCart = {
                ...response,
                items:
                  response.items?.map((item) => ({
                    ...item,
                    name: item.productName || item.name,
                    image: item.productImage || item.image,
                  })) || [],
              };

              dispatch({
                type: CART_ACTIONS.SET_CART,
                payload: transformedCart,
              });
            }
          } catch (error) {
            console.error("Add to cart error:", error);
            // Continue with optimistic update even if server update fails
            addNotification("Item added to cart (offline mode)", "info");
          }
        } else {
          // User logged out hai, local storage mein save karo
          setLocalCart({ ...state });
        }

        addNotification(`${product.name} added to cart`, "success");
      } catch (error) {
        console.error("Add to cart error:", error);
        addNotification("Failed to add item to cart", "error");
      }
    },
    [isAuthenticated, optimisticAddItem, addNotification, setLocalCart, state]
  );

  // useCallback: updateItemQuantity function ko memoize karta hai
  const updateItemQuantity = useCallback(
    async (itemId, quantity) => {
      try {
        console.log(
          `Updating item quantity for item ID ${itemId} to ${quantity}`
        );

        // Check if the item exists in the cart
        const existingItem = state.items.find((item) => item.id === itemId);
        if (!existingItem) {
          console.error(`Item with id ${itemId} not found in cart`);
          addNotification("Failed to update item - not found in cart", "error");
          return;
        }

        // Optimistic update
        dispatch({
          type: CART_ACTIONS.UPDATE_ITEM,
          payload: { itemId, quantity },
        });

        if (isAuthenticated) {
          const response = await cartService.updateItemQuantity(
            existingItem.productId, // Use the productId for API calls
            quantity
          );

          // Transform and update with server response
          const transformedCart = {
            ...response.data,
            items:
              response.data.items?.map((item) => ({
                ...item,
                name: item.productName,
                image: item.productImage,
              })) || [],
          };

          dispatch({ type: CART_ACTIONS.SET_CART, payload: transformedCart });
        } else {
          setLocalCart({ ...state });
        }
      } catch (error) {
        addNotification("Failed to update item quantity", "error");
        console.error("Update quantity error:", error);
        await fetchCart(); // Sync with server on error
      }
    },
    [isAuthenticated, fetchCart, addNotification, setLocalCart, state]
  );

  // useCallback: removeItem function ko memoize karta hai
  const removeItem = useCallback(
    async (itemId) => {
      try {
        console.log(`Removing item with ID ${itemId} from cart`);

        // Check if the item exists in the cart
        const existingItem = state.items.find((item) => item.id === itemId);
        if (!existingItem) {
          console.error(`Item with id ${itemId} not found in cart`);
          addNotification("Failed to remove item - not found in cart", "error");
          return;
        }

        // Optimistic update
        dispatch({
          type: CART_ACTIONS.REMOVE_ITEM,
          payload: itemId,
        });

        if (isAuthenticated) {
          const response = await cartService.removeItem(existingItem.productId); // Use productId for API calls

          // Transform and update with server response
          const transformedCart = {
            ...response.data,
            items:
              response.data.items?.map((item) => ({
                ...item,
                name: item.productName,
                image: item.productImage,
              })) || [],
          };

          dispatch({ type: CART_ACTIONS.SET_CART, payload: transformedCart });
        } else {
          setLocalCart({ ...state });
        }

        addNotification("Item removed from cart", "info");
      } catch (error) {
        addNotification("Failed to remove item from cart", "error");
        console.error("Remove item error:", error);
        await fetchCart(); // Sync with server on error
      }
    },
    [isAuthenticated, fetchCart, addNotification, setLocalCart, state]
  );

  // useCallback: clearCart function ko memoize karta hai
  const clearCart = useCallback(async () => {
    try {
      // Optimistic update
      dispatch({ type: CART_ACTIONS.CLEAR_CART });

      if (isAuthenticated) {
        const response = await cartService.clearCart();

        // Transform and update with server response
        const transformedCart = {
          ...response.data,
          items:
            response.data.items?.map((item) => ({
              ...item,
              name: item.productName,
              image: item.productImage,
            })) || [],
        };

        dispatch({ type: CART_ACTIONS.SET_CART, payload: transformedCart });
      } else {
        setLocalCart(initialState);
      }

      addNotification("Cart cleared", "info");
    } catch (error) {
      addNotification("Failed to clear cart", "error");
      console.error("Clear cart error:", error);
      await fetchCart(); // Sync with server on error
    }
  }, [isAuthenticated, fetchCart, addNotification, setLocalCart]);

  // useMemo: derived values ko calculate karta hai
  const hasItems = useMemo(() => state.itemCount > 0, [state.itemCount]);
  const itemCount = useMemo(() => state.itemCount, [state.itemCount]);
  const total = useMemo(() => state.total, [state.total]);
  const items = useMemo(() => state.items, [state.items]);
  // Context value
  const contextValue = useMemo(
    () => ({
      ...state,
      hasItems,
      itemCount,
      total,
      items,
      addItem,
      updateItemQuantity,
      removeItem,
      clearCart,
      fetchCart,
    }),
    [
      state,
      hasItems,
      itemCount,
      total,
      items,
      addItem,
      updateItemQuantity,
      removeItem,
      clearCart,
      fetchCart,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
