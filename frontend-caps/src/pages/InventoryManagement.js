import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Fab,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Inventory2 as InventoryIcon,
  LocalBar as ProductIcon,
  Category as CategoryIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function InventoryManagement() {
  const { admin } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Dialog states
  const [productDialog, setProductDialog] = useState(false);
  const [variantDialog, setVariantDialog] = useState(false);
  const [inventoryDialog, setInventoryDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingVariant, setEditingVariant] = useState(null);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    description: '',
    product_unit: '',
    sale_unit: '',
    base_price: '',
    branch_id: admin?.branch_id || '',
    is_active: true
  });

  const [variantForm, setVariantForm] = useState({
    product_id: '',
    name: '',
    price: '',
    description: '',
    is_active: true
  });

  const [inventoryForm, setInventoryForm] = useState({
    product_id: '',
    branch_id: admin?.branch_id || '',
    change_type: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0],
    supplier_id: '',
    notes: ''
  });

  // Statistics
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalValue: 0
  });

  useEffect(() => {
    if (admin) {
      fetchData();
    }
  }, [admin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchBranches(),
        fetchCategories(),
        fetchInventorySummary()
      ]);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = {};
      // Only add branch_id if admin has one (not for SuperAdmin)
      if (admin?.branch_id) {
        params.branch_id = admin.branch_id;
      }
      
      console.log('Fetching products with params:', params);
      const response = await api.get('/products', { params });
      console.log('Products response:', response.data);
      setProducts(response.data.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const fetchVariants = async (productId = null) => {
    try {
      const params = productId ? { product_id: productId } : {};
      const response = await api.get('/product-variants', { params });
      setVariants(response.data.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch variants:', err);
    }
  };

  const fetchInventoryLogs = async () => {
    try {
      const params = {};
      // Only add branch_id if admin has one (not for SuperAdmin)
      if (admin?.branch_id) {
        params.branch_id = admin.branch_id;
      }
      
      const response = await api.get('/inventory/logs', { params });
      setInventoryLogs(response.data.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch inventory logs:', err);
    }
  };

  const fetchBranches = async () => {
    try {
      console.log('Fetching branches...');
      const response = await api.get('/branches');
      console.log('Branches response:', response.data);
      setBranches(response.data.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchInventorySummary = async () => {
    try {
      const params = {};
      // Only add branch_id if admin has one (not for SuperAdmin)
      if (admin?.branch_id) {
        params.branch_id = admin.branch_id;
      }
      
      const response = await api.get('/inventory/summary', { params });
      const summaryData = response.data?.data || {};
      setStats({
        totalProducts: summaryData.total_products || 0,
        lowStockProducts: summaryData.low_stock_products || 0,
        outOfStockProducts: summaryData.out_of_stock_products || 0,
        totalValue: summaryData.total_inventory_value || 0
      });
    } catch (err) {
      console.error('Failed to fetch inventory summary:', err);
      // Set default values on error
      setStats({
        totalProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        totalValue: 0
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1) {
      fetchVariants();
    } else if (newValue === 2) {
      fetchInventoryLogs();
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.product_id}`, productForm);
        setSuccess('Product updated successfully');
      } else {
        await api.post('/products', productForm);
        setSuccess('Product created successfully');
      }
      setProductDialog(false);
      setEditingProduct(null);
      resetProductForm();
      fetchProducts();
      fetchInventorySummary();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleVariantSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingVariant) {
        await api.put(`/product-variants/${editingVariant.variant_id}`, variantForm);
        setSuccess('Product variant updated successfully');
      } else {
        await api.post('/product-variants', variantForm);
        setSuccess('Product variant created successfully');
      }
      setVariantDialog(false);
      setEditingVariant(null);
      resetVariantForm();
      fetchVariants();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product variant');
    } finally {
      setLoading(false);
    }
  };

  const handleInventorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/inventory/logs', inventoryForm);
      setSuccess('Inventory log created successfully');
      setInventoryDialog(false);
      resetInventoryForm();
      fetchInventoryLogs();
      fetchInventorySummary();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create inventory log');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      description: product.description || '',
      product_unit: product.product_unit,
      sale_unit: product.sale_unit,
      base_price: product.base_price,
      branch_id: product.branch_id,
      is_active: product.is_active
    });
    setProductDialog(true);
  };

  const handleEditVariant = (variant) => {
    setEditingVariant(variant);
    setVariantForm({
      product_id: variant.product_id,
      name: variant.name,
      price: variant.price,
      description: variant.description || '',
      is_active: variant.is_active
    });
    setVariantDialog(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${productId}`);
        setSuccess('Product deleted successfully');
        fetchProducts();
        fetchInventorySummary();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (window.confirm('Are you sure you want to delete this product variant?')) {
      try {
        await api.delete(`/product-variants/${variantId}`);
        setSuccess('Product variant deleted successfully');
        fetchVariants();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete product variant');
      }
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      category: '',
      description: '',
      product_unit: '',
      sale_unit: '',
      base_price: '',
      branch_id: admin?.branch_id || '',
      is_active: true
    });
  };

  const resetVariantForm = () => {
    setVariantForm({
      product_id: '',
      name: '',
      price: '',
      description: '',
      is_active: true
    });
  };

  const resetInventoryForm = () => {
    setInventoryForm({
      product_id: '',
      branch_id: admin?.branch_id || '',
      change_type: '',
      quantity: '',
      date: new Date().toISOString().split('T')[0],
      supplier_id: '',
      notes: ''
    });
  };

  const getStockStatus = (product) => {
    // This would need to be calculated based on inventory logs
    // For now, we'll use a placeholder
    return 'In Stock';
  };

  const getStockColor = (status) => {
    switch (status) {
      case 'Low Stock': return 'warning';
      case 'Out of Stock': return 'error';
      default: return 'success';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#8B4513', fontWeight: 'bold' }}>
          Inventory Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetProductForm();
            setEditingProduct(null);
            setProductDialog(true);
          }}
          sx={{
            bgcolor: '#8B4513',
            '&:hover': { bgcolor: '#A0522D' }
          }}
        >
          Add Product
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ProductIcon sx={{ color: '#8B4513', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Products
                  </Typography>
                  <Typography variant="h5">
                    {stats?.totalProducts || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon sx={{ color: '#FF9800', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Low Stock
                  </Typography>
                  <Typography variant="h5">
                    {stats?.lowStockProducts || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon sx={{ color: '#F44336', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Out of Stock
                  </Typography>
                  <Typography variant="h5">
                    {stats?.outOfStockProducts || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ color: '#4CAF50', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Value
                  </Typography>
                  <Typography variant="h5">
                    ₱{(stats?.totalValue || 0).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="inventory tabs">
            <Tab label="Products" />
            <Tab label="Product Variants" />
            <Tab label="Inventory Logs" />
          </Tabs>
        </Box>

        {/* Products Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Base Price</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.product_id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>₱{product.base_price}</TableCell>
                    <TableCell>{product.sale_unit}</TableCell>
                    <TableCell>
                      <Chip
                        label={product.is_active ? 'Active' : 'Inactive'}
                        color={product.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditProduct(product)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteProduct(product.product_id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Product Variants Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                resetVariantForm();
                setEditingVariant(null);
                setVariantDialog(true);
              }}
            >
              Add Variant
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Variant Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {variants.map((variant) => (
                  <TableRow key={variant.variant_id}>
                    <TableCell>{variant.product?.name}</TableCell>
                    <TableCell>{variant.name}</TableCell>
                    <TableCell>₱{variant.price}</TableCell>
                    <TableCell>
                      <Chip
                        label={variant.is_active ? 'Active' : 'Inactive'}
                        color={variant.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditVariant(variant)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteVariant(variant.variant_id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Inventory Logs Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                resetInventoryForm();
                setInventoryDialog(true);
              }}
            >
              Add Inventory Log
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Admin</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventoryLogs.map((log) => (
                  <TableRow key={log.log_id}>
                    <TableCell>{new Date(log.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{log.product?.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.change_type}
                        color={log.change_type === 'restock' ? 'success' : log.change_type === 'waste' ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{log.quantity}</TableCell>
                    <TableCell>{log.unit || log.product?.sale_unit || 'N/A'}</TableCell>
                    <TableCell>{log.admin?.name}</TableCell>
                    <TableCell>{log.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Product Dialog */}
      <Dialog open={productDialog} onClose={() => setProductDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <form onSubmit={handleProductSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Category"
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Product Unit"
                  value={productForm.product_unit}
                  onChange={(e) => setProductForm({ ...productForm, product_unit: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Sale Unit"
                  value={productForm.sale_unit}
                  onChange={(e) => setProductForm({ ...productForm, sale_unit: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Base Price"
                  type="number"
                  step="0.01"
                  value={productForm.base_price}
                  onChange={(e) => setProductForm({ ...productForm, base_price: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Branch</InputLabel>
                  <Select
                    value={productForm.branch_id}
                    onChange={(e) => setProductForm({ ...productForm, branch_id: e.target.value })}
                    required
                  >
                    {branches.map((branch) => (
                      <MenuItem key={branch.branch_id} value={branch.branch_id}>
                        {branch.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={productForm.is_active}
                      onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProductDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Variant Dialog */}
      <Dialog open={variantDialog} onClose={() => setVariantDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingVariant ? 'Edit Product Variant' : 'Add New Product Variant'}
        </DialogTitle>
        <form onSubmit={handleVariantSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Product</InputLabel>
                  <Select
                    value={variantForm.product_id}
                    onChange={(e) => setVariantForm({ ...variantForm, product_id: e.target.value })}
                    required
                  >
                    {products.map((product) => (
                      <MenuItem key={product.product_id} value={product.product_id}>
                        {product.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Variant Name"
                  value={variantForm.name}
                  onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  step="0.01"
                  value={variantForm.price}
                  onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={variantForm.description}
                  onChange={(e) => setVariantForm({ ...variantForm, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={variantForm.is_active}
                      onChange={(e) => setVariantForm({ ...variantForm, is_active: e.target.checked })}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setVariantDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Inventory Log Dialog */}
      <Dialog 
        open={inventoryDialog} 
        onClose={() => setInventoryDialog(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            minHeight: '80vh',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 2, 
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          bgcolor: 'background.paper'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              <InventoryIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Add Inventory Log
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Record inventory changes and track stock movements
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 4, pb: 2 }}>
          <Box component="form" onSubmit={handleInventorySubmit}>
            <Grid container spacing={4}>
              {/* Product Selection Section */}
              <Grid item xs={12}>
                <Box sx={{ 
                  mb: 4, 
                  p: 3, 
                  bgcolor: 'rgba(139, 69, 19, 0.05)', 
                  borderRadius: 2,
                  border: '1px solid rgba(139, 69, 19, 0.1)'
                }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 600, 
                    color: 'primary.main', 
                    mb: 3,
                    pb: 2,
                    borderBottom: '3px solid',
                    borderColor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <ProductIcon fontSize="large" />
                    Product Selection
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <FormControl fullWidth variant="outlined" size="large">
                        <InputLabel sx={{ fontSize: '1.1rem' }}>Product *</InputLabel>
                        <Select
                          value={inventoryForm.product_id}
                          onChange={(e) => setInventoryForm({ ...inventoryForm, product_id: e.target.value })}
                          required
                          sx={{
                            fontSize: '1.1rem',
                            height: '56px',
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main',
                              borderWidth: 2,
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main',
                              borderWidth: 3,
                            },
                          }}
                        >
                          {products.map((product) => (
                            <MenuItem key={product.product_id} value={product.product_id} sx={{ fontSize: '1.1rem' }}>
                              {product.name} - {product.category}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ 
                        p: 2, 
                        bgcolor: 'rgba(139, 69, 19, 0.1)', 
                        borderRadius: 1,
                        border: '1px solid rgba(139, 69, 19, 0.2)'
                      }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Current Stock
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {inventoryForm.product_id ? 
                            (products.find(p => p.product_id === inventoryForm.product_id)?.current_stock || 'N/A') : 
                            'Select Product'
                          }
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Inventory Change Section */}
              <Grid item xs={12}>
                <Box sx={{ 
                  mb: 4, 
                  p: 3, 
                  bgcolor: 'rgba(139, 69, 19, 0.05)', 
                  borderRadius: 2,
                  border: '1px solid rgba(139, 69, 19, 0.1)'
                }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 600, 
                    color: 'primary.main', 
                    mb: 3,
                    pb: 2,
                    borderBottom: '3px solid',
                    borderColor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <TrendingUpIcon fontSize="large" />
                    Inventory Change
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth variant="outlined" size="large">
                        <InputLabel sx={{ fontSize: '1.1rem' }}>Change Type *</InputLabel>
                        <Select
                          value={inventoryForm.change_type}
                          onChange={(e) => setInventoryForm({ ...inventoryForm, change_type: e.target.value })}
                          required
                          sx={{
                            fontSize: '1.1rem',
                            height: '56px',
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main',
                              borderWidth: 2,
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main',
                              borderWidth: 3,
                            },
                          }}
                        >
                          <MenuItem value="restock" sx={{ fontSize: '1.1rem' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CheckCircleIcon color="success" />
                              Restock
                            </Box>
                          </MenuItem>
                          <MenuItem value="sale" sx={{ fontSize: '1.1rem' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TrendingUpIcon color="info" />
                              Sale
                            </Box>
                          </MenuItem>
                          <MenuItem value="waste" sx={{ fontSize: '1.1rem' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <WarningIcon color="error" />
                              Waste
                            </Box>
                          </MenuItem>
                          <MenuItem value="adjustment" sx={{ fontSize: '1.1rem' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EditIcon color="warning" />
                              Adjustment
                            </Box>
                          </MenuItem>
                          <MenuItem value="return" sx={{ fontSize: '1.1rem' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CheckCircleIcon color="success" />
                              Return
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Quantity *"
                        type="number"
                        value={inventoryForm.quantity}
                        onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })}
                        required
                        variant="outlined"
                        size="large"
                        helperText="Enter positive number for restock/return, negative for sale/waste"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontSize: '1.1rem',
                            padding: '16px 14px',
                            height: '56px',
                            '&:hover fieldset': {
                              borderColor: 'primary.main',
                              borderWidth: 2,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'primary.main',
                              borderWidth: 3,
                            },
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: '1.1rem',
                          },
                          '& .MuiFormHelperText-root': {
                            fontSize: '1rem',
                          },
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Date"
                        type="date"
                        value={inventoryForm.date || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setInventoryForm({ ...inventoryForm, date: e.target.value })}
                        variant="outlined"
                        size="large"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontSize: '1.1rem',
                            padding: '16px 14px',
                            height: '56px',
                            '&:hover fieldset': {
                              borderColor: 'primary.main',
                              borderWidth: 2,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'primary.main',
                              borderWidth: 3,
                            },
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: '1.1rem',
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Additional Information Section */}
              <Grid item xs={12}>
                <Box sx={{ 
                  mb: 4, 
                  p: 3, 
                  bgcolor: 'rgba(139, 69, 19, 0.05)', 
                  borderRadius: 2,
                  border: '1px solid rgba(139, 69, 19, 0.1)'
                }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 600, 
                    color: 'primary.main', 
                    mb: 3,
                    pb: 2,
                    borderBottom: '3px solid',
                    borderColor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <CategoryIcon fontSize="large" />
                    Additional Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined" size="large">
                        <InputLabel sx={{ fontSize: '1.1rem' }}>Branch *</InputLabel>
                        <Select
                          value={inventoryForm.branch_id}
                          onChange={(e) => setInventoryForm({ ...inventoryForm, branch_id: e.target.value })}
                          required
                          sx={{
                            fontSize: '1.1rem',
                            height: '56px',
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main',
                              borderWidth: 2,
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main',
                              borderWidth: 3,
                            },
                          }}
                        >
                          {branches.map((branch) => (
                            <MenuItem key={branch.branch_id} value={branch.branch_id} sx={{ fontSize: '1.1rem' }}>
                              {branch.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined" size="large">
                        <InputLabel sx={{ fontSize: '1.1rem' }}>Supplier (Optional)</InputLabel>
                        <Select
                          value={inventoryForm.supplier_id || ''}
                          onChange={(e) => setInventoryForm({ ...inventoryForm, supplier_id: e.target.value })}
                          sx={{
                            fontSize: '1.1rem',
                            height: '56px',
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main',
                              borderWidth: 2,
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main',
                              borderWidth: 3,
                            },
                          }}
                        >
                          <MenuItem value="" sx={{ fontSize: '1.1rem' }}>
                            <em>No Supplier</em>
                          </MenuItem>
                          {/* Add suppliers here when available */}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Notes"
                        multiline
                        rows={4}
                        value={inventoryForm.notes}
                        onChange={(e) => setInventoryForm({ ...inventoryForm, notes: e.target.value })}
                        variant="outlined"
                        size="large"
                        placeholder="Add any additional notes about this inventory change..."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontSize: '1.1rem',
                            '&:hover fieldset': {
                              borderColor: 'primary.main',
                              borderWidth: 2,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'primary.main',
                              borderWidth: 3,
                            },
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: '1.1rem',
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 4, pt: 2, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
          <Button 
            onClick={() => setInventoryDialog(false)} 
            size="large"
            sx={{ 
              fontSize: '1.1rem',
              px: 4,
              py: 1.5,
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.dark',
                backgroundColor: 'rgba(139, 69, 19, 0.05)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading} 
            size="large"
            onClick={handleInventorySubmit}
            sx={{ 
              fontSize: '1.1rem',
              px: 4,
              py: 1.5,
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '&:disabled': {
                backgroundColor: 'rgba(139, 69, 19, 0.3)',
              }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Inventory Log'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default InventoryManagement;