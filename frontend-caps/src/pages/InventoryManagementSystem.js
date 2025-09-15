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
  Tabs,
  Tab,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Badge,
  Divider,
} from '@mui/material';
import {
  Inventory2 as InventoryIcon,
  ShoppingCart as PurchaseOrderIcon,
  SwapHoriz as TransferIcon,
  Tune as AdjustmentIcon,
  Assignment as CountIcon,
  Business as SupplierIcon,
  Warning as AlertIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  LocalShipping as ShippingIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  DateRange as DateRangeIcon,
  Notifications as NotificationIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useUnifiedAuth } from '../contexts/UnifiedAuthContext';
import PurchaseOrderManagement from '../components/inventory/PurchaseOrderManagement';
import StockTransferManagement from '../components/inventory/StockTransferManagement';
import { lowStockAlertService } from '../services/inventoryService';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-system-tabpanel-${index}`}
      aria-labelledby={`inventory-system-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function InventoryManagementSystem() {
  const { user } = useUnifiedAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Dashboard data
  const [dashboardData, setDashboardData] = useState({
    lowStockProducts: [],
    outOfStockProducts: [],
    inventorySummary: {},
    recentActivity: []
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchLowStockProducts(),
        fetchOutOfStockProducts(),
        fetchInventorySummary()
      ]);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      const response = await lowStockAlertService.getLowStockProducts();
      setDashboardData(prev => ({
        ...prev,
        lowStockProducts: response.data || []
      }));
    } catch (err) {
      console.error('Failed to fetch low stock products:', err);
    }
  };

  const fetchOutOfStockProducts = async () => {
    try {
      const response = await lowStockAlertService.getOutOfStockProducts();
      setDashboardData(prev => ({
        ...prev,
        outOfStockProducts: response.data || []
      }));
    } catch (err) {
      console.error('Failed to fetch out of stock products:', err);
    }
  };

  const fetchInventorySummary = async () => {
    try {
      const response = await lowStockAlertService.getInventorySummary();
      setDashboardData(prev => ({
        ...prev,
        inventorySummary: response.data || {}
      }));
    } catch (err) {
      console.error('Failed to fetch inventory summary:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'out_of_stock': return 'error';
      case 'low_stock': return 'warning';
      case 'in_stock': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
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
                Inventory Management System
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                Comprehensive inventory management with purchase orders, stock transfers, and automated alerts
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<NotificationIcon />}
                onClick={fetchDashboardData}
                size="large"
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: 'rgba(139, 69, 19, 0.05)',
                  }
                }}
              >
                Refresh Data
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={4} sx={{ mb: 5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '140px', borderRadius: 3 }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <InventoryIcon sx={{ color: '#8B4513', mr: 3, fontSize: '2.5rem' }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                      Total Products
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {dashboardData.inventorySummary.total_products || 0}
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
                  <AlertIcon sx={{ color: '#FF9800', mr: 3, fontSize: '2.5rem' }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                      Low Stock
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {dashboardData.inventorySummary.low_stock || 0}
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
                  <AlertIcon sx={{ color: '#F44336', mr: 3, fontSize: '2.5rem' }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                      Out of Stock
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {dashboardData.inventorySummary.out_of_stock || 0}
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
                  <MoneyIcon sx={{ color: '#4CAF50', mr: 3, fontSize: '2.5rem' }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                      Total Value
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      ₱{(dashboardData.inventorySummary.total_inventory_value || 0).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Paper sx={{ width: '100%', borderRadius: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="inventory system tabs"
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
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DashboardIcon />
                    Dashboard
                    {(dashboardData.lowStockProducts.length > 0 || dashboardData.outOfStockProducts.length > 0) && (
                      <Badge 
                        badgeContent={dashboardData.lowStockProducts.length + dashboardData.outOfStockProducts.length} 
                        color="error"
                      />
                    )}
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PurchaseOrderIcon />
                    Purchase Orders
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TransferIcon />
                    Stock Transfers
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AdjustmentIcon />
                    Stock Adjustments
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CountIcon />
                    Inventory Counts
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SupplierIcon />
                    Suppliers
                  </Box>
                } 
              />
            </Tabs>
          </Box>

          {/* Dashboard Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={4}>
              {/* Low Stock Alerts */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '500px' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AlertIcon sx={{ color: 'warning.main', mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Low Stock Alerts
                      </Typography>
                      <Badge 
                        badgeContent={dashboardData.lowStockProducts.length} 
                        color="warning"
                        sx={{ ml: 2 }}
                      />
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ height: '400px', overflow: 'auto' }}>
                      {dashboardData.lowStockProducts.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary">
                            No low stock alerts! All products are well stocked.
                          </Typography>
                        </Box>
                      ) : (
                        <List>
                          {dashboardData.lowStockProducts.map((product) => (
                            <ListItem key={product.product_id} sx={{ px: 0 }}>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'warning.light' }}>
                                  <AlertIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                      {product.name}
                                    </Typography>
                                    <Chip
                                      label={product.status_with_color?.status}
                                      color={product.status_with_color?.color}
                                      size="small"
                                    />
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    <Typography variant="body2" color="text.secondary">
                                      Current: {product.current_stock} | Threshold: {product.low_stock_threshold}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Suggested restock: {product.suggested_restock_quantity} {product.product_unit}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Out of Stock Alerts */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '500px' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AlertIcon sx={{ color: 'error.main', mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Out of Stock Alerts
                      </Typography>
                      <Badge 
                        badgeContent={dashboardData.outOfStockProducts.length} 
                        color="error"
                        sx={{ ml: 2 }}
                      />
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ height: '400px', overflow: 'auto' }}>
                      {dashboardData.outOfStockProducts.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary">
                            No out of stock products! All items are available.
                          </Typography>
                        </Box>
                      ) : (
                        <List>
                          {dashboardData.outOfStockProducts.map((product) => (
                            <ListItem key={product.product_id} sx={{ px: 0 }}>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'error.light' }}>
                                  <AlertIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                      {product.name}
                                    </Typography>
                                    <Chip
                                      label="OUT OF STOCK"
                                      color="error"
                                      size="small"
                                    />
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    <Typography variant="body2" color="text.secondary">
                                      Category: {product.category}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Suggested restock: {product.suggested_restock_quantity} {product.product_unit}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Inventory Summary by Category */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Inventory Summary by Category
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={3}>
                      {dashboardData.inventorySummary.categories && Object.entries(dashboardData.inventorySummary.categories).map(([category, data]) => (
                        <Grid item xs={12} sm={6} md={4} key={category}>
                          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                              {category}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">Total:</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.total}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="success.main">In Stock:</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.in_stock}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="warning.main">Low Stock:</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.low_stock}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="error.main">Out of Stock:</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.out_of_stock}</Typography>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Purchase Orders Tab */}
          <TabPanel value={tabValue} index={1}>
            <PurchaseOrderManagement />
          </TabPanel>

          {/* Stock Transfers Tab */}
          <TabPanel value={tabValue} index={2}>
            <StockTransferManagement />
          </TabPanel>

          {/* Stock Adjustments Tab */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <AdjustmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                Stock Adjustment Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                This module is under development. It will allow you to create and manage stock adjustments.
              </Typography>
            </Box>
          </TabPanel>

          {/* Inventory Counts Tab */}
          <TabPanel value={tabValue} index={4}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CountIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                Inventory Count Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                This module is under development. It will allow you to conduct physical inventory counts.
              </Typography>
            </Box>
          </TabPanel>

          {/* Suppliers Tab */}
          <TabPanel value={tabValue} index={5}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SupplierIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                Supplier Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                This module is under development. It will allow you to manage supplier information and relationships.
              </Typography>
            </Box>
          </TabPanel>
        </Paper>

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

export default InventoryManagementSystem;
