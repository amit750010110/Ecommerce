import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthGuard from "./components/AuthGuard";
import Layout from "./components/Layout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Catalog from "./pages/Catalog";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import AddressBook from "./pages/AddressBook";
import AdminDashboard from "./pages/AdminDashboard";
import Wishlist from "./pages/Wishlist";
import ProductComparison from "./pages/ProductComparison";

// Role-based route component
const RoleGuard = ({ children, requiredRole }) => {
  return <AuthGuard requiredRole={requiredRole}>{children}</AuthGuard>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Public Layout Route */}
      <Route path="/" element={<Layout />}>
        {/* Default route goes to catalog */}
        <Route index element={<Catalog />} />

        {/* Catalog accessible without login */}
        <Route path="catalog" element={<Catalog />} />

        {/* Protected Routes */}
        <Route
          path="checkout"
          element={
            <AuthGuard>
              <Checkout />
            </AuthGuard>
          }
        />
        <Route
          path="orders"
          element={
            <AuthGuard>
              <Orders />
            </AuthGuard>
          }
        />
        {/* Allow "order" URL as well (singular form) */}
        <Route
          path="order"
          element={
            <AuthGuard>
              <Orders />
            </AuthGuard>
          }
        />
        <Route
          path="profile"
          element={
            <AuthGuard>
              <Profile />
            </AuthGuard>
          }
        />
        <Route
          path="addresses"
          element={
            <AuthGuard>
              <AddressBook />
            </AuthGuard>
          }
        />
        <Route
          path="wishlist"
          element={
            <AuthGuard>
              <Wishlist />
            </AuthGuard>
          }
        />
        <Route path="compare" element={<ProductComparison />} />

        {/* Admin Routes */}
        <Route
          path="admin/*"
          element={
            <RoleGuard requiredRole="ADMIN">
              <AdminDashboard />
            </RoleGuard>
          }
        />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
