// HTTP utilities for the app
// Keeps a single HttpService instance to handle requests and optional mock data
import {
  API_BASE_URL,
  ACCESS_TOKEN_KEY,
  ERROR_MESSAGES,
} from '../utils/constants';

// Mock data for when backend is not available
const MOCK_DATA = {
  '/orders': { data: [] },
  '/users/me': {
    data: {
      id: 1,
      email: "user@example.com",
      firstName: "John",
      lastName: "Doe",
      roles: ["CUSTOMER"],
      phone: "555-123-4567",
      createdAt: "2023-01-15T10:30:00Z",
      updatedAt: "2023-09-14T14:45:00Z"
    }
  },
  '/cart': {
    data: {
      items: [],
      totalItems: 0,
      totalPrice: 0
    }
  },
  '/cart/items': {
    data: {
      items: [],
      totalItems: 0,
      totalPrice: 0
    }
  },
  '/users/addresses': { data: [] },
};

// To force using mock data even when backend might be available, set this to true
const USE_MOCK_DATA = true; // Set to true to ensure consistent behavior

// Create a simulated offline mode for testing
const simulateOffline = false; // Set to true to force network errors

class HttpService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.pendingRequests = new Map();
    this.mockDataEnabled = USE_MOCK_DATA;
  }

  // Enable or disable mock data
  setMockDataEnabled(enabled) {
    this.mockDataEnabled = enabled;
    console.log(`Mock data ${enabled ? 'enabled' : 'disabled'}`);
  }

  async request(endpoint, options = {}) {
    if (this.mockDataEnabled) {
      const baseEndpoint = endpoint.split('?')[0];
      console.log(`Using mock data for ${baseEndpoint}`);

      if (MOCK_DATA[baseEndpoint]) {
        // Add artificial delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 300));

        // Handle POST requests specifically for cart items
        if (options.method === 'POST' && baseEndpoint === '/cart/items') {
          try {
            const requestData = JSON.parse(options.body);
            console.log('Mock adding item to cart:', requestData);

            // Create a mock item
            const mockItem = {
              id: Date.now(),
              productId: requestData.productId,
              productName: `Product ${requestData.productId}`,
              productImage: `https://via.placeholder.com/100x100?text=Product${requestData.productId}`,
              price: 99.99,
              quantity: requestData.quantity
            };

            // Return a successful response
            return Promise.resolve({
              data: {
                items: [mockItem],
                totalItems: requestData.quantity,
                totalPrice: 99.99 * requestData.quantity
              }
            });
          } catch (error) {
            console.error('Error parsing request body:', error);
          }
        }

        return Promise.resolve({ ...MOCK_DATA[baseEndpoint] });
      }
    }

    const url = `${this.baseURL}${endpoint}`;
    const requestId = `${options.method || 'GET'}-${endpoint}`;
    console.log(`Making HTTP request: ${options.method || 'GET'} ${url}`);

    // Simulate offline mode for testing
    if (simulateOffline) {
      console.log('Simulating offline mode, using mock data');
      // Check if we have mock data for this endpoint
      const baseEndpoint = endpoint.split('?')[0];
      if (MOCK_DATA[baseEndpoint]) {
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
        return Promise.resolve({ ...MOCK_DATA[baseEndpoint] });
      } else {
        // Simulate network error
        await new Promise(resolve => setTimeout(resolve, 300));
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }
    }

    // Avoid duplicate requests
    if (this.pendingRequests.has(requestId)) {
      return this.pendingRequests.get(requestId);
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      console.log('Using access token for request:', accessToken.substring(0, 15) + '...');
    } else {
      console.log('No access token available for request');
    }

    const config = {
      ...options,
      headers,
      credentials: 'include'
    };

    const promise = fetch(url, config)
      .then(async (response) => {
        this.pendingRequests.delete(requestId);
        const contentType = response.headers.get('content-type');

        if (response.ok) {
          if (contentType && contentType.includes('application/json')) {
            return response.json();
          }
          return response.text();
        }

        if (response.status === 401) {
          // Token expired or invalid - redirect to login
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          window.dispatchEvent(new Event('authStateChanged'));
          throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
        }

        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to perform this action.');
        }

        if (response.status >= 500) {
          throw new Error(ERROR_MESSAGES.SERVER_ERROR);
        }

        // Try to get error message from response
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || ERROR_MESSAGES.UNKNOWN_ERROR);
        } catch {
          throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
        }
      })
      .catch((error) => {
        this.pendingRequests.delete(requestId);
        if (error.name === 'AbortError') {
          throw new Error('Request was cancelled');
        }
        if (error.message === 'Failed to fetch') {
          throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
        }
        throw error;
      });

    this.pendingRequests.set(requestId, promise);
    return promise;
  }

  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  postFormData(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {} // Don't set Content-Type for FormData, let browser set it
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  cancelPendingRequests() {
    this.pendingRequests.clear();
  }
}

export const httpService = new HttpService();