// This file contains utility functions for testing authentication
// and profile functionality without a backend
import { ACCESS_TOKEN_KEY, USER_DATA_KEY } from './constants';

export const authTestUtils = {
  // Manually set user authentication data for testing
  setMockAuthentication(userData = null) {
    // Default test user if none provided
    const testUser = userData || {
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      roles: ["CUSTOMER"]
    };

    // Store mock token
    localStorage.setItem(ACCESS_TOKEN_KEY, 'mock-jwt-token-for-testing');

    // Store mock user data
    localStorage.setItem(USER_DATA_KEY, JSON.stringify({
      email: testUser.email,
      roles: testUser.roles
    }));

    // Trigger auth state change event
    window.dispatchEvent(new Event('authStateChanged'));

    console.log('Mock authentication set:', testUser);
    return testUser;
  },

  // Clear authentication data
  clearAuthentication() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    window.dispatchEvent(new Event('authStateChanged'));
    console.log('Authentication cleared');
  },

  // Get current authentication status
  checkAuthStatus() {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const userData = localStorage.getItem(USER_DATA_KEY);

    console.log('Current auth status:', {
      hasToken: !!token,
      userData: userData ? JSON.parse(userData) : null
    });

    return {
      isAuthenticated: !!token && !!userData,
      user: userData ? JSON.parse(userData) : null
    };
  }
};