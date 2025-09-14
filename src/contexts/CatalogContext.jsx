import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  useEffect,
} from "react";
import { useNotification } from "./NotificationContext";
import { catalogService } from "../services/catalog";

const CatalogContext = createContext();

// Catalog reducer actions
const CATALOG_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_PRODUCTS: "SET_PRODUCTS",
  SET_FILTERS: "SET_FILTERS",
  SET_PAGINATION: "SET_PAGINATION",
  SET_ERROR: "SET_ERROR",
  CLEAR_FILTERS: "CLEAR_FILTERS",
};

// Catalog reducer

const catalogReducer = (state, action) => {
  switch (action.type) {
    case CATALOG_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case CATALOG_ACTIONS.SET_PRODUCTS:
      return {
        ...state,
        products: action.payload.products,
        pagination: action.payload.pagination,
        isLoading: false,
        error: null,
      };
    case CATALOG_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
        pagination: {
          ...state.pagination,
          page: 0, // Reset to first page when filters change
        },
      };

    case CATALOG_ACTIONS.SET_PAGINATION:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          ...action.payload,
        },
      };
    case CATALOG_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        products: [],
      };
    case CATALOG_ACTIONS.CLEAR_FILTERS:
      return {
        ...state,
        filters: {
          search: "",
          categoryIds: [],
          minPrice: null,
          maxPrice: null,
          sort: {
            by: "name",
            direction: "asc",
          },
        },
      };
    default:
      return state;
  }
};

// Initial catalog state
const initialState = {
  products: [],
  filters: {
    search: "",
    categoryIds: [],
    minPrice: null,
    maxPrice: null,
    sort: {
      by: "name",
      direction: "asc",
    },
  },
  pagination: {
    page: 0,
    size: 12,
    totalElements: 0,
    totalPages: 0,
    isLast: true,
  },
  isLoading: false,
  error: null,
};

// Catalog provider component
export const CatalogProvider = ({ children }) => {
  const [state, dispatch] = useReducer(catalogReducer, initialState);
  const { addNotification } = useNotification();

  // Use a ref to track the latest state
  const stateRef = useRef(state);

  // Update the ref whenever state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const fetchProducts = useCallback(async () => {
    dispatch({ type: CATALOG_ACTIONS.SET_LOADING, payload: true });
    try {
      // Access the latest state using the ref
      const latestState = stateRef.current;
      console.log("Fetching products with filters:", latestState.filters);

      // Create a properly formatted request object
      const requestParams = {
        search: latestState.filters.search,
        categoryIds: latestState.filters.categoryIds,
        minPrice: latestState.filters.minPrice,
        maxPrice: latestState.filters.maxPrice,
        minRating: latestState.filters.minRating,
        inStockOnly: latestState.filters.inStockOnly,
        page: latestState.pagination.page,
        size: latestState.pagination.size,
        sortBy: latestState.filters.sort?.by || "name",
        sortDir: latestState.filters.sort?.direction || "asc",
      };

      console.log("Requesting products with params:", requestParams);
      const response = await catalogService.getProducts(requestParams);
      console.log("Products response:", response);
      dispatch({
        type: CATALOG_ACTIONS.SET_PRODUCTS,
        payload: {
          products: response.data.content,
          pagination: {
            page: response.data.number,
            size: response.data.size,
            totalElements: response.data.totalElements,
            totalPages: response.data.totalPages,
            isLast: response.data.last,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      dispatch({ type: CATALOG_ACTIONS.SET_ERROR, payload: error.message });
      addNotification("Failed to load products", "error");
    }
  }, [addNotification]);

  const updateFilters = useCallback((newFilters) => {
    dispatch({
      type: CATALOG_ACTIONS.SET_FILTERS,
      payload: newFilters,
    });
  }, []);
  const updateSort = useCallback((sortBy, sortDirection) => {
    dispatch({
      type: CATALOG_ACTIONS.SET_FILTERS,
      payload: { sort: { by: sortBy, direction: sortDirection } },
    });
  }, []);

  // useCallback: updatePagination function ko memoize karte hain
  const updatePagination = useCallback((newPagination) => {
    dispatch({
      type: CATALOG_ACTIONS.SET_PAGINATION,
      payload: newPagination,
    });
  }, []);

  // useCallback: clearFilters function ko memoize karte hain
  const clearFilters = useCallback(() => {
    dispatch({ type: CATALOG_ACTIONS.CLEAR_FILTERS });
  }, []);

  // useMemo: derived values ko calculate karte hain (performance optimization)
  const hasActiveFilters = useMemo(() => {
    return (
      state.filters.search !== "" ||
      state.filters.categoryIds.length > 0 ||
      state.filters.minPrice !== null ||
      state.filters.maxPrice !== null
    );
  }, [
    state.filters.search,
    state.filters.categoryIds,
    state.filters.minPrice,
    state.filters.maxPrice,
  ]);

  // useMemo: filtered products count (performance optimization)
  const filteredProductsCount = useMemo(() => {
    return state.pagination.totalElements;
  }, [state.pagination.totalElements]);

  const contextValue = useMemo(
    () => ({
      ...state,
      fetchProducts,
      updateFilters,
      updateSort,
      updatePagination,
      clearFilters,
      hasActiveFilters,
      filteredProductsCount,
    }),
    [
      state,
      fetchProducts,
      updateFilters,
      updateSort,
      updatePagination,
      clearFilters,
      hasActiveFilters,
      filteredProductsCount,
    ]
  );
  return (
    <CatalogContext.Provider value={contextValue}>
      {children}
    </CatalogContext.Provider>
  );
};

// Custom hook to use catalog context
export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog must be used within a CatalogProvider");
  }
  return context;
};
