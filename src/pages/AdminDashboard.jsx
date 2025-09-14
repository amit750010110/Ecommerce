import React, { useState } from "react";
import { Container, Typography, Box, Tabs, Tab, Paper } from "@mui/material";
import { People, Inventory, Category, Receipt } from "@mui/icons-material";
import { useRoleAccess } from "../hooks/useRoleAccess";
import AdminUsersTable from "../components/AdminUsersTable";
import AdminProductsTable from "../components/AdminProductsTable";
import AdminCategoriesTable from "../components/AdminCategoriesTable";
import AdminOrdersTable from "../components/AdminOrdersTable";

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const { isAdmin } = useRoleAccess();

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" color="error">
          Access Denied
        </Typography>
        <Typography variant="body1">
          You don't have permission to access this page.
        </Typography>
      </Container>
    );
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      <Paper sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="admin tabs"
          >
            <Tab icon={<People />} label="Users" />
            <Tab icon={<Inventory />} label="Products" />
            <Tab icon={<Category />} label="Categories" />
            <Tab icon={<Receipt />} label="Orders" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <AdminUsersTable />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <AdminProductsTable />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <AdminCategoriesTable />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <AdminOrdersTable />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;
