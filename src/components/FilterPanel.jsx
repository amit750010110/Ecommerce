import React, { useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Radio,
  RadioGroup,
  TextField,
  Button,
  Divider,
  Rating,
  Chip,
  InputAdornment,
  Switch,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ExpandMore,
  Search,
  Clear,
  FilterList,
  TuneRounded,
  CheckCircle,
} from "@mui/icons-material";

export default function FilterPanel({
  filters,
  updateFilters,
  categories = [],
  priceRange = [0, 1000],
  onClearFilters,
}) {
  // Initialize local state from filters
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [localPriceRange, setLocalPriceRange] = useState([
    filters.minPrice || priceRange[0],
    filters.maxPrice || priceRange[1],
  ]);

  // Derive sortBy from filters.sort
  const getSortByValue = () => {
    if (!filters.sort) return "newest";
    const { by, direction } = filters.sort;
    if (by === "price" && direction === "asc") return "price_asc";
    if (by === "price" && direction === "desc") return "price_desc";
    if (by === "name" && direction === "asc") return "name_asc";
    if (by === "name" && direction === "desc") return "name_desc";
    if (by === "id" && direction === "desc") return "newest";
    return "newest";
  };

  // Handle search
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    updateFilters({ search: value });
  };

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    const currentCategories = filters.categoryIds || [];
    const updatedCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((id) => id !== categoryId)
      : [...currentCategories, categoryId];

    updateFilters({ categoryIds: updatedCategories });
  };

  // Handle price range change
  const handlePriceChange = (event, newValue) => {
    setLocalPriceRange(newValue);
  };

  const handlePriceCommit = (event, newValue) => {
    updateFilters({
      minPrice: newValue[0],
      maxPrice: newValue[1],
    });
  };

  // Handle rating filter
  const handleRatingChange = (rating) => {
    updateFilters({
      minRating: filters.minRating === rating ? null : rating,
    });
  };

  // Handle availability filter
  const handleAvailabilityChange = (event) => {
    updateFilters({
      inStockOnly: event.target.checked,
    });
  };

  // Handle sort change
  const handleSortChange = (event) => {
    updateFilters({
      sortBy: event.target.value,
    });
  };

  // Clear all filters
  const handleClearAll = () => {
    setSearchTerm("");
    setLocalPriceRange(priceRange);
    if (onClearFilters) {
      onClearFilters();
    }
  };

  // Default categories if none provided
  const defaultCategories = [
    { id: 1, name: "Electronics" },
    { id: 2, name: "Clothing" },
    { id: 3, name: "Books" },
    { id: 4, name: "Home & Garden" },
  ];

  const categoryList = categories.length > 0 ? categories : defaultCategories;
  const activeFiltersCount = [
    filters.search,
    filters.categoryIds?.length > 0,
    filters.minPrice !== priceRange[0] || filters.maxPrice !== priceRange[1],
    filters.minRating,
    filters.inStockOnly,
    filters.sort &&
      (filters.sort.by !== "name" || filters.sort.direction !== "asc"),
  ].filter(Boolean).length;

  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      {/* Header with clear filters */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <FilterList color="primary" />
          <Typography variant="h6">Filters</Typography>
          {activeFiltersCount > 0 && (
            <Chip label={activeFiltersCount} color="primary" size="small" />
          )}
        </Box>
        <Tooltip title="Clear all filters">
          <IconButton onClick={handleClearAll} size="small">
            <Clear />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Search Filter */}
      <Box mb={2}>
        <TextField
          fullWidth
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    setSearchTerm("");
                    updateFilters({ search: "" });
                  }}
                  size="small"
                >
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </Box>

      {/* Categories Filter */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1" fontWeight="medium">
            Categories
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {categoryList?.map((category) => (
              <FormControlLabel
                key={category.id}
                control={
                  <Checkbox
                    checked={
                      filters.categoryIds?.includes(category.id.toString()) ||
                      false
                    }
                    onChange={() =>
                      handleCategoryChange(category.id.toString())
                    }
                    size="small"
                  />
                }
                label={category.name}
                sx={{ py: 0.5 }}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Price Range Filter */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1" fontWeight="medium">
            Price Range
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ px: 1 }}>
            <Slider
              value={localPriceRange}
              onChange={handlePriceChange}
              onChangeCommitted={handlePriceCommit}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `$${value}`}
              min={priceRange[0]}
              max={priceRange[1]}
              marks={[
                { value: priceRange[0], label: `$${priceRange[0]}` },
                { value: priceRange[1], label: `$${priceRange[1]}` },
              ]}
            />
            <Box display="flex" justifyContent="space-between" mt={1}>
              <TextField
                label="Min"
                type="number"
                value={localPriceRange[0]}
                onChange={(e) => {
                  const value = Math.max(priceRange[0], Number(e.target.value));
                  setLocalPriceRange([value, localPriceRange[1]]);
                  updateFilters({ minPrice: value });
                }}
                size="small"
                sx={{ width: "48%" }}
                inputProps={{ min: priceRange[0], max: priceRange[1] }}
              />
              <TextField
                label="Max"
                type="number"
                value={localPriceRange[1]}
                onChange={(e) => {
                  const value = Math.min(priceRange[1], Number(e.target.value));
                  setLocalPriceRange([localPriceRange[0], value]);
                  updateFilters({ maxPrice: value });
                }}
                size="small"
                sx={{ width: "48%" }}
                inputProps={{ min: priceRange[0], max: priceRange[1] }}
              />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Rating Filter */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1" fontWeight="medium">
            Minimum Rating
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Box
                key={rating}
                display="flex"
                alignItems="center"
                sx={{
                  cursor: "pointer",
                  p: 1,
                  borderRadius: 1,
                  "&:hover": { bgcolor: "action.hover" },
                }}
                onClick={() => handleRatingChange(rating)}
              >
                <Rating value={rating} readOnly size="small" />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  & Up
                </Typography>
                {filters.minRating === rating && (
                  <CheckCircle
                    color="primary"
                    sx={{ ml: "auto", fontSize: 16 }}
                  />
                )}
              </Box>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Availability Filter */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1" fontWeight="medium">
            Availability
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.inStockOnly || false}
                onChange={handleAvailabilityChange}
                size="small"
              />
            }
            label="In Stock Only"
          />
        </AccordionDetails>
      </Accordion>

      {/* Sort Order */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1" fontWeight="medium">
            Sort By
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <RadioGroup value={getSortByValue()} onChange={handleSortChange}>
            <FormControlLabel
              value="newest"
              control={<Radio size="small" />}
              label="Newest"
            />
            <FormControlLabel
              value="price_asc"
              control={<Radio size="small" />}
              label="Price: Low to High"
            />
            <FormControlLabel
              value="price_desc"
              control={<Radio size="small" />}
              label="Price: High to Low"
            />
            <FormControlLabel
              value="name_asc"
              control={<Radio size="small" />}
              label="Name: A-Z"
            />
            <FormControlLabel
              value="name_desc"
              control={<Radio size="small" />}
              label="Name: Z-A"
            />
          </RadioGroup>
        </AccordionDetails>
      </Accordion>

      {/* Clear Filters Button */}
      {activeFiltersCount > 0 && (
        <Box mt={2}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Clear />}
            onClick={handleClearAll}
          >
            Clear All Filters
          </Button>
        </Box>
      )}
    </Box>
  );
}
