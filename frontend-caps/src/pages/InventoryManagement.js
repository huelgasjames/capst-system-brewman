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
import Header from '../components/Header';
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
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
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
    product_unit: '',
    sale_unit: '',
    base_price: '',
    low_stock_threshold: 10,
    branch_id: '',
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

  // Set default branch_id when admin or branches are available
  useEffect(() => {
    console.log('Admin object:', admin);
    console.log('Branches array:', branches);
    console.log('Current productForm.branch_id:', productForm.branch_id);
    
    if (admin?.branch_id && branches.length > 0) {
      // For Branch Managers - set their specific branch
      console.log('Setting branch_id to admin branch:', admin.branch_id);
      setProductForm(prev => ({
        ...prev,
        branch_id: admin.branch_id
      }));
    } else if (!admin?.branch_id && branches.length > 0 && !productForm.branch_id) {
      // For SuperAdmin users - set the first branch as default
      console.log('Setting default branch to first available branch for SuperAdmin');
      setProductForm(prev => ({
        ...prev,
        branch_id: branches[0].branch_id
      }));
    }
  }, [admin, branches, productForm.branch_id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchBranches(),
        fetchCategories(),
        fetchInventorySummary(),
        fetchLowStockAlerts()
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
      
      if (response.data.success) {
        setProducts(response.data.data?.data || []);
      } else {
        console.error('API returned error:', response.data.message);
        setError('Failed to fetch products: ' + response.data.message);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to fetch products: ' + (err.message || 'Network error'));
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
      
      let branchesData = [];
      if (response.data.success) {
        branchesData = response.data.data?.data || response.data.data || [];
      } else {
        console.error('API returned error:', response.data.message);
        setError('Failed to fetch branches: ' + response.data.message);
      }
      
      console.log('Branches data:', branchesData);
      
      // Filter branches based on user role
      let filteredBranches = branchesData;
      if (admin?.branch_id) {
        // For Branch Managers, only show their assigned branch
        filteredBranches = branchesData.filter(branch => branch.branch_id === admin.branch_id);
        console.log('Filtered branches for Branch Manager:', filteredBranches);
      }
      
      setBranches(filteredBranches);
    } catch (err) {
      console.error('Failed to fetch branches:', err);
      setError('Failed to fetch branches: ' + (err.message || 'Network error'));
      setBranches([]);
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

  const fetchLowStockAlerts = async () => {
    try {
      const params = {};
      // Only add branch_id if admin has one (not for SuperAdmin)
      if (admin?.branch_id) {
        params.branch_id = admin.branch_id;
      }
      
      const response = await api.get('/inventory/low-stock-alerts', { params });
      setLowStockAlerts(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch low stock alerts:', err);
      setLowStockAlerts([]);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1) {
      fetchVariants();
    } else if (newValue === 2) {
      fetchInventoryLogs();
    } else if (newValue === 3) {
      fetchLowStockAlerts();
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!productForm.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!productForm.category.trim()) {
      setError('Category is required');
      return;
    }
    if (!productForm.product_unit.trim()) {
      setError('Product unit is required');
      return;
    }
    if (!productForm.sale_unit.trim()) {
      setError('Sale unit is required');
      return;
    }
    if (!productForm.base_price || productForm.base_price <= 0) {
      setError('Base price must be greater than 0');
      return;
    }
    if (!productForm.low_stock_threshold || productForm.low_stock_threshold < 1) {
      setError('Low stock threshold must be at least 1');
      return;
    }
    if (!productForm.branch_id) {
      setError('Branch is required');
      return;
    }

    setLoading(true);
    setError(null); // Clear any previous errors
    
    try {
      // Prepare form data
      const formData = {
        ...productForm,
        base_price: parseFloat(productForm.base_price),
        low_stock_threshold: parseInt(productForm.low_stock_threshold),
        branch_id: parseInt(productForm.branch_id)
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.product_id}`, formData);
        setSuccess('Product updated successfully');
      } else {
        await api.post('/products', formData);
        setSuccess('Product created successfully');
      }
      setProductDialog(false);
      setEditingProduct(null);
      resetProductForm();
      fetchProducts();
      fetchInventorySummary();
    } catch (err) {
      console.error('Product submission error:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors ? 
                          Object.values(err.response.data.errors).flat().join(', ') :
                          'Failed to save product';
      setError(errorMessage);
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
      product_unit: product.product_unit,
      sale_unit: product.sale_unit,
      base_price: product.base_price,
      low_stock_threshold: product.low_stock_threshold || 10,
      branch_id: product.branch_id,
      is_active: product.is_active
    });
    setError(null);
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
      product_unit: '',
      sale_unit: '',
      base_price: '',
      low_stock_threshold: 10,
      branch_id: admin?.branch_id || (branches.length > 0 ? branches[0].branch_id : ''),
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

  const getProductStockInfo = (product) => {
    // Get current stock from the product data (should be included in API response)
    const currentStock = product.current_stock || 0;
    const lowStockThreshold = product.low_stock_threshold || 10;
    
    let stockStatus = 'In Stock';
    let stockColor = 'success';
    
    if (currentStock <= 0) {
      stockStatus = 'Out of Stock';
      stockColor = 'error';
    } else if (currentStock <= lowStockThreshold) {
      stockStatus = 'Low Stock';
      stockColor = 'warning';
    }
    
    return { currentStock, stockStatus, stockColor };
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      
      <Box sx={{ p: 3 }}>
        {/* Enhanced Header */}
        <Box sx={{ 
          mb: 4, 
          p: 3, 
          background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
          borderRadius: 3,
          border: '1px solid #e0e0e0'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h3" component="h1" sx={{ 
                fontWeight: 'bold', 
                color: 'primary.main', 
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <InventoryIcon sx={{ fontSize: 40 }} />
                Inventory Management
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                Manage your coffee shop inventory, products, and stock levels
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetProductForm();
                setEditingProduct(null);
                setError(null);
                setProductDialog(true);
              }}
              size="large"
              sx={{
                bgcolor: 'primary.main',
                fontSize: '1.1rem',
                px: 3,
                py: 1.5,
                height: '48px',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(139, 69, 19, 0.3)',
                '&:hover': { 
                  bgcolor: 'primary.dark',
                  boxShadow: '0 6px 16px rgba(139, 69, 19, 0.4)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Add Product
            </Button>
          </Box>
        </Box>

      {/* Statistics Cards */}
      <Grid container spacing={4} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '140px', borderRadius: 3 }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <ProductIcon sx={{ color: '#8B4513', mr: 3, fontSize: '2.5rem' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                    Total Products
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats?.totalProducts || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '140px', borderRadius: 3 }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <WarningIcon sx={{ color: '#FF9800', mr: 3, fontSize: '2.5rem' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                    Low Stock
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats?.lowStockProducts || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '140px', borderRadius: 3 }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <WarningIcon sx={{ color: '#F44336', mr: 3, fontSize: '2.5rem' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                    Out of Stock
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats?.outOfStockProducts || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '140px', borderRadius: 3 }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <TrendingUpIcon sx={{ color: '#4CAF50', mr: 3, fontSize: '2.5rem' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                    Total Value
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ₱{(stats?.totalValue || 0).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%', borderRadius: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="inventory tabs"
            sx={{
              '& .MuiTab-root': {
                fontSize: '1.1rem',
                fontWeight: 600,
                py: 2,
                px: 3,
                minHeight: '64px',
              }
            }}
          >
            <Tab label="Products" />
            <Tab label="Product Variants" />
            <Tab label="Inventory Logs" />
            <Tab 
              label={`Low Stock Alerts ${lowStockAlerts.length > 0 ? `(${lowStockAlerts.length})` : ''}`}
              sx={{ 
                color: lowStockAlerts.length > 0 ? '#f44336' : 'inherit',
                fontWeight: lowStockAlerts.length > 0 ? 'bold' : 'normal'
              }}
            />
          </Tabs>
        </Box>

        {/* Products Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Name</TableCell>
                  <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Category</TableCell>
                  <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Base Price</TableCell>
                  <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Unit</TableCell>
                  <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Current Stock</TableCell>
                  <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Stock Status</TableCell>
                  <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Status</TableCell>
                  <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600, py: 2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => {
                  const stockInfo = getProductStockInfo(product);
                  return (
                    <TableRow key={product.product_id} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>{product.name}</TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>{product.category}</TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>₱{product.base_price}</TableCell>
                      <TableCell sx={{ fontSize: '1.1rem', py: 2 }}>{product.sale_unit}</TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                          {stockInfo.currentStock}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          label={stockInfo.stockStatus}
                          color={stockInfo.stockColor}
                          size="medium"
                          sx={{ fontSize: '1rem', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          label={product.is_active ? 'Active' : 'Inactive'}
                          color={product.is_active ? 'success' : 'default'}
                          size="medium"
                          sx={{ fontSize: '1rem', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <IconButton
                          size="large"
                          onClick={() => handleEditProduct(product)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="large" />
                        </IconButton>
                        <IconButton
                          size="large"
                          onClick={() => handleDeleteProduct(product.product_id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="large" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
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

        {/* Low Stock Alerts Tab */}
        <TabPanel value={tabValue} index={3}>
          {lowStockAlerts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No low stock alerts! All products are well stocked.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Current Stock</TableCell>
                    <TableCell>Low Stock Threshold</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Urgency</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lowStockAlerts.map((alert) => (
                    <TableRow key={alert.product_id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {alert.product_name}
                        </Typography>
                      </TableCell>
                      <TableCell>{alert.category}</TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: alert.is_out_of_stock ? 'error.main' : 'warning.main'
                          }}
                        >
                          {alert.current_stock}
                        </Typography>
                      </TableCell>
                      <TableCell>{alert.low_stock_threshold}</TableCell>
                      <TableCell>
                        <Chip
                          label={alert.stock_status}
                          color={alert.stock_color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={alert.urgency === 'critical' ? 'Critical' : 'Warning'}
                          color={alert.urgency === 'critical' ? 'error' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => {
                            resetInventoryForm();
                            setInventoryForm(prev => ({
                              ...prev,
                              product_id: alert.product_id,
                              change_type: 'restock'
                            }));
                            setInventoryDialog(true);
                          }}
                          sx={{
                            bgcolor: '#8B4513',
                            '&:hover': { bgcolor: '#A0522D' }
                          }}
                        >
                          Restock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Paper>

      {/* Product Dialog */}
      <Dialog 
        open={productDialog} 
        onClose={() => {
          setProductDialog(false);
          setError(null);
        }} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '80vh',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 3, fontSize: '1.8rem', fontWeight: 'bold' }}>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <form onSubmit={handleProductSubmit}>
          <DialogContent sx={{ px: 4, py: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, fontSize: '1.1rem' }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={4} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                  size="large"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1.2rem',
                      padding: '16px 14px',
                      height: '64px',
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Category"
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  required
                  size="large"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1.2rem',
                      padding: '16px 14px',
                      height: '64px',
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Product Unit"
                  value={productForm.product_unit}
                  onChange={(e) => setProductForm({ ...productForm, product_unit: e.target.value })}
                  required
                  size="large"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1.2rem',
                      padding: '16px 14px',
                      height: '64px',
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Sale Unit"
                  value={productForm.sale_unit}
                  onChange={(e) => setProductForm({ ...productForm, sale_unit: e.target.value })}
                  required
                  size="large"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1.2rem',
                      padding: '16px 14px',
                      height: '64px',
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="large">
                  <InputLabel sx={{ fontSize: '1.1rem' }}>Branch *</InputLabel>
                  <Select
                    value={productForm.branch_id}
                    onChange={(e) => setProductForm({ ...productForm, branch_id: e.target.value })}
                    required
                    displayEmpty
                    disabled={admin?.branch_id ? true : false} // Disable for Branch Managers
                    sx={{
                      fontSize: '1.2rem',
                      height: '64px',
                      '& .MuiSelect-select': {
                        padding: '16px 14px',
                      },
                    }}
                    renderValue={(selected) => {
                      if (!selected) {
                        return <em style={{ color: '#999', fontSize: '1.2rem' }}>Select a branch</em>;
                      }
                      const branch = branches.find(b => b.branch_id === selected);
                      return branch ? branch.name : 'Unknown Branch';
                    }}
                  >
                    <MenuItem value="" disabled sx={{ fontSize: '1.1rem' }}>
                      <em>Select a branch</em>
                    </MenuItem>
                    {branches.length > 0 ? (
                      branches.map((branch) => (
                        <MenuItem key={branch.branch_id} value={branch.branch_id} sx={{ fontSize: '1.1rem' }}>
                          {branch.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled sx={{ fontSize: '1.1rem' }}>
                        <em>Loading branches...</em>
                      </MenuItem>
                    )}
                  </Select>
                  {admin?.branch_id && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '1rem' }}>
                      Branch is automatically set to your assigned branch
                    </Typography>
                  )}
                  {/* Debug info - remove this in production */}
                  {process.env.NODE_ENV === 'development' && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontSize: '0.8rem', display: 'block' }}>
                      Debug: {branches.length} branches loaded, selected: {productForm.branch_id}
                    </Typography>
                  )}
                </FormControl>
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
                  size="large"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1.2rem',
                      padding: '16px 14px',
                      height: '64px',
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Low Stock Threshold"
                  type="number"
                  value={productForm.low_stock_threshold}
                  onChange={(e) => setProductForm({ ...productForm, low_stock_threshold: e.target.value })}
                  required
                  helperText="Alert when stock falls below this number"
                  size="large"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1.2rem',
                      padding: '16px 14px',
                      height: '64px',
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
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={productForm.is_active}
                      onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })}
                      size="large"
                    />
                  }
                  label={<Typography sx={{ fontSize: '1.2rem' }}>Active</Typography>}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 4, pt: 2 }}>
            <Button 
              onClick={() => setProductDialog(false)} 
              size="large"
              sx={{ 
                fontSize: '1.2rem',
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
              sx={{ 
                fontSize: '1.2rem',
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
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Save'}
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
      </Box>
    </Box>
  );
}

export default InventoryManagement;