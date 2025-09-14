import { useAuth } from "../contexts/AuthContext";

// Custom hook for role-based access control
// useRoleAccess: user roles check karta hai aur accessibility provide karta hai
export const useRoleAccess = () => {
  const { user, hasRole } = useAuth();

  // Check if user has specific role
  const hasAccess = (requiredRole) => {
    if (!user) return false;
    return hasRole(requiredRole);
  };

  // Check if user has any of the required roles
  const hasAnyRole = (requiredRoles) => {
    if (!user) return false;
    return requiredRoles.some(role => hasRole(role));
  };

  // Check if user has all required roles
  const hasAllRoles = (requiredRoles) => {
    if (!user) return false;
    return requiredRoles.every(role => hasRole(role));
  };

  return {
    hasAccess,
    hasAnyRole,
    hasAllRoles,
    isAdmin: hasRole('ADMIN'),
    isCustomer: hasRole('CUSTOMER')
  };
};