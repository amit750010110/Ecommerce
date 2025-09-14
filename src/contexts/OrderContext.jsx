import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { orderService } from "../services/order";
import { useCart } from "./CartContext";
import { useNotification } from "./NotificationContext";
import { useAuth } from "./AuthContext";
// Order context
const OrderContext = createContext();

// Order reducer actions
const ORDER_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ORDERS: "SET_ORDERS",
  SET_ORDER: "SET_ORDER",
  ADD_ORDER: "ADD_ORDER",
  UPDATE_ORDER: "UPDATE_ORDER",
  SET_ERROR: "SET_ERROR",
  SET_CHECKOUT_STEP: "SET_CHECKOUT_STEP",
  SET_SHIPPING_ADDRESS: "SET_SHIPPING_ADDRESS",
  SET_BILLING_ADDRESS: "SET_BILLING_ADDRESS",
  SET_PAYMENT_METHOD: "SET_PAYMENT_METHOD",
};

// Order reducer
const orderReducer = (state, action) => {
  switch (action.type) {
    case ORDER_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case ORDER_ACTIONS.SET_ORDERS:
      return {
        ...state,
        orders: action.payload,
        isLoading: false,
        error: null,
      };
    case ORDER_ACTIONS.SET_ORDER:
      return {
        ...state,
        currentOrder: action.payload,
        isLoading: false,
        error: null,
      };
    case ORDER_ACTIONS.ADD_ORDER:
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        currentOrder: action.payload,
        isLoading: false,
        error: null,
      };
    case ORDER_ACTIONS.UPDATE_ORDER:
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.payload.id ? action.payload : order
        ),
        currentOrder:
          state.currentOrder?.id === action.payload.id
            ? action.payload
            : state.currentOrder,
        isLoading: false,
        error: null,
      };
    case ORDER_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case ORDER_ACTIONS.SET_CHECKOUT_STEP:
      return {
        ...state,
        checkoutStep: action.payload,
      };
    case ORDER_ACTIONS.SET_SHIPPING_ADDRESS:
      return {
        ...state,
        shippingAddress: action.payload,
      };
    case ORDER_ACTIONS.SET_BILLING_ADDRESS:
      return {
        ...state,
        billingAddress: action.payload,
      };
    case ORDER_ACTIONS.SET_PAYMENT_METHOD:
      return {
        ...state,
        paymentMethod: action.payload,
      };
    default:
      return state;
  }
};

// Initial order state
const initialState = {
  orders: [],
  currentOrder: null,
  checkoutStep: 0,
  shippingAddress: null,
  billingAddress: null,
  paymentMethod: null,
  isLoading: false,
  error: null,
};

// Order provider component
export const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotification();
  const { clearCart } = useCart();

  // useEffect: user authentication change pe orders fetch karta hai
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  // useCallback: fetchOrders function ko memoize karta hai
  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) return;

    dispatch({ type: ORDER_ACTIONS.SET_LOADING, payload: true });

    try {
      const response = await orderService.getUserOrders();
      // Extract the orders array from the paginated response
      const orders = response.data.content || [];
      console.log("Fetched orders:", orders);
      dispatch({ type: ORDER_ACTIONS.SET_ORDERS, payload: orders });
    } catch (error) {
      dispatch({ type: ORDER_ACTIONS.SET_ERROR, payload: error.message });
      addNotification("Failed to load orders", "error");
    }
  }, [isAuthenticated, addNotification]);

  // useCallback: createOrder function ko memoize karta hai
  const createOrder = useCallback(
    async (orderData) => {
      dispatch({ type: ORDER_ACTIONS.SET_LOADING, payload: true });

      try {
        const response = await orderService.createOrder(orderData);
        dispatch({ type: ORDER_ACTIONS.ADD_ORDER, payload: response.data });

        // Clear cart after successful order
        await clearCart();

        addNotification("Order placed successfully!", "success");
        return response.data;
      } catch (error) {
        dispatch({ type: ORDER_ACTIONS.SET_ERROR, payload: error.message });
        addNotification("Failed to place order", "error");
        throw error;
      }
    },
    [clearCart, addNotification]
  );

  // useCallback: cancelOrder function ko memoize karta hai
  const cancelOrder = useCallback(
    async (orderId) => {
      try {
        const response = await orderService.cancelOrder(orderId);
        dispatch({ type: ORDER_ACTIONS.UPDATE_ORDER, payload: response.data });

        addNotification("Order cancelled successfully", "info");
      } catch (error) {
        addNotification("Failed to cancel order", "error");
        throw error;
      }
    },
    [addNotification]
  );

  // useCallback: checkout step management functions ko memoize karta hai
  const setCheckoutStep = useCallback((step) => {
    dispatch({ type: ORDER_ACTIONS.SET_CHECKOUT_STEP, payload: step });
  }, []);

  const setShippingAddress = useCallback((address) => {
    dispatch({ type: ORDER_ACTIONS.SET_SHIPPING_ADDRESS, payload: address });
  }, []);

  const setBillingAddress = useCallback((address) => {
    dispatch({ type: ORDER_ACTIONS.SET_BILLING_ADDRESS, payload: address });
  }, []);

  const setPaymentMethod = useCallback((method) => {
    dispatch({ type: ORDER_ACTIONS.SET_PAYMENT_METHOD, payload: method });
  }, []);

  // useMemo: derived values ko calculate karta hai
  const hasOrders = useMemo(() => state.orders.length > 0, [state.orders]);
  const orders = useMemo(() => state.orders, [state.orders]);

  // Context value
  const contextValue = useMemo(
    () => ({
      ...state,
      hasOrders,
      orders,
      fetchOrders,
      createOrder,
      cancelOrder,
      setCheckoutStep,
      setShippingAddress,
      setBillingAddress,
      setPaymentMethod,
    }),
    [
      state,
      hasOrders,
      orders,
      fetchOrders,
      createOrder,
      cancelOrder,
      setCheckoutStep,
      setShippingAddress,
      setBillingAddress,
      setPaymentMethod,
    ]
  );

  return (
    <OrderContext.Provider value={contextValue}>
      {children}
    </OrderContext.Provider>
  );
};

// Custom hook to use order context
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
};
