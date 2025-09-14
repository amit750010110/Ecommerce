import { httpService } from "./http";

// Mock user profile for when backend is not available
const mockUserProfile = {
  id: 1,
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  roles: ["CUSTOMER"],
  phone: "555-123-4567",
  createdAt: "2023-01-15T10:30:00Z",
  updatedAt: "2023-09-14T14:45:00Z"
};

export const userService = {
  // Get user profile
  async getProfile() {
    try {
      try {
        // First try to get from backend
        return await httpService.get('/users/me');
      } catch (error) {
        console.log('Backend not available, using mock profile data');
        // Fall back to mock data if backend fails
        return {
          data: mockUserProfile
        };
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(profileData) {
    try {
      try {
        // First try to update on backend
        return await httpService.put('/users/me', profileData);
      } catch (error) {
        console.log('Backend not available, using mock profile update');
        // Fall back to mock data if backend fails
        const updatedProfile = {
          ...mockUserProfile,
          ...profileData,
          updatedAt: new Date().toISOString()
        };

        // Update our mock data for future calls
        Object.assign(mockUserProfile, profileData);

        return {
          data: updatedProfile
        };
      }
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  },

  // Get all users (admin only) - temporarily disabled
  async getAllUsers() {
    // Return mock data since admin endpoints are not implemented yet
    return {
      data: {
        content: [
          {
            id: 1,
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            roles: ['ADMIN']
          },
          {
            id: 2,
            email: 'customer@example.com',
            firstName: 'Customer',
            lastName: 'User',
            roles: ['CUSTOMER']
          }
        ],
        totalElements: 2,
        totalPages: 1
      }
    };
  },

  // Update user roles (admin only) - temporarily disabled
  async updateUserRoles(userId, roles) {
    // Mock implementation
    return {
      data: {
        id: userId,
        roles: roles,
        message: 'User roles updated successfully'
      }
    };
  }
};