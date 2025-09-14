import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Box,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Edit, Refresh } from "@mui/icons-material";
import { userService } from "../services/user";
import { useNotification } from "../contexts/NotificationContext";

const AdminUsersTable = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotification();

  // useEffect: component mount pe users fetch karta hai
  useEffect(() => {
    fetchUsers();
  }, []);

  // Users fetch karta hai
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      addNotification("Failed to fetch users", "error");
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // User role update karta hai
  const handleRoleChange = async (userId, role, hasRole) => {
    try {
      const user = users.find((u) => u.id === userId);
      const newRoles = hasRole
        ? user.roles.filter((r) => r !== role)
        : [...user.roles, role];

      await userService.updateUserRoles(userId, newRoles);

      // Local state update karta hai
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === userId ? { ...u, roles: newRoles } : u))
      );

      addNotification("User roles updated successfully", "success");
    } catch (error) {
      addNotification("Failed to update user roles", "error");
      console.error("Error updating user roles:", error);
    }
  };

  if (isLoading) {
    return <Typography>Loading users...</Typography>;
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Users Management</Typography>
        <IconButton onClick={fetchUsers} disabled={isLoading}>
          <Refresh />
        </IconButton>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{`${user.firstname} ${user.lastname}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={user.roles.includes("ADMIN")}
                          onChange={(e) =>
                            handleRoleChange(user.id, "ADMIN", e.target.checked)
                          }
                          color="primary"
                        />
                      }
                      label="Admin"
                    />
                    <Chip
                      label="Customer"
                      color="default"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.enabled ? "Active" : "Inactive"}
                    color={user.enabled ? "success" : "error"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small">
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminUsersTable;
