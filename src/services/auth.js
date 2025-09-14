import { httpService } from './http';
import { ACCESS_TOKEN_KEY, USER_DATA_KEY } from '../utils/constants';

export const authService = {
  // Login User
  async login(credentials) {
    try {
      try {
        // First try to login with backend
        const response = await httpService.post('/auth/login', credentials);

        if (response.data && response.data.accessToken) {
          // Store Access Token
          localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);

          // Store User Data
          const userData = {
            email: response.data.email,
            roles: response.data.roles,
          };

          localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

          // Dispatch event for context updates
          window.dispatchEvent(new Event('authStateChanged'));
        }

        return response;
      } catch (error) {
        console.log('Backend not available, using mock login');

        // Mock successful login data
        const mockLoginResponse = {
          data: {
            accessToken: "mock-jwt-token-123456789",
            email: credentials.email || "user@example.com",
            roles: ["CUSTOMER"],
            message: "Login successful (mock)"
          }
        };

        // Store mock access token
        localStorage.setItem(ACCESS_TOKEN_KEY, mockLoginResponse.data.accessToken);

        // Store mock user data
        const userData = {
          email: mockLoginResponse.data.email,
          roles: mockLoginResponse.data.roles,
        };

        localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

        // Dispatch event for context updates
        window.dispatchEvent(new Event('authStateChanged'));

        return mockLoginResponse;
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  // Register new user
  async register(userData) {
    try {
      console.log('Sending registration data:', userData);
      const response = await httpService.post('/auth/register', userData);

      if (response.data && response.data.accessToken) {
        // Store access token
        localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);

        // Store user data
        const userInfo = {
          email: response.data.email,
          roles: response.data.roles,
        };

        localStorage.setItem(USER_DATA_KEY, JSON.stringify(userInfo));

        // Dispatch event for context updates
        window.dispatchEvent(new Event('authStateChanged'));
      }

      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  // Logout
  async logout() {
    try {
      await httpService.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed: ', error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Always clear local storage
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);

      // Dispatch event for context updates
      window.dispatchEvent(new Event('authStateChanged'));

      if (typeof httpService.cancelPendingRequests === 'function') {
        httpService.cancelPendingRequests();
      }
    }
  },

  // Get Current user
  getCurrentUser() {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      const userData = localStorage.getItem(USER_DATA_KEY);

      if (!token || !userData) {
        console.log("No user data or token found in localStorage");
        return null;
      }

      const user = JSON.parse(userData);
      console.log("Current user from localStorage:", user);

      return user;
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem(USER_DATA_KEY); // Clear corrupted data
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const userData = this.getCurrentUser();

    if (!token || !userData) {
      console.log("User is not authenticated - missing token or user data");
      return false;
    }

    console.log("User is authenticated:", userData);
    // Additional checks can be added here (token expiration, etc.)
    return true;
  },

  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
};