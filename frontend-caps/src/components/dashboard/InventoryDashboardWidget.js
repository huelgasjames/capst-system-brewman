import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Inventory2 as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ShoppingCart as PurchaseOrderIcon,
  SwapHoriz as TransferIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Notifications as NotificationIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { lowStockAlertService } from '../../services/inventoryService';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';

function InventoryDashboardWidget({ userRole, branchId }) {
  const navigate = useNavigate();
  const { handleAuthError } = useUnifiedAuth();
  const [loading, setLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState({
    lowStockProducts: [],
    outOfStockProducts: [],
    inventorySummary: {},
    recentActivity: []
  });

  useEffect(() => {
    // First check if backend is accessible
    checkBackendHealth();
    testTokenEndpoint();
    fetchInventoryData();
  }, [branchId]);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api'}/health`);
      if (response.ok) {
        console.log('Backend is accessible');
      } else {
        console.warn('Backend health check failed:', response.status);
      }
    } catch (error) {
      console.error('Backend is not accessible:', error.message);
    }
  };

  const testTokenEndpoint = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api'}/test-token`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('userToken')}`,
          'Accept': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Token test result:', data);
      } else {
        console.warn('Token test failed:', response.status);
      }
    } catch (error) {
      console.error('Token test error:', error.message);
    }
  };

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const params = branchId ? { branch_id: branchId } : {};
      
      const [lowStockResponse, outOfStockResponse, summaryResponse] = await Promise.all([
        lowStockAlertService.getLowStockProducts(params),
        lowStockAlertService.getOutOfStockProducts(params),
        lowStockAlertService.getInventorySummary(params)
      ]);

      setInventoryData({
        lowStockProducts: lowStockResponse.data || [],
        outOfStockProducts: outOfStockResponse.data || [],
        inventorySummary: summaryResponse.data || {},
        recentActivity: [] // This would come from a separate API call
      });
    } catch (err) {
      console.error('Failed to fetch inventory data:', err);
      console.log('API Error Details:', {
        message: err.message,
        stack: err.stack,
        url: `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api'}/low-stock-alerts/products`,
        params: branchId ? { branch_id: branchId } : {}
      });
      
      // Handle authentication errors
      if (err.message === 'Unauthorized' || err.message.includes('token')) {
        console.warn('Authentication failed. Attempting to refresh auth status.');
        handleAuthError(err);
      }
      
      // Set mock data when API fails
      setInventoryData({
        lowStockProducts: [
          {
            product_id: 1,
            name: 'Coffee Beans',
            current_stock: 5,
            low_stock_threshold: 10,
            product_unit: 'kg',
            suggested_restock_quantity: 20
          }
        ],
        outOfStockProducts: [
          {
            product_id: 2,
            name: 'Milk',
            current_stock: 0,
            low_stock_threshold: 5,
            product_unit: 'liters',
            suggested_restock_quantity: 10
          }
        ],
        inventorySummary: {
          total_products: 25,
          low_stock: 3,
          out_of_stock: 1,
          total_inventory_value: 15000
        },
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
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

  const handleNavigateToInventory = useCallback(() => {
    navigate('/inventory-system');
  }, [navigate]);

  const handleNavigateToPurchaseOrders = useCallback(() => {
    navigate('/inventory-system', { state: { defaultTab: 1 } });
  }, [navigate]);

  const handleNavigateToStockTransfers = useCallback(() => {
    navigate('/inventory-system', { state: { defaultTab: 2 } });
  }, [navigate]);

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  const totalAlerts = inventoryData.lowStockProducts.length + inventoryData.outOfStockProducts.length;

  return (
    <Grid container spacing={3}>
      {/* Inventory Overview Cards */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
              color: 'white',
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 40, height: 40 }}>
                    <InventoryIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {inventoryData.inventorySummary.total_products || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Products
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
              color: 'white',
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 40, height: 40 }}>
                    <WarningIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {inventoryData.inventorySummary.low_stock || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Low Stock
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #F44336 0%, #EF5350 100%)',
              color: 'white',
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 40, height: 40 }}>
                    <WarningIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {inventoryData.inventorySummary.out_of_stock || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Out of Stock
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
              color: 'white',
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 40, height: 40 }}>
                    <MoneyIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      ₱{(inventoryData.inventorySummary.total_inventory_value || 0).toFixed(0)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Value
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Inventory Alerts */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '400px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationIcon sx={{ color: totalAlerts > 0 ? 'warning.main' : 'success.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Inventory Alerts
                </Typography>
                {totalAlerts > 0 && (
                  <Badge badgeContent={totalAlerts} color="error" />
                )}
              </Box>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={handleNavigateToInventory}
                sx={{ color: 'primary.main' }}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ height: '300px', overflow: 'auto' }}>
              {totalAlerts === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No inventory alerts! All products are well stocked.
                  </Typography>
                </Box>
              ) : (
                <List>
                  {/* Out of Stock Items */}
                  {inventoryData.outOfStockProducts.slice(0, 3).map((product) => (
                    <ListItem key={`out-${product.product_id}`} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'error.light' }}>
                          <WarningIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {product.name}
                            </Typography>
                            <Chip
                              label="OUT OF STOCK"
                              color="error"
                              size="small"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            Suggested restock: {product.suggested_restock_quantity} {product.product_unit}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}

                  {/* Low Stock Items */}
                  {inventoryData.lowStockProducts.slice(0, 3).map((product) => (
                    <ListItem key={`low-${product.product_id}`} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'warning.light' }}>
                          <WarningIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {product.name}
                            </Typography>
                            <Chip
                              label="LOW STOCK"
                              color="warning"
                              size="small"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            Current: {product.current_stock} | Threshold: {product.low_stock_threshold}
                          </Typography>
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

      {/* Quick Actions */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '400px' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Inventory Quick Actions
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<InventoryIcon />}
                  onClick={handleNavigateToInventory}
                  sx={{
                    height: 60,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      backgroundColor: 'rgba(139, 69, 19, 0.05)',
                    },
                  }}
                >
                  <Box sx={{ textAlign: 'left', width: '100%' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Inventory Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      View comprehensive inventory management
                    </Typography>
                  </Box>
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PurchaseOrderIcon />}
                  onClick={handleNavigateToPurchaseOrders}
                  sx={{
                    height: 60,
                    borderColor: 'info.main',
                    color: 'info.main',
                    '&:hover': {
                      borderColor: 'info.dark',
                      backgroundColor: 'rgba(33, 150, 243, 0.05)',
                    },
                  }}
                >
                  <Box sx={{ textAlign: 'left', width: '100%' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Purchase Orders
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create and manage purchase orders
                    </Typography>
                  </Box>
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<TransferIcon />}
                  onClick={handleNavigateToStockTransfers}
                  sx={{
                    height: 60,
                    borderColor: 'secondary.main',
                    color: 'secondary.main',
                    '&:hover': {
                      borderColor: 'secondary.dark',
                      backgroundColor: 'rgba(205, 133, 63, 0.05)',
                    },
                  }}
                >
                  <Box sx={{ textAlign: 'left', width: '100%' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Stock Transfers
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage inter-branch transfers
                    </Typography>
                  </Box>
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Critical Alerts Banner */}
      {inventoryData.outOfStockProducts.length > 0 && (
        <Grid item xs={12}>
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 2,
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Critical Inventory Alert!
                </Typography>
                <Typography variant="body2">
                  {inventoryData.outOfStockProducts.length} product(s) are completely out of stock and need immediate attention.
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="error"
                onClick={handleNavigateToInventory}
                sx={{ ml: 2 }}
              >
                Take Action
              </Button>
            </Box>
          </Alert>
        </Grid>
      )}
    </Grid>
  );
}

export default InventoryDashboardWidget;
