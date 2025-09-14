import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Fab,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  PhotoCamera,
  Visibility,
  Search,
  FilterList,
} from "@mui/icons-material";
import { useNotification } from "../contexts/NotificationContext";
import { catalogService } from "../services/catalog";

const AdminProductsTable = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    stockQuantity: "",
    active: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { addNotification } = useNotification();

  // Mock categories (since backend categories might not be fully implemented)
  const categories = [
    { id: 1, name: "Electronics" },
    { id: 2, name: "Clothing" },
    { id: 3, name: "Books" },
    { id: 4, name: "Home & Garden" },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await catalogService.getProducts({
        page: 0,
        size: 100, // Get more products for admin view
      });
      setProducts(response.data.content || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products");
      addNotification("Failed to fetch products", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      categoryId: "",
      stockQuantity: "",
      active: true,
    });
    setImageFile(null);
    setImagePreview(null);
    setOpenDialog(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      categoryId: product.category?.id || "",
      stockQuantity: product.stockQuantity || "",
      active: product.active !== false,
    });
    setImageFile(null);
    setImagePreview(product.images?.[0]?.url || null);
    setOpenDialog(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await catalogService.deleteProduct(productId);
        addNotification("Product deleted successfully!", "success");
        fetchProducts(); // Refresh the list
      } catch (err) {
        console.error("Error deleting product:", err);
        addNotification("Failed to delete product", "error");
      }
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      // Basic validation
      if (!formData.name || !formData.price) {
        addNotification("Name and price are required", "error");
        return;
      }

      if (editingProduct) {
        // Update existing product
        await catalogService.updateProduct(editingProduct.id, formData);
        if (imageFile) {
          await catalogService.uploadProductImage(editingProduct.id, imageFile);
        }
      } else {
        // Create new product
        const product = await catalogService.createProduct(formData);
        if (imageFile && product.id) {
          await catalogService.uploadProductImage(product.id, imageFile);
        }
      }

      addNotification(
        `Product ${editingProduct ? "updated" : "created"} successfully!`,
        "success"
      );
      setOpenDialog(false);

      // Refresh products list
      fetchProducts();
    } catch (err) {
      console.error("Error saving product:", err);
      addNotification("Failed to save product", "error");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !categoryFilter || product.category?.id == categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Product Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant={viewMode === "table" ? "contained" : "outlined"}
            onClick={() => setViewMode("table")}
          >
            Table View
          </Button>
          <Button
            variant={viewMode === "grid" ? "contained" : "outlined"}
            onClick={() => setViewMode("grid")}
          >
            Grid View
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filter Controls */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <Search sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Category Filter</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              label="Category Filter"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateProduct}
            sx={{ height: "56px" }}
          >
            Add Product
          </Button>
        </Grid>
      </Grid>

      {/* Products Display */}
      {viewMode === "table" ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Avatar
                      src={product.images?.[0]?.url || product.imageUrl}
                      alt={product.name}
                      variant="rounded"
                      sx={{ width: 60, height: 60 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">{product.name}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {product.description}
                    </Typography>
                  </TableCell>
                  <TableCell>{product.category?.name || "N/A"}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>{product.stockQuantity || "N/A"}</TableCell>
                  <TableCell>
                    <Chip
                      label={product.active ? "Active" : "Inactive"}
                      color={product.active ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteProduct(product.id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={
                    product.images?.[0]?.url ||
                    product.imageUrl ||
                    "/placeholder-product.jpg"
                  }
                  alt={product.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="h3" noWrap>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {product.description}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mt={1}>
                    <Typography variant="h6" color="primary">
                      ${product.price}
                    </Typography>
                    <Chip
                      label={product.active ? "Active" : "Inactive"}
                      color={product.active ? "success" : "default"}
                      size="small"
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => handleEditProduct(product)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Delete />}
                    color="error"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Product Form Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingProduct ? "Edit Product" : "Create New Product"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Stock Quantity"
                type="number"
                value={formData.stockQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, stockQuantity: e.target.value })
                }
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={2}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                >
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                {imagePreview && (
                  <Avatar
                    src={imagePreview}
                    alt="Preview"
                    variant="rounded"
                    sx={{ width: 100, height: 100 }}
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProduct ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProductsTable;
