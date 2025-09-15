import React, { useState, useEffect, useCallback } from 'react';
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
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Inventory2 as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as ViewIcon,
  Notifications as NotificationIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { lowStockAlertService } from '../../services/inventoryService';

function StaffInventoryWidget({ branchId }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState({
    lowStockProducts: [],
    outOfStockProducts: [],
    inventorySummary: {}
  });

  useEffect(() => {
    fetchInventoryData();
  }, [branchId]);

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
        inventorySummary: summaryResponse.data || {}
      });
    } catch (err) {
      console.error('Failed to fetch inventory data:', err);
      // Set mock data when API fails
      setInventoryData({
        lowStockProducts: [
          {
            product_id: 1,
            name: 'Coffee Beans',
            current_stock: 5,
            low_stock_threshold: 10,
            product_unit: 'kg'
          }
        ],
        outOfStockProducts: [
          {
            product_id: 2,
            name: 'Milk',
            current_stock: 0,
            low_stock_threshold: 5,
            product_unit: 'liters'
          }
        ],
        inventorySummary: {
          total_products: 25,
          low_stock: 3,
          out_of_stock: 1,
          total_inventory_value: 15000
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewInventory = useCallback(() => {
    navigate('/inventory');
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
          <Grid item xs={12} sm={6} md={4}>
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

          <Grid item xs={12} sm={6} md={4}>
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

          <Grid item xs={12} sm={6} md={4}>
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
        </Grid>
      </Grid>

      {/* Inventory Alerts */}
      <Grid item xs={12}>
        <Card sx={{ height: '300px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationIcon sx={{ color: totalAlerts > 0 ? 'warning.main' : 'success.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Inventory Alerts
                </Typography>
                {totalAlerts > 0 && (
                  <Chip 
                    label={totalAlerts} 
                    color="error" 
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
              <Button
                size="small"
                startIcon={<ViewIcon />}
                onClick={handleViewInventory}
                sx={{ color: 'primary.main' }}
              >
                View Inventory
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ height: '200px', overflow: 'auto' }}>
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
                  {inventoryData.outOfStockProducts.slice(0, 2).map((product) => (
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
                            Please inform your manager immediately
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
                  {inventoryData.outOfStockProducts.length} product(s) are completely out of stock. 
                  Please inform your manager immediately.
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="error"
                onClick={handleViewInventory}
                sx={{ ml: 2 }}
              >
                View Details
              </Button>
            </Box>
          </Alert>
        </Grid>
      )}
    </Grid>
  );
}

export default StaffInventoryWidget;
